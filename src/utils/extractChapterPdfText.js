import { PDFParse } from 'pdf-parse'

/**
 * Extract plain text from a chapter PDF buffer.
 */
export async function extractTextFromPdfBuffer (pdfBytes) {
	if (!pdfBytes || pdfBytes.length === 0) {
		throw new Error('PDF buffer is empty')
	}

	const parser = new PDFParse({ data: pdfBytes })
	try {
		const { text } = await parser.getText()
		return text || ''
	} finally {
		await parser.destroy()
	}
}
