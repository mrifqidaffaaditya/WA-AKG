import { NextRequest, NextResponse } from "next/server";
import { getApiDocs } from "@/lib/swagger";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const spec = getApiDocs();
  return NextResponse.json(spec);
}

