/**
 * Umkhuseli: The Protector (Sankofa Safe)
 * iOS File Share & PDF Export Service
 *
 * Implements the W3C Web Share Level 2 File API for court-admissible Form 2 affidavits.
 * On iOS Safari / Standalone PWA, invokes the native iOS Share Sheet allowing survivors
 * to cleanly "Save to Files", "AirDrop", or print without triggering Safari pop-up blockers.
 */

export interface ShareFileOptions {
  blob: Blob;
  fileName: string;
  title: string;
  text?: string;
}

/**
 * Checks if the browser supports sharing files via the native Share Sheet
 */
export function canShareFiles(file: File): boolean {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.share !== "function" ||
    typeof navigator.canShare !== "function"
  ) {
    return false;
  }
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

/**
 * Exports or shares a document (e.g., ECTA Section 15 court affidavit PDF)
 * Uses native Web Share Sheet on iOS, falling back to standard download link.
 */
export async function shareOrDownloadDocument(
  options: ShareFileOptions
): Promise<{ sharedViaNative: boolean; success: boolean; error?: string }> {
  const { blob, fileName, title, text } = options;

  if (typeof window === "undefined") {
    return { sharedViaNative: false, success: false, error: "Window undefined" };
  }

  const mimeType = blob.type || "application/pdf";
  const file = new File([blob], fileName, { type: mimeType });

  // 1. Check if native Web Share with files is supported (iOS Safari 15+ / WebKit)
  if (canShareFiles(file)) {
    try {
      await navigator.share({
        files: [file],
        title: title,
        text: text || "Form 2 Domestic Violence Protection Order Affidavit",
      });
      return { sharedViaNative: true, success: true };
    } catch (err: unknown) {
      // AbortError indicates user cancelled the share sheet intentionally
      if (err instanceof Error && err.name === "AbortError") {
        return { sharedViaNative: true, success: true };
      }
      // If native share fails unexpectedly, fall through to browser download fallback
    }
  }

  // 2. Standard Browser Fallback: Blob Anchor Download
  try {
    let blobUrl = "";
    if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
      blobUrl = URL.createObjectURL(blob);
    }
    const link = document.createElement("a");
    if (blobUrl) link.href = blobUrl;
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (link.parentNode) {
        document.body.removeChild(link);
      }
      if (blobUrl && typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function") {
        URL.revokeObjectURL(blobUrl);
      }
    }, 1500);

    return { sharedViaNative: false, success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { sharedViaNative: false, success: false, error: errorMsg };
  }
}
