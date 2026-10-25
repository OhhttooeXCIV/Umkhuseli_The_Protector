import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { IosInstallGuideModal } from "../components/IosInstallGuideModal";

describe("IosInstallGuideModal Component", () => {
  const originalUserAgent = navigator.userAgent;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    vi.clearAllMocks();

    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
      configurable: true,
    });
    Object.defineProperty(window.navigator, "standalone", {
      value: false,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(navigator, "userAgent", {
      value: originalUserAgent,
      configurable: true,
    });
  });

  it("renders installation guide modal for iOS Safari users", async () => {
    render(<IosInstallGuideModal />);

    // Fast-forward timeout
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText("Install Prepaid Meter Tool")).toBeInTheDocument();
    expect(screen.getByText(/Step 1:/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 2:/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 3:/i)).toBeInTheDocument();
  });

  it("dismisses the guide and sets persistent local storage flag", async () => {
    render(<IosInstallGuideModal />);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    const closeBtn = screen.getByRole("button", { name: "Close installation guide" });
    fireEvent.click(closeBtn);

    expect(screen.queryByText("Install Prepaid Meter Tool")).not.toBeInTheDocument();
    expect(localStorage.getItem("umkhuseli_ios_install_dismissed")).toBe("true");
  });

  it("does not render when already installed as standalone PWA", () => {
    Object.defineProperty(window.navigator, "standalone", {
      value: true,
      configurable: true,
    });

    render(<IosInstallGuideModal />);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByText("Install Prepaid Meter Tool")).not.toBeInTheDocument();
  });
});
