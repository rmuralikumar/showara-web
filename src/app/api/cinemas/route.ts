import { NextRequest, NextResponse } from "next/server";
import { CINEMAS, CITIES } from "@/data/cinemas";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = (searchParams.get("cityId") || "").trim().slice(0, 30);
    const query = (searchParams.get("q") || "").toLowerCase().trim().slice(0, 100);
    const facility = (searchParams.get("facility") || "All").trim().slice(0, 30);

    let result = [...CINEMAS];

    if (cityId) {
      result = result.filter((c) => c.cityId.toLowerCase() === cityId.toLowerCase());
    }

    if (query) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.area.toLowerCase().includes(query) ||
          c.address.toLowerCase().includes(query) ||
          (c.city && c.city.toLowerCase().includes(query))
      );
    }

    if (facility && facility !== "All") {
      result = result.filter((c) => c.facilities.includes(facility as any));
    }

    return NextResponse.json({
      success: true,
      data: result,
      cities: CITIES,
    });
  } catch (error) {
    console.error("API /api/cinemas error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load cinema directory" },
      { status: 500 }
    );
  }
}
