import { NextRequest, NextResponse } from 'next/server';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';
import { updateUser, getUser } from '@/lib/firebase/firestore';
import { extractDocumentData } from '@/lib/langchain/chains';
import Tesseract from 'tesseract.js';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const documentType = formData.get('documentType') as string;

    if (!file || !userId || !documentType) {
      return NextResponse.json(
        { success: false, error: 'File, User ID, and Document Type are required' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Firebase Storage
    const fileName = `${userId}/${documentType}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `documents/${fileName}`);
    await uploadBytes(storageRef, buffer, {
      contentType: file.type,
    });

    // Get download URL
    const downloadUrl = await getDownloadURL(storageRef);

    // Perform OCR if it's an image
    let extractedData = {};
    if (file.type.startsWith('image/')) {
      try {
        // Perform OCR
        const ocrResult = await Tesseract.recognize(
          buffer,
          'eng',
          {
            logger: (m) => console.log(m),
          }
        );

        // Extract structured data using AI
        extractedData = await extractDocumentData(documentType, ocrResult.data.text);
      } catch (ocrError) {
        console.error('OCR error:', ocrError);
        // Continue without extracted data
      }
    }

    // Update user document in Firestore
    const user = await getUser(userId);
    if (user) {
      const updatedDocuments = {
        ...user.documents,
        [documentType]: {
          type: documentType,
          name: file.name,
          fileUrl: downloadUrl,
          fileName: file.name,
          uploadedAt: new Date(),
          extractedData,
        },
      };

      await updateUser(userId, { documents: updatedDocuments });
    }

    return NextResponse.json({
      success: true,
      document: {
        type: documentType,
        name: file.name,
        fileUrl: downloadUrl,
        fileName: file.name,
        extractedData,
      },
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
