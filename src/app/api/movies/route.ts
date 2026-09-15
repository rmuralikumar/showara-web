import { NextRequest, NextResponse } from "next/server";
import { tmdbClient } from "@/lib/tmdb";
import { Movie } from "@/types/movie";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim().slice(0, 100);
    const status = (searchParams.get("status") || "").trim().slice(0, 20);
    const language = (searchParams.get("language") || "").trim().slice(0, 30);
    const genre = (searchParams.get("genre") || "").trim().slice(0, 30);
    const format = (searchParams.get("format") || "").trim().slice(0, 20);
    const letter = (searchParams.get("letter") || "").trim().slice(0, 5);
    const sortBy = (searchParams.get("sortBy") || "popularity").trim();
    const rawPage = parseInt(searchParams.get("page") || "1", 10);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const limitParam = searchParams.get("limit");
    const rawLimit = parseInt(limitParam || "50", 10);
    const limit = limitParam === "all" ? 1000 : (Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(100, rawLimit) : 50);

    let movies: Movie[] = [];

    if (query.trim()) {
      movies = await tmdbClient.search(query.trim());
    } else if (status === "now_showing") {
      movies = await tmdbClient.getNowShowing();
    } else if (status === "upcoming") {
      movies = await tmdbClient.getUpcoming();
    } else {
      movies = await tmdbClient.getAllMovies();
    }

    // Filter by Letter if specified (A-Z browsing)
    if (letter && letter !== "ALL") {
      if (letter === "#") {
        movies = movies.filter((m) => /^[^a-zA-Z]/.test(m.title.trim()));
      } else {
        const char = letter.toUpperCase();
        movies = movies.filter((m) => m.title.trim().toUpperCase().startsWith(char));
      }
    }

    // Filter by Language
    if (language && language !== "All") {
      movies = movies.filter((m) => Array.isArray(m.languages) && m.languages.includes(language));
    }

    // Filter by Genre
    if (genre && genre !== "All") {
      movies = movies.filter((m) => Array.isArray(m.genres) && m.genres.some((g) => g.toLowerCase() === genre.toLowerCase()));
    }

    // Filter by Format
    if (format && format !== "All") {
      movies = movies.filter((m) => Array.isArray(m.formats) && m.formats.includes(format as any));
    }

    // Sort
    movies.sort((a, b) => {
      if (sortBy === "popularity") return (a.trendingRank || 99) - (b.trendingRank || 99);
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "releaseDate") {
        const timeA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
        const timeB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
      return 0;
    });

    // Pagination
    const totalCount = movies.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedMovies = movies.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      data: paginatedMovies,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
      source: tmdbClient.hasApiKey() ? "TMDB API" : "TMDB Seeded Archive",
      isDemoMode: tmdbClient.isDemoMode(),
    });
  } catch (error) {
    console.error("API /api/movies error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load movie catalog." },
      { status: 500 }
    );
  }
}
