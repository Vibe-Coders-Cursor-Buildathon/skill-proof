import { NextResponse } from "next/server";

export function notImplemented(feature: string) {
  return NextResponse.json(
    { error: "Not implemented", feature },
    { status: 501 },
  );
}
