import { NextRequest, NextResponse } from "next/server";
import { tmdbClient } from "@/lib/tmdb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || typeof id !== "string" || id.trim().length === 0 || id.length > 80) {
      return NextResponse.json(
        { success: false, error: "Invalid person identifier" },
        { status: 400 }
      );
    }
    const person = await tmdbClient.getPersonDetails(id.trim());

    if (!person) {
      return NextResponse.json(
        { success: false, error: "Person details not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: person,
      source: "TMDB API",
      attribution: "Actor and filmography details provided by TMDB.",
    });
  } catch (error) {
    console.error("API /api/people/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
