import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { GuardianTrackerView } from "../components/GuardianTrackerView";

describe("GuardianTrackerView Component (Feature 3: Zero-Install Ephemeral Responder Console)", () => {
  it("renders tactical rescue console header, live beacon banner, and telemetry", () => {
    render(<GuardianTrackerView beaconToken="test-beacon-token-99" />);

    expect(screen.getByText("GUARDIAN CONSOLE")).toBeInTheDocument();
    expect(screen.getByText("LIVE")).toBeInTheDocument();
    expect(screen.getByText(/72-Hr Ephemeral Responder Link/i)).toBeInTheDocument();
    expect(screen.getByText(/EMERGENCY SOS BEACON ACTIVE/i)).toBeInTheDocument();
    expect(screen.getByText("Immediate Physical Safety Threat Reported")).toBeInTheDocument();
    expect(screen.getByText(/PHONE BATTERY/i)).toBeInTheDocument();
    expect(screen.getByText("78%")).toBeInTheDocument();
  });

  it("renders Google Maps navigation link and emergency call buttons", () => {
    render(<GuardianTrackerView beaconToken="test-beacon-token-99" />);

    const mapsLink = screen.getByRole("link", { name: /Open in Google Maps \/ Live Route/i });
    expect(mapsLink).toBeInTheDocument();
    expect(mapsLink).toHaveAttribute("href", expect.stringContaining("https://maps.google.com/?q="));

    const sapsLink = screen.getByRole("link", { name: /Call SAPS Emergency Flying Squad/i });
    expect(sapsLink).toBeInTheDocument();
    expect(sapsLink).toHaveAttribute("href", "tel:10111");

    expect(screen.getByText(/(Helen Joseph|Chris Hani Baragwanath) TCC/i)).toBeInTheDocument();
  });

  it("reads live beacon telemetry from localStorage (pcalc_last_beacon) and dynamically finds nearest care facility with distance in km", () => {
    localStorage.setItem(
      "pcalc_last_beacon",
      JSON.stringify({
        id: "local-beacon-123",
        latitude: -26.2606,
        longitude: 27.9429,
        accuracyMeters: 8,
        areaName: "Soweto / Diepkloof",
        batteryPercentage: 91,
      })
    );

    render(<GuardianTrackerView />);

    expect(screen.getByText("Soweto / Diepkloof")).toBeInTheDocument();
    expect(screen.getByText("91%")).toBeInTheDocument();
    expect(screen.getByText(/Accuracy: ±8m/i)).toBeInTheDocument();
    expect(screen.getByText("Chris Hani Baragwanath TCC")).toBeInTheDocument();
    expect(screen.getByText(/km away/i)).toBeInTheDocument();

    localStorage.clear();
  });

  it("allows the responder to acknowledge distress and logs en route confirmation", () => {
    render(<GuardianTrackerView beaconToken="test-beacon-token-99" />);

    const ackBtn = screen.getByRole("button", { name: /Acknowledge Distress: I Am Responding/i });
    expect(ackBtn).toBeInTheDocument();

    fireEvent.click(ackBtn);

    expect(screen.getByText(/Response Acknowledged: En Route to Survivor/i)).toBeInTheDocument();
  });

  it("broadcasts acknowledgment signal and writes to localStorage when responder acknowledges", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    render(<GuardianTrackerView beaconToken="ack-test-token" />);

    const ackBtn = screen.getByRole("button", { name: /Acknowledge Distress: I Am Responding/i });
    fireEvent.click(ackBtn);

    const storedAck = localStorage.getItem("pcalc_beacon_ack");
    expect(storedAck).not.toBeNull();
    const parsed = JSON.parse(storedAck!);
    expect(parsed.token).toBe("ack-test-token");
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "pcalc_beacon_acknowledged",
      })
    );

    dispatchSpy.mockRestore();
    localStorage.clear();
  });

  it("switches to discreet dimmed mode when eye icon is clicked and restores", () => {
    render(<GuardianTrackerView beaconToken="test-beacon-token-99" />);

    const dimBtn = screen.getByTitle("Dim screen");
    fireEvent.click(dimBtn);

    expect(screen.getByText("Navigation Assistant Active")).toBeInTheDocument();
    expect(screen.getByText(/Display dimmed for privacy in public transit/i)).toBeInTheDocument();

    const restoreBtn = screen.getByRole("button", { name: /Restore Guardian Rescue Console/i });
    fireEvent.click(restoreBtn);

    expect(screen.getByText("GUARDIAN CONSOLE")).toBeInTheDocument();
  });

  it("invokes onExit callback when arrow back is clicked", () => {
    const mockExit = vi.fn();
    render(<GuardianTrackerView beaconToken="test-token" onExit={mockExit} />);

    const backBtn = screen.getAllByRole("button")[1]; // Exit button
    fireEvent.click(backBtn);

    expect(mockExit).toHaveBeenCalledTimes(1);
  });
});
