/**
 * Umkhuseli - Vehicle Journey Tracker Service
 * 
 * Provides quick vehicle telemetry logging (Uber, Bolt, inDrive, Minibus Taxi, Friends/Family),
 * origin-to-destination departure broadcasts to ICE contacts via WhatsApp/SMS,
 * live GPS tracking integration, and safe arrival confirmations.
 */

export type RideProviderType =
  | "Uber"
  | "Bolt"
  | "inDrive"
  | "Minibus Taxi"
  | "Metered Cab"
  | "Friend/Family"
  | "Other";

export type VehicleDoorType = "4-Door" | "2-Door" | "Minibus/Van";

export interface VehicleJourneyDetails {
  id: string;
  rideType: RideProviderType;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
  doors: VehicleDoorType;
  licensePlate: string;
  visibleDamages?: string;
  driverName: string;
  driverPhone?: string;
  originAddress: string;
  destinationAddress: string;
  originCoords?: { lat: number; lng: number };
  currentCoords?: { lat: number; lng: number };
  startTime: string;
  startTimestamp: number;
  selectedIceContactIds: string[];
  status: "ACTIVE" | "ARRIVED_SAFELY" | "CANCELLED";
}

const STORAGE_KEY = "umkhuseli_active_vehicle_journey";

export function getActiveJourney(): VehicleJourneyDetails | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.status === "ACTIVE") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveActiveJourney(journey: VehicleJourneyDetails): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journey));
  } catch (e) {
    console.warn("Could not save active vehicle journey:", e);
  }
}

export function clearActiveJourney(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Could not clear active vehicle journey:", e);
  }
}

export function formatJourneyAlertText(journey: VehicleJourneyDetails, userName: string = "Umkhuseli User"): string {
  const coordsPart = journey.currentCoords
    ? `https://maps.google.com/?q=${journey.currentCoords.lat},${journey.currentCoords.lng}`
    : journey.originCoords
    ? `https://maps.google.com/?q=${journey.originCoords.lat},${journey.originCoords.lng}`
    : "Live GPS Active in App";

  const driverPhoneText = journey.driverPhone ? ` (${journey.driverPhone})` : "";
  const damageText = journey.visibleDamages ? `\n• Unique Marks / Damages: ${journey.visibleDamages}` : "";

  return (
    `🚨 SAFE JOURNEY ALERT: ${userName} is traveling.\n` +
    `• From: ${journey.originAddress}\n` +
    `• To: ${journey.destinationAddress}\n` +
    `• Ride: ${journey.rideType} - ${journey.vehicleColor} ${journey.vehicleMake} ${journey.vehicleModel} (${journey.doors})\n` +
    `• Plate: ${journey.licensePlate}${damageText}\n` +
    `• Driver: ${journey.driverName}${driverPhoneText}\n` +
    `• Live Location: ${coordsPart}\n` +
    `• Dep: ${journey.startTime}\n` +
    `Please watch over my trip. I will confirm safe arrival upon reaching.`
  );
}

export function formatArrivalAlertText(journey: VehicleJourneyDetails, userName: string = "Umkhuseli User"): string {
  const arrivalTime = new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
  return (
    `✅ SAFE ARRIVAL CONFIRMATION: ${userName} has arrived safely at ${journey.destinationAddress}.\n` +
    `• Journey with ${journey.driverName} (${journey.rideType} - ${journey.licensePlate}) completed.\n` +
    `• Arrival Time: ${arrivalTime}\n` +
    `Thank you for watching over me!`
  );
}

export function cleanPhoneForWa(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "27" + cleaned.substring(1);
  } else if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

export function generateJourneyWhatsAppUrl(
  journey: VehicleJourneyDetails,
  contactPhone: string,
  userName?: string
): string {
  const phone = cleanPhoneForWa(contactPhone);
  const text = encodeURIComponent(formatJourneyAlertText(journey, userName));
  return `https://wa.me/${phone}?text=${text}`;
}

export function generateJourneySmsUrl(
  journey: VehicleJourneyDetails,
  contactPhone: string,
  userName?: string
): string {
  const text = encodeURIComponent(formatJourneyAlertText(journey, userName));
  return `sms:${contactPhone}?body=${text}`;
}

export function generateArrivalWhatsAppUrl(
  journey: VehicleJourneyDetails,
  contactPhone: string,
  userName?: string
): string {
  const phone = cleanPhoneForWa(contactPhone);
  const text = encodeURIComponent(formatArrivalAlertText(journey, userName));
  return `https://wa.me/${phone}?text=${text}`;
}

export function generateArrivalSmsUrl(
  journey: VehicleJourneyDetails,
  contactPhone: string,
  userName?: string
): string {
  const text = encodeURIComponent(formatArrivalAlertText(journey, userName));
  return `sms:${contactPhone}?body=${text}`;
}
