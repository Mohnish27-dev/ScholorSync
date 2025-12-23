import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const userDoc = await getDoc(doc(db, "users", uid));
    
    if (!userDoc.exists()) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    const userData = userDoc.data();
    return NextResponse.json({ 
      profile: userData.profile || null,
      savedScholarships: userData.savedScholarships || [],
      appliedScholarships: userData.appliedScholarships || [],
      documents: userData.documents || []
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
