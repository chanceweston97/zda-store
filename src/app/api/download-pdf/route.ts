import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pdfUrl = searchParams.get("url");

  if (!pdfUrl) {
    return NextResponse.json({ error: "Missing PDF URL" }, { status: 400 });
  }

  try {
    // Fetch the PDF from the backend (server-side, no CORS issues)
    const response = await fetch(pdfUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch PDF" },
        { status: response.status }
      );
    }

    // Get the PDF as a blob
    const blob = await response.blob();

    // Return the PDF with proper headers for download
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfUrl.split("/").pop() || "datasheet.pdf"}"`,
      },
    });
  } catch (error: any) {
    console.error("Error downloading PDF:", error);
    return NextResponse.json(
      { error: error.message || "Failed to download PDF" },
      { status: 500 }
    );
  }
}

