import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  canShareFiles,
  shareOrDownloadDocument,
} from "../services/iosFileShare";

describe("iOS File Share & PDF Export Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("checks canShareFiles capability accurately", () => {
    const dummyFile = new File(["dummy content"], "test.pdf", { type: "application/pdf" });

    (navigator as any).share = vi.fn();
    (navigator as any).canShare = vi.fn().mockReturnValue(true);

    expect(canShareFiles(dummyFile)).toBe(true);

    (navigator as any).canShare = vi.fn().mockReturnValue(false);
    expect(canShareFiles(dummyFile)).toBe(false);
  });

  it("shares court document via native Web Share API when supported", async () => {
    const blob = new Blob(["court pdf binary"], { type: "application/pdf" });
    const shareMock = vi.fn().mockResolvedValue(undefined);

    (navigator as any).share = shareMock;
    (navigator as any).canShare = vi.fn().mockReturnValue(true);

    const result = await shareOrDownloadDocument({
      blob,
      fileName: "Form2_Affidavit.pdf",
      title: "Form 2 Court Protection Order",
    });

    expect(result.success).toBe(true);
    expect(result.sharedViaNative).toBe(true);
    expect(shareMock).toHaveBeenCalled();
  });

  it("falls back to standard browser anchor click when navigator.share is unavailable", async () => {
    const blob = new Blob(["court pdf binary"], { type: "application/pdf" });
    (navigator as any).share = undefined;
    (navigator as any).canShare = undefined;

    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");

    const result = await shareOrDownloadDocument({
      blob,
      fileName: "Form2_Affidavit.pdf",
      title: "Form 2 Court Protection Order",
    });

    expect(result.success).toBe(true);
    expect(result.sharedViaNative).toBe(false);
    expect(appendChildSpy).toHaveBeenCalled();
  });
});
