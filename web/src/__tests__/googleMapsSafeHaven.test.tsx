import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GoogleMapsSafeHavenView } from "../components/GoogleMapsSafeHavenView";
import { THUTHUZELA_CENTERS } from "../data/saSafetyData";

describe("GoogleMapsSafeHavenView Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders Current Identified Area banner with Offline Maps and Find My Device buttons", () => {
    render(<GoogleMapsSafeHavenView />);

    expect(screen.getByText("Current Identified Area")).toBeDefined();
    expect(screen.getByRole("button", { name: /Offline Maps/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Find My Device/i })).toBeDefined();
    expect(screen.getByText(/TACTICAL GPS RADAR/i)).toBeDefined();
  });

  it("triggers offline map caching and displays confirmation feedback", () => {
    render(<GoogleMapsSafeHavenView />);

    const offlineBtn = screen.getByRole("button", { name: /Offline Maps/i });
    fireEvent.click(offlineBtn);

    expect(screen.getByText(/Offline municipal safety waypoints & TCC directory cached locally/i)).toBeDefined();
    expect(screen.getByText("Map Cached")).toBeDefined();
  });

  it("renders selected Thuthuzela Care Centre with address, direct call, and directions links", () => {
    render(<GoogleMapsSafeHavenView />);

    const firstCenter = THUTHUZELA_CENTERS[0];
    expect(screen.getByText(firstCenter.name)).toBeDefined();
    expect(screen.getByText(firstCenter.address)).toBeDefined();
    expect(screen.getByRole("link", { name: new RegExp(`Call TCC \\(${firstCenter.contactNumber}\\)`) })).toBeDefined();
    expect(screen.getByRole("link", { name: /Directions/i })).toBeDefined();
  });

  it("triggers Find My Device location detection when clicked", () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) =>
        success({
          coords: {
            latitude: -26.2041,
            longitude: 28.0473,
            accuracy: 15,
          },
        })
      ),
    };

    vi.stubGlobal("navigator", {
      ...global.navigator,
      geolocation: mockGeolocation,
    });

    render(<GoogleMapsSafeHavenView />);

    const findDeviceBtn = screen.getByRole("button", { name: /Find My Device/i });
    fireEvent.click(findDeviceBtn);

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
  });
});
