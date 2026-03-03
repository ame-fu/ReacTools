import { NextResponse } from "next/server";
import { composerize } from "composerize-ts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const command = typeof body?.command === "string" ? body.command.trim() : "";
    if (!command) {
      return NextResponse.json({ yaml: "", messages: [] });
    }
    const result = composerize(command);
    return NextResponse.json({
      yaml: result.yaml,
      messages: result.messages,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Conversion failed";
    return NextResponse.json(
      { error: message, yaml: "", messages: [] },
      { status: 200 },
    );
  }
}
