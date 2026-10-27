/**
 * PDF Upload & Rendering Utility
 * Renders uploaded 12-lead ECG PDF documents to high-resolution canvas/data URLs
 */
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

export interface RenderedPdfPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Render all pages of an uploaded PDF file into high-res image data URLs
 */
export async function convertPdfToImages(file: File, scale = 2.0): Promise<RenderedPdfPage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pages: RenderedPdfPage[] = [];

  for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 3); pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) continue;

    // Render white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const renderContext = {
      canvasContext: ctx,
      viewport,
    };

    // @ts-ignore
    await page.render(renderContext).promise;

    pages.push({
      pageNumber: pageNum,
      dataUrl: canvas.toDataURL('image/jpeg', 0.92),
      width: viewport.width,
      height: viewport.height,
    });
  }

  return pages;
}
