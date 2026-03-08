import { NextResponse } from "next/server";
import { DocIngestor } from "@/lib/intelligence/docIngestor";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { url, technologySlug, isSequential } = body;

        if (!url || !technologySlug) {
            return NextResponse.json({ error: "URL and technologySlug are required." }, { status: 400 });
        }

        console.log(`[Admin/Ingest] Starting ingestion for ${technologySlug} from ${url}`);
        
        const result = await DocIngestor.ingestFromUrl(url, technologySlug, isSequential ?? true);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ 
            message: `Successfully ingested ${result.conceptsAdded} concepts for ${technologySlug}.`,
            conceptsAdded: result.conceptsAdded
        });

    } catch (error: any) {
        console.error("[Admin/Ingest] API Error:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
