import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VehicleJourneyModal } from "../components/VehicleJourneyModal";
import {
  saveActiveJourney,
  getActiveJourney,
  clearActiveJourney,
  generateJourneyWhatsAppUrl,
  generateJourneySmsUrl,
  generateArrivalWhatsAppUrl,
  generateArrivalSmsUrl,
  VehicleJourneyDetails
} from "../services/journeyTrackerService";
import { IceContact } from "../services/uatProfileService";
import { SafeHavenDashboard } from "../components/SafeHavenDashboard";

describe("Vehicle Journey Tracker Service & Modal", () => {
  const mockContacts: IceContact[] = [
    {
      id: "ice-1",
      name: "Sipho Khumalo",
      relationship: "Brother",
      phone: "0821234567",
      email: "sipho@example.com",
      isPrimary: true,
    },
    {
      id: "ice-2",
      name: "Nomsa Dlamini",
      relationship: "Neighbor",
      phone: "0719876543",
      email: "nomsa@example.com",
      isPrimary: false,
    },
  ];

  const sampleJourney: VehicleJourneyDetails = {
    id: "journey-test-1",
    rideType: "Uber",
    vehicleMake: "Toyota",
    vehicleModel: "Corolla Quest",
    vehicleColor: "Silver",
    doors: "4-Door",
    licensePlate: "GP 88 XY",
    visibleDamages: "Dented Bumper, Cracked Taillight",
    driverName: "Bongani Sithole",
    driverPhone: "+27 72 111 2222",
    originAddress: "Berea, Johannesburg",
    destinationAddress: "Sandton City Mall",
    originCoords: { lat: -26.2041, lng: 28.0473 },
    currentCoords: { lat: -26.2041, lng: 28.0473 },
    startTime: "09:30",
    startTimestamp: Date.now() - 60000,
    selectedIceContactIds: ["ice-1", "ice-2"],
    status: "ACTIVE",
  };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("persists active journey and retrieves it from localStorage", () => {
    saveActiveJourney(sampleJourney);
    const active = getActiveJourney();
    expect(active).not.toBeNull();
    expect(active?.licensePlate).toBe("GP 88 XY");
    expect(active?.driverName).toBe("Bongani Sithole");
    expect(active?.visibleDamages).toContain("Dented Bumper");

    clearActiveJourney();
    expect(getActiveJourney()).toBeNull();
  });

  it("formats WhatsApp and SMS broadcast alerts with vehicle details, damages, and GPS link", () => {
    const waUrl = generateJourneyWhatsAppUrl(sampleJourney, "0821234567", "Lerato");
    expect(waUrl).toContain("https://wa.me/27821234567?text=");
    expect(decodeURIComponent(waUrl)).toContain("🚨 SAFE JOURNEY ALERT: Lerato is traveling.");
    expect(decodeURIComponent(waUrl)).toContain("Toyota Corolla Quest");
    expect(decodeURIComponent(waUrl)).toContain("GP 88 XY");
    expect(decodeURIComponent(waUrl)).toContain("Dented Bumper");
    expect(decodeURIComponent(waUrl)).toContain("Bongani Sithole");
    expect(decodeURIComponent(waUrl)).toContain("https://maps.google.com/?q=-26.2041,28.0473");

    const smsUrl = generateJourneySmsUrl(sampleJourney, "0821234567", "Lerato");
    expect(smsUrl).toContain("sms:0821234567?body=");
    expect(decodeURIComponent(smsUrl)).toContain("Sandton City Mall");
  });

  it("formats Safe Arrival WhatsApp and SMS confirmations", () => {
    const waArrival = generateArrivalWhatsAppUrl(sampleJourney, "0821234567", "Lerato");
    expect(decodeURIComponent(waArrival)).toContain("✅ SAFE ARRIVAL CONFIRMATION: Lerato has arrived safely at Sandton City Mall.");
    expect(decodeURIComponent(waArrival)).toContain("GP 88 XY");

    const smsArrival = generateArrivalSmsUrl(sampleJourney, "0821234567", "Lerato");
    expect(decodeURIComponent(smsArrival)).toContain("SAFE ARRIVAL CONFIRMATION");
  });

  it("renders VehicleJourneyModal with quick selection chips and starts journey", () => {
    const handleStart = vi.fn();
    const handleClose = vi.fn();

    render(
      <VehicleJourneyModal
        isOpen={true}
        onClose={handleClose}
        onStartJourney={handleStart}
        currentLocationAddress="Johannesburg CBD"
        currentCoords={{ lat: -26.2041, lng: 28.0473 }}
        iceContacts={mockContacts}
        userName="Thandi"
      />
    );

    expect(screen.getByText("Safe Vehicle Journey Monitor")).toBeDefined();
    expect(screen.getByText("Uber, Bolt, Minibus Taxi, Private & Friends Ride Tracker")).toBeDefined();

    // Select Bolt
    fireEvent.click(screen.getByText("Bolt"));

    // Select Make VW
    fireEvent.click(screen.getByText("VW"));

    // Fill Model
    const modelInput = screen.getByPlaceholderText(/e\.g\. Corolla, Polo, Swift/i);
    fireEvent.change(modelInput, { target: { value: "Polo Vivo" } });

    // Select Color Silver
    fireEvent.click(screen.getByText("Silver"));

    // Fill Plate
    const plateInput = screen.getByPlaceholderText(/e\.g\. GP 44 XY/i);
    fireEvent.change(plateInput, { target: { value: "CA 999 111" } });

    // Select Damage tag
    fireEvent.click(screen.getByText(/\+ Dented Bumper/i));

    // Fill Driver
    const driverInput = screen.getByPlaceholderText(/e\.g\. Sipho Ndlovu/i);
    fireEvent.change(driverInput, { target: { value: "Kagiso Mokoena" } });

    // Fill Destination
    const destInput = screen.getByPlaceholderText(/e\.g\. Sandton City Mall/i);
    fireEvent.change(destInput, { target: { value: "Rosebank Clinic" } });

    // Submit Start Journey
    const submitBtn = screen.getByRole("button", { name: /Start Safe Journey & Broadcast to ICE/i });
    fireEvent.click(submitBtn);

    expect(handleStart).toHaveBeenCalledTimes(1);
    const calledJourney: VehicleJourneyDetails = handleStart.mock.calls[0][0];
    expect(calledJourney.rideType).toBe("Bolt");
    expect(calledJourney.vehicleMake).toBe("VW");
    expect(calledJourney.vehicleModel).toBe("Polo Vivo");
    expect(calledJourney.licensePlate).toBe("CA 999 111");
    expect(calledJourney.visibleDamages).toContain("Dented Bumper");
    expect(calledJourney.driverName).toBe("Kagiso Mokoena");
    expect(calledJourney.destinationAddress).toBe("Rosebank Clinic");

    // Share dialog displayed with WhatsApp link
    expect(screen.getByText("Safe Journey Active!")).toBeDefined();
    expect(screen.getAllByText(/WhatsApp Link/i).length).toBe(2);
  });

  it("renders SAFE JOURNEY ACTIVE card on SafeHavenDashboard when journey is in progress", () => {
    saveActiveJourney(sampleJourney);

    render(<SafeHavenDashboard onPanicLock={vi.fn()} />);

    expect(screen.getByText("SAFE JOURNEY ACTIVE")).toBeDefined();
    expect(screen.getByText("MONITORED")).toBeDefined();
    expect(screen.getByText("Sandton City Mall")).toBeDefined();
    expect(screen.getByText(/GP 88 XY/i)).toBeDefined();
    expect(screen.getByText(/Bongani Sithole/i)).toBeDefined();

    // Click End Journey
    const endBtn = screen.getByRole("button", { name: /END JOURNEY \(ARRIVED SAFELY\)/i });
    fireEvent.click(endBtn);

    expect(screen.getByText("Confirm Safe Arrival")).toBeDefined();
    expect(screen.getByRole("button", { name: /Confirm & End Monitored Trip/i })).toBeDefined();
  });
});
