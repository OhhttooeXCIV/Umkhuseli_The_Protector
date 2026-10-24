import React, { useState } from "react";
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  ExternalLink,
  Battery,
  Clock,
  Radio,
  CheckCircle2,
  Navigation,
  ArrowLeft,
  EyeOff
} from "lucide-react";
import { THUTHUZELA_CENTERS } from "../data/saSafetyData";

interface Props {
  beaconToken?: string;
  onExit?: () => void;
}

export const GuardianTrackerView: React.FC<Props> = ({
  beaconToken = "demo-ephemeral-beacon-72h",
  onExit
}) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [discreetMode, setDiscreetMode] = useState(false);

  // Default simulated active beacon telemetry
  const beacon = {
    id: beaconToken,
    dispatchedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 mins ago
    latitude: -26.2041,
    longitude: 28.0473,
    accuracyMeters: 14,
    areaName: "Johannesburg Central / Gauteng",
    batteryPercentage: 78,
    isCharging: false,
    nearestTcc: THUTHUZELA_CENTERS[0] // Chris Hani Baragwanath TCC
  };

  const googleMapsUrl = `https://maps.google.com/?q=${beacon.latitude},${beacon.longitude}`;

  if (discreetMode) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-300 p-6 max-w-md mx-auto flex flex-col justify-between select-none">
        <div className="text-center pt-8">
          <p className="text-sm font-mono text-slate-400">Navigation Assistant Active</p>
          <p className="text-xs text-slate-500 mt-2">Display dimmed for privacy in public transit.</p>
        </div>
        <button
          onClick={() => setDiscreetMode(false)}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs"
        >
          Restore Guardian Rescue Console
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between max-w-md mx-auto select-none border-x border-slate-800">
      {/* Tactical Header */}
      <header className="bg-slate-900 border-b border-rose-900/40 p-4 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center animate-pulse">
            <Radio className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
              <span>GUARDIAN CONSOLE</span>
              <span className="bg-rose-500/20 text-rose-400 text-[9px] font-bold px-1.5 py-0.2 rounded border border-rose-500/30">
                LIVE
              </span>
            </h1>
            <span className="text-[10px] text-slate-400 block font-mono">
              72-Hr Ephemeral Responder Link
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDiscreetMode(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 text-xs"
            title="Dim screen"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
          {onExit && (
            <button
              onClick={onExit}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Tracking Content */}
      <main className="p-4 flex-1 space-y-4 overflow-y-auto">
        {/* Urgent Distress Banner */}
        <div className="bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-900 rounded-2xl p-4 border border-rose-500/40 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              EMERGENCY SOS BEACON ACTIVE
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Ref: {beacon.id.substring(0, 8)}
            </span>
          </div>

          <h2 className="text-base font-bold text-white mb-1">
            Immediate Physical Safety Threat Reported
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            A verified survivor has triggered an emergency lifeline and shared their live telemetry with you as an authorized emergency guardian.
          </p>

          {/* Telemetry Stats Grid */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 block">TRIGGERED</span>
                <span className="font-semibold text-white">4 minutes ago</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 block">PHONE BATTERY</span>
                <span className="font-semibold text-emerald-400">{beacon.batteryPercentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Location & Navigation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              Last Known Coordinates
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              Accuracy: ±{beacon.accuracyMeters}m
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-sm font-bold text-white mb-0.5">{beacon.areaName}</div>
            <div className="text-xs font-mono text-slate-400">
              {beacon.latitude.toFixed(4)}, {beacon.longitude.toFixed(4)}
            </div>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-sky-600 hover:bg-sky-500 active:scale-95 transition-all text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 text-xs"
          >
            <Navigation className="w-4 h-4" />
            <span>Open in Google Maps / Live Route</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Emergency First-Responder Direct Actions */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Emergency Dispatch Actions
          </span>

          {/* SAPS Emergency Dial */}
          <a
            href="tel:10111"
            className="w-full bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all text-white font-bold py-3 px-4 rounded-xl flex items-center justify-between shadow-lg shadow-rose-900/40 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <PhoneCall className="w-4 h-4" />
              <span>Call SAPS Emergency Flying Squad (10111)</span>
            </div>
            <span className="text-[10px] bg-rose-700 px-2 py-0.5 rounded font-mono">Direct</span>
          </a>

          {/* Nearest Thuthuzela Care Centre */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="pr-2">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">
                Nearest Care Facility (Gauteng)
              </span>
              <h4 className="text-xs font-bold text-white">{beacon.nearestTcc.name}</h4>
              <p className="text-[10px] text-slate-400">{beacon.nearestTcc.hospitalOrLocation}</p>
            </div>
            <a
              href={`tel:${beacon.nearestTcc.contactNumber}`}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold p-2.5 rounded-lg flex items-center justify-center shrink-0"
              title="Call Care Centre"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Responder Acknowledgment */}
        <div className="pt-2">
          {acknowledged ? (
            <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-3 text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Response Acknowledged: En Route to Survivor</span>
            </div>
          ) : (
            <button
              onClick={() => setAcknowledged(true)}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Acknowledge Distress: I Am Responding</span>
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-slate-900 text-center text-[10px] text-slate-500">
        Umkhuseli Safe Haven • Zero-Install Ephemeral Guardian Protocol • Auto-expires in 72 hours
      </footer>
    </div>
  );
};
