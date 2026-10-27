import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { AndroidLauncherFacade } from "../components/AndroidLauncherFacade";
import * as disguiseManager from "../services/disguiseManager";

describe("AndroidLauncherFacade Component (Face 4: Native Android Launcher)", () => {
  const mockUnlock = vi.fn();
  const mockDuress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders the Android home screen with status bar, clock widget, search bar, and app grid", () => {
    render(
      <AndroidLauncherFacade
        onUnlockSafeHaven={mockUnlock}
        onDuressTrigger={mockDuress}
      />
    );

    // Status Bar
    expect(screen.getByText(/Vodacom ZA 5G/i)).toBeInTheDocument();
    expect(screen.getByText(/88%/i)).toBeInTheDocument();

    // Clock & Weather Widget
    expect(screen.getByTestId("android-clock-widget")).toBeInTheDocument();

    // Search Bar
    expect(
      screen.getByPlaceholderText(/Search Google or type URL.../i)
    ).toBeInTheDocument();

    // Core Apps
    expect(screen.getByLabelText("Open Phone")).toBeInTheDocument();
    expect(screen.getByLabelText("Open Messages")).toBeInTheDocument();
    expect(screen.getByLabelText("Open PowerCalc")).toBeInTheDocument();
    expect(screen.getByLabelText("Open Daily Bible")).toBeInTheDocument();
    expect(screen.getByLabelText("Open Settings")).toBeInTheDocument();
  });

  describe("Covert Safe Haven Unlock Triggers", () => {
    it("unlocks Safe Haven when typing '8426' in the Google Search bar", () => {
      render(
        <AndroidLauncherFacade
          onUnlockSafeHaven={mockUnlock}
          onDuressTrigger={mockDuress}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search Google or type URL.../i);
      fireEvent.change(searchInput, { target: { value: "8426" } });

      expect(mockUnlock).toHaveBeenCalledTimes(1);
    });

    it("unlocks Safe Haven with covert 3-tap gesture on the Clock widget within 800ms", () => {
      render(
        <AndroidLauncherFacade
          onUnlockSafeHaven={mockUnlock}
          onDuressTrigger={mockDuress}
        />
      );

      const clockWidget = screen.getByTestId("android-clock-widget");

      // Rapid 3 taps
      fireEvent.click(clockWidget);
      fireEvent.click(clockWidget);
      fireEvent.click(clockWidget);

      expect(mockUnlock).toHaveBeenCalledTimes(1);
    });

    it("unlocks Safe Haven via dialer when entering '*#8426#'", () => {
      render(
        <AndroidLauncherFacade
          onUnlockSafeHaven={mockUnlock}
          onDuressTrigger={mockDuress}
        />
      );

      // Open dialer
      const phoneIcon = screen.getByLabelText("Open Phone");
      fireEvent.click(phoneIcon);

      expect(screen.getByText("Phone Dialer")).toBeInTheDocument();

      // Dial * # 8 4 2 6 #
      fireEvent.click(screen.getByLabelText("Dial *"));
      fireEvent.click(screen.getByLabelText("Dial #"));
      fireEvent.click(screen.getByLabelText("Dial 8"));
      fireEvent.click(screen.getByLabelText("Dial 4"));
      fireEvent.click(screen.getByLabelText("Dial 2"));
      fireEvent.click(screen.getByLabelText("Dial 6"));
      fireEvent.click(screen.getByLabelText("Dial #"));

      expect(mockUnlock).toHaveBeenCalledTimes(1);
    });

    it("unlocks Safe Haven when tapping the Maps app shortcut icon", () => {
      render(
        <AndroidLauncherFacade
          onUnlockSafeHaven={mockUnlock}
          onDuressTrigger={mockDuress}
        />
      );

      const mapsApp = screen.getByLabelText(/Open Maps/i);
      fireEvent.click(mapsApp);

      expect(mockUnlock).toHaveBeenCalledTimes(1);
    });
  });

  describe("Covert Duress SOS Triggers & MMI Decoy", () => {
    it("dispatches Duress SOS when typing '9999' into the Search bar", () => {
      render(
        <AndroidLauncherFacade
          onUnlockSafeHaven={mockUnlock}
          onDuressTrigger={mockDuress}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search Google or type URL.../i);
      fireEvent.change(searchInput, { target: { value: "9999" } });

      expect(mockDuress).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/SafeSearch filter active/i)).toBeInTheDocument();
    });

    it("dispatches Duress SOS and shows realistic carrier MMI decoy message when dialing '*#9999#'", () => {
      render(
        <AndroidLauncherFacade
          onUnlockSafeHaven={mockUnlock}
          onDuressTrigger={mockDuress}
        />
      );

      // Open dialer
      fireEvent.click(screen.getByLabelText("Open Phone"));

      // Dial * # 9 9 9 9 #
      fireEvent.click(screen.getByLabelText("Dial *"));
      fireEvent.click(screen.getByLabelText("Dial #"));
      fireEvent.click(screen.getByLabelText("Dial 9"));
      fireEvent.click(screen.getByLabelText("Dial 9"));
      fireEvent.click(screen.getByLabelText("Dial 9"));
      fireEvent.click(screen.getByLabelText("Dial 9"));
      fireEvent.click(screen.getByLabelText("Dial #"));

      expect(mockDuress).toHaveBeenCalledTimes(1);

      // Verify MMI carrier dialog is rendered
      expect(screen.getByText(/MMI code started/i)).toBeInTheDocument();
      expect(screen.getByText(/Call forwarding unconditional/i)).toBeInTheDocument();

      // Dismiss dialog
      fireEvent.click(screen.getByRole("button", { name: /OK/i }));
      expect(screen.queryByText(/MMI code started/i)).not.toBeInTheDocument();
    });
  });

  describe("App Routing & Disguise Switching", () => {
    it("switches disguise to MUNICIPAL_PREPAID when tapping PowerCalc icon", () => {
      const setDisguiseSpy = vi.spyOn(disguiseManager, "setActiveDisguise");

      render(
        <AndroidLauncherFacade
          onUnlockSafeHaven={mockUnlock}
          onDuressTrigger={mockDuress}
        />
      );

      const powerCalcApp = screen.getByLabelText(/Open PowerCalc/i);
      fireEvent.click(powerCalcApp);

      expect(setDisguiseSpy).toHaveBeenCalledWith("MUNICIPAL_PREPAID");
    });

    it("switches disguise to DAILY_DEVOTIONAL when tapping Daily Bible icon", () => {
      const setDisguiseSpy = vi.spyOn(disguiseManager, "setActiveDisguise");

      render(
        <AndroidLauncherFacade
          onUnlockSafeHaven={mockUnlock}
          onDuressTrigger={mockDuress}
        />
      );

      const bibleApp = screen.getByLabelText(/Open Daily Bible/i);
      fireEvent.click(bibleApp);

      expect(setDisguiseSpy).toHaveBeenCalledWith("DAILY_DEVOTIONAL");
    });

    it("opens Settings modal and lists available chameleon disguises", () => {
      render(
        <AndroidLauncherFacade
          onUnlockSafeHaven={mockUnlock}
          onDuressTrigger={mockDuress}
        />
      );

      const settingsApp = screen.getByLabelText(/Open Settings/i);
      fireEvent.click(settingsApp);

      expect(screen.getByText("Device Settings")).toBeInTheDocument();
      expect(screen.getByText(/Default Chameleon Disguise/i)).toBeInTheDocument();
      expect(screen.getByText(/Model: Samsung Galaxy A53 5G/i)).toBeInTheDocument();
    });

    it("opens Messages modal with decoy carrier notifications", () => {
      render(
        <AndroidLauncherFacade
          onUnlockSafeHaven={mockUnlock}
          onDuressTrigger={mockDuress}
        />
      );

      const messagesApp = screen.getByLabelText(/Open Messages/i);
      fireEvent.click(messagesApp);

      expect(screen.getByText(/Vodacom Alert/i)).toBeInTheDocument();
      expect(screen.getByText(/Your 2GB Data Bundle expires in 48 hours/i)).toBeInTheDocument();
    });

    it("dismisses open modals when Android navigation Back or Home button is pressed", () => {
      render(
        <AndroidLauncherFacade
          onUnlockSafeHaven={mockUnlock}
          onDuressTrigger={mockDuress}
        />
      );

      // Open Messages
      fireEvent.click(screen.getByLabelText("Open Messages"));
      expect(screen.getByText(/Vodacom Alert/i)).toBeInTheDocument();

      // Tap Android Home button
      fireEvent.click(screen.getByLabelText("Android Home"));
      expect(screen.queryByText(/Vodacom Alert/i)).not.toBeInTheDocument();
    });
  });
});
