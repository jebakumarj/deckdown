"use client";

/**
 * PDF export goes through the browser's print pipeline: the hidden print root
 * renders every slide at full size with all fragments revealed, and print.css
 * makes each one a landscape page. Text stays selectable and math stays sharp,
 * which a canvas-rasterised export would lose.
 */
export async function exportPdf(): Promise<void> {
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Font loading is best effort.
    }
  }
  window.print();
}
