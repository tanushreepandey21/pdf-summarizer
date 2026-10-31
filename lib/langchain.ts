
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

export async function fetchAndExtractPdfText(fileUrl: string) {
  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error('Failed to download the PDF.');
  }

  const blob = await response.blob();

  const arrayBuffer = await blob.arrayBuffer();

  const loader = new PDFLoader(
    new Blob([arrayBuffer]),
    {
      splitPages: true,
    }
  );

  const docs = await loader.load();

  if (!docs.length) {
    throw new Error('No pages could be extracted from the PDF.');
  }

  const extractedPages = docs.map((doc, index) => ({
    pageNumber: index + 1,
    text: doc.pageContent.trim(),
  }));

  const readablePages = extractedPages.filter(
    (page) => page.text.length > 30
  );

  if (readablePages.length === 0) {
    throw new Error(
      'This PDF appears to be scanned or contains no extractable text. OCR is required.'
    );
  }

  const emptyPages = extractedPages.length - readablePages.length;

  if (emptyPages > 0) {
    console.warn(
      `${emptyPages} pages contain little or no extractable text. OCR may be needed.`
    );
  }

  return extractedPages
    .map(
      (page) =>
        `\n\n[Page ${page.pageNumber}]\n${page.text}`
    )
    .join('\n');
}