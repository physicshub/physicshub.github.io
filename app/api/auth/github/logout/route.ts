import { NextResponse } from "next/server";
import { clearSessionToken } from "../../../../(core)/lib/githubSession";

export async function POST() {
  await clearSessionToken();
  return NextResponse.json({ success: true });
}
