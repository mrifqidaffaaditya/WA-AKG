import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;
        
        // Security: Prevent directory traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
        }

        const filePath = path.join(process.cwd(), "public", "media", filename);
        
        if (!existsSync(filePath)) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const fileBuffer = await readFile(filePath);
        
        // Determine content type based on extension
        const ext = path.extname(filename).toLowerCase();
        const contentTypeMap: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.mp4': 'video/mp4',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.pdf': 'application/pdf',
            '.bin': 'application/octet-stream',
        };
        
        const contentType = contentTypeMap[ext] || 'application/octet-stream';
        
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });

    } catch (error: any) {
        console.error("Media serve error:", error);
        return NextResponse.json({ 
            error: "Failed to serve media",
            details: error.message 
        }, { status: 500 });
    }
}
