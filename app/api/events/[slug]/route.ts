import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event, { IEvent } from "@/database/event.model";

type ErrorBody = {
  message: string;
};

type EventSuccessBody = {
  message: string;
  event: IEvent;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const jsonError = (message: string, status: number): NextResponse<ErrorBody> =>
  NextResponse.json({ message }, { status });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse<EventSuccessBody | ErrorBody>> {
  // ⬇️ FIX: params is a Promise → must await
  const { slug: rawSlug } = await params;

  if (!rawSlug || typeof rawSlug !== "string" || rawSlug.trim().length === 0) {
    return jsonError("A valid slug route parameter is required.", 400);
  }

  const slug = rawSlug.trim().toLowerCase();

  if (!SLUG_PATTERN.test(slug)) {
    return jsonError(
      "Invalid slug format. Use lowercase letters, numbers, and hyphens only.",
      400,
    );
  }

  try {
    await connectDB();

    const event = await Event.findOne({ slug }).exec();

    if (!event) {
      return jsonError("Event not found.", 404);
    }

    return NextResponse.json(
      {
        message: "Event fetched successfully.",
        event,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to fetch events by slug:", error);
    return jsonError(
      "Unexpected server error while fetching events details.",
      500,
    );
  }
}
