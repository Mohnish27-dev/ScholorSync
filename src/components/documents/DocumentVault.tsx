'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Upload,
  FileText,
  Check,
  Loader2,
  Eye,
  Trash2,
  Sparkles,
  Download,
  AlertCircle,
} from 'lucide-react';
import type { UserDocument } from '@/types';

interface DocumentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

const documentTypes: DocumentType[] = [
  {
    id: 'incomeCert',
    name: 'Income Certificate',
    description: 'Annual income certificate from authorized authority',
    required: true,
  },
  {
    id: 'casteCert',
    name: 'Caste Certificate',
    description: 'Category/caste certificate (OBC/SC/ST/EWS)',
    required: false,
  },
  {
    id: 'marksheet',
    name: 'Marksheet',
    description: 'Latest academic marksheet or grade card',
    required: true,
  },
  {
    id: 'domicile',
    name: 'Domicile Certificate',
    description: 'State domicile or residence proof',
    required: false,
  },
  {
    id: 'aadhaar',
    name: 'Aadhaar Card',
    description: 'Aadhaar card for identity verification',
    required: true,
  },
  {
    id: 'bankPassbook',
    name: 'Bank Passbook',
    description: 'First page of bank passbook with account details',
    required: true,
  },
];

interface DocumentVaultProps {
  documents: Record<string, UserDocument | undefined>;
  onUpload: (docType: string, file: File) => Promise<void>;
  onDelete: (docType: string) => Promise<void>;
  onExtract: (docType: string) => Promise<Record<string, unknown>>;
}

export function DocumentVault({
  documents,
  onUpload,
  onDelete,
  onExtract,
}: DocumentVaultProps) {
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [extractingDoc, setExtractingDoc] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [extractedData, setExtractedData] = useState<Record<string, unknown> | null>(null);

  const uploadedCount = Object.values(documents).filter(Boolean).length;
  const requiredCount = documentTypes.filter((d) => d.required).length;
  const requiredUploaded = documentTypes.filter(
    (d) => d.required && documents[d.id]
  ).length;

  const handleFileChange = useCallback(
    async (docType: string, event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploadingDoc(docType);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      try {
        await onUpload(docType, file);
        setUploadProgress(100);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        clearInterval(progressInterval);
        setTimeout(() => {
          setUploadingDoc(null);
          setUploadProgress(0);
        }, 500);
      }
    },
    [onUpload]
  );

  const handleExtract = async (docType: string) => {
    setExtractingDoc(docType);
    try {
      const data = await onExtract(docType);
      setExtractedData(data);
    } catch (error) {
      console.error('Extraction failed:', error);
    } finally {
      setExtractingDoc(null);
    }
  };

  const handleDelete = async (docType: string) => {
    try {
      await onDelete(docType);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Vault
          </CardTitle>
          <CardDescription>
            Upload your documents once and auto-fill applications instantly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Documents Uploaded</span>
              <span className="font-medium">
                {uploadedCount} / {documentTypes.length}
              </span>
            </div>
            <Progress value={(uploadedCount / documentTypes.length) * 100} className="h-3" />

            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span>
                  Required: {requiredUploaded}/{requiredCount}
                </span>
              </div>
              {requiredUploaded < requiredCount && (
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{requiredCount - requiredUploaded} required documents missing</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documentTypes.map((docType) => {
          const doc = documents[docType.id];
          const isUploading = uploadingDoc === docType.id;
          const isExtracting = extractingDoc === docType.id;

          return (
            <Card
              key={docType.id}
              className={`relative transition-all ${
                doc ? 'border-green-200 bg-green-50/50' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {docType.name}
                      {docType.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {docType.description}
                    </CardDescription>
                  </div>
                  {doc && <Check className="h-5 w-5 text-green-600" />}
                </div>
              </CardHeader>

              <CardContent>
                {isUploading ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                ) : doc ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{doc.fileName}</span>
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{docType.name}</DialogTitle>
                            <DialogDescription>
                              Uploaded document preview
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4">
                            {doc.fileUrl.endsWith('.pdf') ? (
                              <iframe
                                src={doc.fileUrl}
                                className="w-full h-[400px] rounded-lg border"
                                title={docType.name}
                              />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={doc.fileUrl}
                                alt={docType.name}
                                className="max-w-full h-auto rounded-lg"
                              />
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedDoc(docType);
                              handleExtract(docType.id);
                            }}
                          >
                            {isExtracting ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <Sparkles className="h-4 w-4 mr-1" />
                            )}
                            Extract
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-primary" />
                              Extracted Data
                            </DialogTitle>
                            <DialogDescription>
                              AI-extracted information from {selectedDoc?.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4">
                            {isExtracting ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              </div>
                            ) : extractedData ? (
                              <div className="space-y-3">
                                {Object.entries(extractedData).map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="flex justify-between items-center py-2 border-b"
                                  >
                                    <span className="text-sm text-muted-foreground capitalize">
                                      {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <span className="font-medium">
                                      {typeof value === 'object'
                                        ? JSON.stringify(value)
                                        : String(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-center text-muted-foreground">
                                No data extracted yet
                              </p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(docType.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label
                      htmlFor={`upload-${docType.id}`}
                      className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload
                      </span>
                      <input
                        id={`upload-${docType.id}`}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleFileChange(docType.id, e)}
                      />
                    </label>
                    <p className="text-xs text-muted-foreground text-center">
                      PDF, JPG, or PNG (max 5MB)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Auto-fill Button */}
      {uploadedCount >= requiredCount && (
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="text-lg font-semibold">Ready for Auto-Fill!</h3>
              <p className="text-sm opacity-90">
                All required documents uploaded. You can now auto-fill scholarship applications.
              </p>
            </div>
            <Button variant="secondary" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Generate Auto-Fill Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
