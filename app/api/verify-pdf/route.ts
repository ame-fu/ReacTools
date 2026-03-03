import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 },
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const verifyPDF = (await import("pdf-signature-reader")).default;
    const result = verifyPDF(buffer);
    if ("error" in result && result.error) {
      return NextResponse.json(
        { error: (result as { message?: string }).message ?? "Verification failed" },
        { status: 200 },
      );
    }
    const { signatures } = result as { signatures: unknown[] };
    return NextResponse.json({ signatures: signatures ?? [] });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 200 });
  }
}
