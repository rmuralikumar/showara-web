import { NextRequest, NextResponse } from "next/server";
import { tmdbClient } from "@/lib/tmdb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug || typeof slug !== "string" || slug.trim().length === 0 || slug.length > 150) {
      return NextResponse.json(
        { success: false, error: "Invalid movie slug or identifier" },
        { status: 400 }
      );
    }
    const movie = await tmdbClient.getMovieBySlugOrId(slug.trim());

    if (!movie) {
      return NextResponse.json(
        { success: false, error: "Movie not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: movie,
      source: tmdbClient.hasApiKey() ? "TMDB API" : "TMDB Seeded Archive",
      attribution: "Movie information and imagery provided by TMDB.",
    });
  } catch (error) {
    console.error("API /api/movies/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
