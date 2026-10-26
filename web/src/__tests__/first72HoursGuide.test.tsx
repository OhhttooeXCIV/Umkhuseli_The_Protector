import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { First72HoursGuide } from "../components/First72HoursGuide";

describe("First72HoursGuide Component", () => {
  it("renders the 4 critical forensic and medical emergency steps", () => {
    render(<First72HoursGuide />);

    expect(screen.getByText("The First 72 Hours Guide")).toBeDefined();
    expect(screen.getByText("CRITICAL PROTOCOL")).toBeDefined();
    expect(screen.getByText("Critical medical & forensic evidence steps")).toBeDefined();

    // Step 1: DNA preservation
    expect(screen.getByText("Do not bathe or change clothes yet")).toBeDefined();
    expect(screen.getByText(/Crucial DNA and physical evidence is preserved/i)).toBeDefined();

    // Step 2: HIV PEP
    expect(screen.getByText("HIV PEP Prophylaxis within 72 hours")).toBeDefined();
    expect(screen.getByText(/Post-Exposure Prophylaxis \(PEP\) medication prevents HIV/i)).toBeDefined();

    // Step 3: Emergency Contraception
    expect(screen.getByText("Emergency Contraception within 120 hours")).toBeDefined();
    expect(screen.getByText(/Oral emergency contraception/i)).toBeDefined();

    // Step 4: J88 Form
    expect(screen.getByText("Ask for the J88 Medical Examination Form")).toBeDefined();
    expect(screen.getByText(/cornerstone of criminal prosecution in South African courts/i)).toBeDefined();
  });

  it("toggles accordion expand and collapse on header click", () => {
    render(<First72HoursGuide />);

    // Initially expanded
    expect(screen.getByText("Do not bathe or change clothes yet")).toBeDefined();

    // Click header to collapse
    const toggleButton = screen.getByRole("button");
    fireEvent.click(toggleButton);

    // Now hidden
    expect(screen.queryByText("Do not bathe or change clothes yet")).toBeNull();

    // Click again to expand
    fireEvent.click(toggleButton);
    expect(screen.getByText("Do not bathe or change clothes yet")).toBeDefined();
  });
});
