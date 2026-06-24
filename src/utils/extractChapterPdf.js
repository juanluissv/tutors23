import { PDFDocument } from 'pdf-lib';

/**
 * Extract a 1-based inclusive page range from a PDF buffer.
 * Returns a new PDF buffer containing only those pages.
 */
export async function extractPdfPageRange (
    pdfBytes,
    startPage,
    endPage,
    title,
) {
    const start = Number(startPage);
    const end = Number(endPage);

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
        throw new Error('Start and end page must be valid numbers');
    }

    if (start < 1 || end < 1) {
        throw new Error('Page numbers must be at least 1');
    }

    if (end < start) {
        throw new Error('End page must be greater than or equal to start page');
    }

    const src = await PDFDocument.load(pdfBytes, {
        ignoreEncryption: true,
    });
    const totalPages = src.getPageCount();

    if (start > totalPages || end > totalPages) {
        throw new Error(
            `Page range ${start}–${end} is outside the book `
            + `(PDF has ${totalPages} pages)`,
        );
    }

    const indices = [];
    for (let page = start; page <= end; page += 1) {
        indices.push(page - 1);
    }

    const out = await PDFDocument.create();
    const copied = await out.copyPages(src, indices);
    for (const page of copied) {
        out.addPage(page);
    }

    const trimmedTitle = title != null ? String(title).trim() : '';
    if (trimmedTitle) {
        out.setTitle(trimmedTitle);
    }

    return Buffer.from(await out.save());
}

export function sanitizeChapterPdfSlug (title, chapterNumber) {
    const fallback = `chapter-${chapterNumber || 1}`;
    const base = String(title || '').trim().toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);

    return base || fallback;
}
