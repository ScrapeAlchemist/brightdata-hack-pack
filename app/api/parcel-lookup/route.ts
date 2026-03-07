import { NextRequest, NextResponse } from "next/server";
import { lookupParcelByAddress } from "@/app/lib/datasets/montgomeryGIS";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { address } = body;

  if (!address) {
    return NextResponse.json({ found: false, error: "No address provided" });
  }

  const result = await lookupParcelByAddress(address);

  if (!result) {
    return NextResponse.json({ found: false, note: "No matching parcel found in city records" });
  }

  return NextResponse.json({ found: true, parcel: result });
}
