import React, { useState, useEffect } from "react";
import {
  Car,
  X,
  MapPin,
  User,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Navigation,
  ShieldCheck,
  Clock
} from "lucide-react";
import {
  VehicleJourneyDetails,
  RideProviderType,
  VehicleDoorType,
  saveActiveJourney,
  generateJourneyWhatsAppUrl,
  generateJourneySmsUrl
} from "../services/journeyTrackerService";
import { IceContact } from "../services/uatProfileService";
import { getLiveLocation, getCachedLiveLocation } from "../services/liveLocationService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartJourney: (details: VehicleJourneyDetails) => void;
  currentLocationAddress?: string;
  currentCoords?: { lat: number; lng: number };
  iceContacts: IceContact[];
  userName?: string;
}

const RIDE_TYPES: RideProviderType[] = [
  "Uber",
  "Bolt",
  "inDrive",
  "Minibus Taxi",
  "Metered Cab",
  "Friend/Family",
  "Other"
];

const POPULAR_MAKES = [
  "Toyota",
  "VW",
  "Suzuki",
  "Hyundai",
  "Nissan",
  "Quantum",
  "Other"
];

const COLORS = [
  "White",
  "Silver",
  "Grey",
  "Black",
  "Blue",
  "Red",
  "Gold",
  "Other"
];

const DAMAGE_TAGS = [
  "Dented Bumper",
  "Cracked Taillight",
  "Scratched Door",
  "Tinted Windows",
  "Custom Decal",
  "Roof Rack"
];

export const VehicleJourneyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onStartJourney,
  currentLocationAddress,
  currentCoords,
  iceContacts,
  userName = "Umkhuseli Survivor"
}) => {
  const cachedGps = getCachedLiveLocation();
  const [activeCoords, setActiveCoords] = useState<{ lat: number; lng: number } | undefined>(
    currentCoords || (cachedGps ? { lat: cachedGps.lat, lng: cachedGps.lng } : undefined)
  );
  const [rideType, setRideType] = useState<RideProviderType>("Uber");
  const [vehicleMake, setVehicleMake] = useState("Toyota");
  const [customMake, setCustomMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("Corolla Quest");
  const [vehicleColor, setVehicleColor] = useState("White");
  const [doors, setDoors] = useState<VehicleDoorType>("4-Door");
  const [licensePlate, setLicensePlate] = useState("");
  const [selectedDamages, setSelectedDamages] = useState<string[]>([]);
  const [customDamage, setCustomDamage] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [originAddress, setOriginAddress] = useState(
    currentLocationAddress || cachedGps?.areaName || "Current GPS Location"
  );
  const [destinationAddress, setDestinationAddress] = useState("");
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>(() =>
    iceContacts.map((c) => c.id)
  );
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [createdJourney, setCreatedJourney] = useState<VehicleJourneyDetails | null>(null);

  useEffect(() => {
    if (!currentCoords) {
      getLiveLocation({ timeoutMs: 6000 })
        .then((loc) => {
          setActiveCoords({ lat: loc.lat, lng: loc.lng });
          if (!currentLocationAddress) {
            setOriginAddress(loc.areaName);
          }
        })
        .catch(() => {});
    }
  }, [currentCoords, currentLocationAddress]);

  if (!isOpen) return null;

  const toggleDamage = (tag: string) => {
    if (selectedDamages.includes(tag)) {
      setSelectedDamages(selectedDamages.filter((t) => t !== tag));
    } else {
      setSelectedDamages([...selectedDamages, tag]);
    }
  };

  const toggleContact = (id: string) => {
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter((cid) => cid !== id));
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  const selectAllContacts = () => {
    if (selectedContactIds.length === iceContacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(iceContacts.map((c) => c.id));
    }
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();

    const damagesCombined = [
      ...selectedDamages,
      customDamage.trim() ? customDamage.trim() : null
    ]
      .filter(Boolean)
      .join(", ");

    const effectiveMake = vehicleMake === "Other" && customMake.trim() ? customMake.trim() : vehicleMake;

    const journey: VehicleJourneyDetails = {
      id: "journey-" + Date.now(),
      rideType,
      vehicleMake: effectiveMake,
      vehicleModel: vehicleModel.trim() || "Vehicle",
      vehicleColor,
      doors,
      licensePlate: licensePlate.trim().toUpperCase() || "UNKNOWN",
      visibleDamages: damagesCombined || undefined,
      driverName: driverName.trim() || "Unknown Driver",
      driverPhone: driverPhone.trim() || undefined,
      originAddress: originAddress.trim() || "Current Location",
      destinationAddress: destinationAddress.trim() || "Destination Unspecified",
      originCoords: activeCoords || currentCoords,
      currentCoords: activeCoords || currentCoords,
      startTime: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }),
      startTimestamp: Date.now(),
      selectedIceContactIds: selectedContactIds,
      status: "ACTIVE"
    };

    saveActiveJourney(journey);
    setCreatedJourney(journey);
    onStartJourney(journey);
    setShowShareDialog(true);
  };

  return (
    <div
      data-testid="vehicle-journey-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-in fade-in duration-150 select-none overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full mx-auto my-auto max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Safe Vehicle Journey Monitor
              </h3>
              <p className="text-[11px] text-slate-400">
                Uber, Bolt, Minibus Taxi, Private & Friends Ride Tracker
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close vehicle modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {!showShareDialog ? (
          <form onSubmit={handleStart} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs text-slate-200">
            {/* 1. RIDE PROVIDER SELECTION */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5">Ride Type / Transport</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {RIDE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRideType(type)}
                    className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all border ${
                      rideType === type
                        ? "bg-amber-500 border-amber-400 text-slate-950 shadow"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. VEHICLE MAKE & MODEL */}
            <div className="space-y-2">
              <label className="block text-slate-400 font-semibold">Vehicle Make</label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_MAKES.map((make) => (
                  <button
                    key={make}
                    type="button"
                    onClick={() => setVehicleMake(make)}
                    className={`py-1 px-2.5 rounded-lg text-[11px] font-semibold border ${
                      vehicleMake === make
                        ? "bg-sky-600 border-sky-400 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    {make}
                  </button>
                ))}
              </div>

              {vehicleMake === "Other" && (
                <input
                  type="text"
                  placeholder="Specify vehicle make (e.g. Kia, Chery)..."
                  value={customMake}
                  onChange={(e) => setCustomMake(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white mt-1"
                />
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Corolla, Polo, Swift"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Doors</label>
                  <div className="flex gap-1">
                    {(["4-Door", "2-Door", "Minibus/Van"] as VehicleDoorType[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDoors(d)}
                        className={`flex-1 py-2 text-[10px] font-bold rounded-lg border ${
                          doors === d
                            ? "bg-emerald-600 border-emerald-400 text-white"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. COLOR & LICENSE PLATE */}
            <div className="space-y-2">
              <label className="block text-slate-400 font-semibold">Vehicle Colour</label>
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setVehicleColor(c)}
                    className={`py-1 px-2.5 rounded-lg text-[11px] font-semibold border ${
                      vehicleColor === c
                        ? "bg-amber-500 border-amber-400 text-slate-950 font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  License Number Plate (SA) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GP 44 XY, CA 123-456, ND 789123"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono tracking-wider font-bold"
                />
              </div>
            </div>

            {/* 4. VISIBLE DAMAGES / UNIQUE IDENTIFICATION MARKS */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Visible Damages & Distinguishing Marks (Medium of Identification)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DAMAGE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleDamage(tag)}
                    className={`py-1 px-2 rounded-lg text-[10px] font-bold border transition-colors ${
                      selectedDamages.includes(tag)
                        ? "bg-rose-950 border-rose-500 text-rose-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {selectedDamages.includes(tag) ? "✓ " : "+ "}
                    {tag}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Other unique marks (e.g. crack on left windshield, cracked headlight)..."
                value={customDamage}
                onChange={(e) => setCustomDamage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white placeholder-slate-500 text-[11px]"
              />
            </div>

            {/* 5. DRIVER PARTICULARS */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  <span>Driver Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sipho Ndlovu"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Driver Cell (Optional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="+27 72 000 0000"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>

            {/* 6. ROUTE ORIGIN & DESTINATION */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Departure Location (From)</span>
                </label>
                <input
                  type="text"
                  value={originAddress}
                  onChange={(e) => setOriginAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-rose-400" />
                  <span>Destination (Heading to) *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sandton City Mall, Home, 12th Avenue..."
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                />
              </div>
            </div>

            {/* 7. SELECT ICE CONTACTS TO BROADCAST TO */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">
                  Broadcast Alert to ICE Contacts ({selectedContactIds.length}/{iceContacts.length})
                </span>
                <button
                  type="button"
                  onClick={selectAllContacts}
                  className="text-amber-400 hover:underline text-[11px]"
                >
                  {selectedContactIds.length === iceContacts.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {iceContacts.map((contact) => (
                  <label
                    key={contact.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedContactIds.includes(contact.id)}
                        onChange={() => toggleContact(contact.id)}
                        className="rounded accent-amber-500 w-4 h-4"
                      />
                      <span className="font-semibold text-white">{contact.name}</span>
                      <span className="text-[10px] text-slate-400">({contact.relationship})</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">{contact.phone}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Start Safe Journey & Broadcast to ICE</span>
              </button>
            </div>
          </form>
        ) : (
          /* Share Dialog after journey starts */
          <div className="p-6 space-y-4 text-xs text-slate-200">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Safe Journey Active!</h3>
              <p className="text-slate-400 text-xs">
                Heading to <strong className="text-white">{createdJourney?.destinationAddress}</strong> with {createdJourney?.driverName}.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Send 1-Touch Journey Alert via WhatsApp:
              </span>
              <div className="space-y-1.5">
                {iceContacts
                  .filter((c) => createdJourney?.selectedIceContactIds.includes(c.id))
                  .map((contact) => {
                    const waUrl = createdJourney ? generateJourneyWhatsAppUrl(createdJourney, contact.phone, userName) : "";
                    return (
                      <a
                        key={contact.id}
                        href={waUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (!waUrl) {
                            e.preventDefault();
                            alert("Journey alert is generating. Please wait a moment.");
                          }
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-600/30 text-emerald-300 hover:bg-emerald-900/40 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-bold text-white">{contact.name}</span>
                          <span className="text-[10px] text-emerald-400">({contact.relationship})</span>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">
                          WhatsApp Link
                        </span>
                      </a>
                    );
                  })}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider"
            >
              Close & View Active Journey
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
