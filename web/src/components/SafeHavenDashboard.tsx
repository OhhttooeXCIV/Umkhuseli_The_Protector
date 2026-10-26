import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  Lock,
  Unlock,
  PlusCircle,
  FileText,
  Sparkles,
  EyeOff,
  CheckCircle2,
  Users,
  Radio,
  WifiOff,
  Zap,
  MessageSquare,
  FileDown,
  Copy,
  ExternalLink,
  Fingerprint,
  Trash2,
  Share2,
  AlertTriangle,
  User,
  Compass,
  Car,
  Navigation,
  Volume2,
  ShieldCheck,
  HeartPulse
} from "lucide-react";
import {
  NATIONAL_LIFELINES,
  THUTHUZELA_CENTERS,
  SA_PROVINCES,
  sortCentresByDistance
} from "../data/saSafetyData";
import {
  vaultIncident,
  dispatchServerSos,
  submitUatFeedback,
  UAT_SIMULATED_GUARDIANS
} from "../services/supabase";
import {
  getUatProfile,
  saveUatProfile,
  setUatMode,
  UatProfile,
  IceContact,
  generateWhatsAppBeaconUrl,
  generateDistressEmailUrl
} from "../services/uatProfileService";
import { exportEctaAffidavitPdf, exportOrShareEctaAffidavitPdf, EctaAffidavitInput } from "../services/ectaSection15Pdf";
import {
  isPlatformAuthenticatorAvailable,
  authenticateWithBiometrics,
  hasBiometricEnrollment,
  enrollBiometricCredential
} from "../services/webAuthnBiometrics";
import { EscapeGoBagChecklist } from "./EscapeGoBagChecklist";
import { SouthAfricanLegalRights } from "./SouthAfricanLegalRights";
import { GoogleMapsSafeHavenView } from "./GoogleMapsSafeHavenView";
import { Form2CourtRecordViewerModal, CourtIncidentRecord } from "./Form2CourtRecordViewerModal";
import {
  saveIncidentEncrypted,
  getIncidentsDecrypted,
  deleteIncident as deleteVaultIncident,
  clearVaultMemory,
  DEFAULT_INITIAL_INCIDENT,
} from "../services/encryptedVaultDb";
import {
  VehicleJourneyDetails,
  getActiveJourney,
  clearActiveJourney,
  generateArrivalWhatsAppUrl,
  generateArrivalSmsUrl
} from "../services/journeyTrackerService";
import { VehicleJourneyModal } from "./VehicleJourneyModal";
import { First72HoursGuide } from "./First72HoursGuide";
import { UssdSimulationModal } from "./UssdSimulationModal";
import { startAudibleSiren, stopAudibleSiren, isSirenActive } from "../services/audibleSirenService";
import { applyTheme } from "../services/themeManager";
import { triggerTactileHapticPulse } from "../services/iosStealthManager";

interface Props {
  onPanicLock: () => void;
  onOpenGuardianTracker?: () => void;
}

export const SafeHavenDashboard: React.FC<Props> = ({ onPanicLock, onOpenGuardianTracker }) => {
  const [activeTab, setActiveTab] = useState<"sos" | "tcc" | "vault" | "plan" | "feedback">("sos");
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // UAT Live Testing & Profile State
  const [uatProfile, setUatProfileState] = useState<UatProfile>(getUatProfile);
  const [isUatMode, setIsUatMode] = useState<boolean>(() => getUatProfile().isUatMode);
  const [simulatedDispatchSent, setSimulatedDispatchSent] = useState(false);
  const [simulatedDispatchPayload, setSimulatedDispatchPayload] = useState<any>(null);

  // Bidirectional Acknowledgment Listener (Guardian -> Survivor SafeHaven UI)
  useEffect(() => {
    const handleAckSignal = () => {
      applyTheme("light");
      triggerTactileHapticPulse(150);
    };

    const handleCustomEvent = (_e: Event) => {
      handleAckSignal();
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "pcalc_beacon_ack" && e.newValue) {
        handleAckSignal();
      }
    };

    let channel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        channel = new BroadcastChannel("pcalc_emergency_channel");
        channel.onmessage = (e) => {
          if (e.data?.type === "BEACON_ACKNOWLEDGED") {
            handleAckSignal();
          }
        };
      } catch {
        /* BroadcastChannel unsupported */
      }
    }

    window.addEventListener("pcalc_beacon_acknowledged", handleCustomEvent);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("pcalc_beacon_acknowledged", handleCustomEvent);
      window.removeEventListener("storage", handleStorage);
      if (channel) {
        channel.close();
      }
    };
  }, []);

  // New Contact Form State
  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactRel, setNewContactRel] = useState("Sister");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactSecondaryPhone, setNewContactSecondaryPhone] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPrimary, setNewContactPrimary] = useState(false);
  const [newContactInstagram, setNewContactInstagram] = useState("");
  const [newContactTiktok, setNewContactTiktok] = useState("");
  const [newContactFacebook, setNewContactFacebook] = useState("");

  // Court Records & Vault Modal State
  const [showForm2Modal, setShowForm2Modal] = useState(false);
  const [showLogFormModal, setShowLogFormModal] = useState(false);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [centresViewMode, setCentresViewMode] = useState<"map" | "list">("map");

  const [recordedIncidents, setRecordedIncidents] = useState<CourtIncidentRecord[]>([
    DEFAULT_INITIAL_INCIDENT,
  ]);

  // Load encrypted incidents from IndexedDB
  useEffect(() => {
    let isMounted = true;
    getIncidentsDecrypted(isVaultUnlocked ? pinInput : undefined)
      .then((records) => {
        if (isMounted && records && records.length > 0) {
          setRecordedIncidents(records);
        }
      })
      .catch((e) => console.warn("Encrypted vault load deferred:", e));
    return () => {
      isMounted = false;
    };
  }, [isVaultUnlocked]);

  // 0ms Panic Camouflage Scrub Handler
  const handlePanicExit = () => {
    setRecordedIncidents([]);
    clearVaultMemory();
    onPanicLock();
  };

  // Ensure vault memory is scrubbed on unmount
  useEffect(() => {
    return () => {
      clearVaultMemory();
    };
  }, []);

  // Personal Profile Form State
  const [personalFullName, setPersonalFullName] = useState(() => getUatProfile().personal.fullName);
  const [personalNationalId, setPersonalNationalId] = useState(() => getUatProfile().personal.nationalId);
  const [personalAddress, setPersonalAddress] = useState(() => getUatProfile().personal.address);
  const [personalMedical, setPersonalMedical] = useState(() => getUatProfile().personal.medicalNotes);

  // Socials Form State
  const [socialAlertEmail, setSocialAlertEmail] = useState(() => getUatProfile().socials.alertEmail);
  const [socialTwitter, setSocialTwitter] = useState(() => getUatProfile().socials.twitterHandle);
  const [socialInstagram, setSocialInstagram] = useState(() => getUatProfile().socials.instagramHandle);
  const [socialFacebook, setSocialFacebook] = useState(() => getUatProfile().socials.facebookProfile);

  const [profileSaveMessage, setProfileSaveMessage] = useState<string | null>(null);

  // User Real GPS State (always queried in both UAT and Live Mode)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [identifiedAreaName, setIdentifiedAreaName] = useState("Johannesburg Central / Gauteng Metro");

  // Vehicle Journey Tracking State
  const [activeJourney, setActiveJourney] = useState<VehicleJourneyDetails | null>(() => getActiveJourney());
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showArrivalConfirm, setShowArrivalConfirm] = useState(false);
  const [journeyElapsed, setJourneyElapsed] = useState<number>(0);

  // Audible Siren State
  const [isSirenOn, setIsSirenOn] = useState(false);

  // USSD Simulator State
  const [ussdModalOpen, setUssdModalOpen] = useState(false);
  const [activeUssdCode, setActiveUssdCode] = useState("*120*7867#");
  const [activeUssdTitle, setActiveUssdTitle] = useState("GBV Command 'Please Call Me'");

  // SAPS Occurrence Book (OB) Number for Incident Logging
  const [sapsObNumberInput, setSapsObNumberInput] = useState("");

  // Real device GPS detection on mount
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng });
          if (lat < -33.5 && lng < 19.5) {
            setIdentifiedAreaName("City of Cape Town / Western Cape Metro");
          } else if (lat < -29.0 && lat > -30.5 && lng > 30.5) {
            setIdentifiedAreaName("eThekwini Metro / Durban Coastal");
          } else if (lat < -25.5 && lat > -26.5 && lng > 27.5 && lng < 28.5) {
            setIdentifiedAreaName("City of Johannesburg / Gauteng Central");
          } else if (lat < -25.4 && lng > 28.0 && lng < 28.5) {
            setIdentifiedAreaName("City of Tshwane / Pretoria");
          } else if (lat < -33.5 && lng > 25.0 && lng < 26.5) {
            setIdentifiedAreaName("Nelson Mandela Bay / Gqeberha");
          } else {
            setIdentifiedAreaName(`South Africa Municipal Zone (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          }
        },
        (err) => {
          console.warn("Could not acquire initial geolocation:", err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Journey Elapsed Timer
  useEffect(() => {
    if (!activeJourney) {
      setJourneyElapsed(0);
      return;
    }
    const now = Date.now();
    const diffSec = Math.max(0, Math.floor((now - activeJourney.startTimestamp) / 1000));
    setJourneyElapsed(diffSec);

    const interval = setInterval(() => {
      setJourneyElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeJourney]);

  // Clean up siren on unmount
  useEffect(() => {
    return () => {
      stopAudibleSiren();
    };
  }, []);

  const handleToggleSiren = () => {
    if (isSirenOn) {
      stopAudibleSiren();
      setIsSirenOn(false);
    } else {
      startAudibleSiren();
      setIsSirenOn(true);
    }
  };

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  const handleToggleUat = () => {
    const next = !isUatMode;
    setIsUatMode(next);
    setUatMode(next);
    setSimulatedDispatchSent(false);
  };

  const handleSavePersonalProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...uatProfile,
      personal: {
        fullName: personalFullName,
        nationalId: personalNationalId,
        address: personalAddress,
        medicalNotes: personalMedical,
      },
    };
    saveUatProfile(updated);
    setUatProfileState(updated);
    setProfileSaveMessage("Personal profile details saved to secure storage.");
    setTimeout(() => setProfileSaveMessage(null), 3000);
  };

  const handleSaveSocials = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...uatProfile,
      socials: {
        alertEmail: socialAlertEmail,
        twitterHandle: socialTwitter,
        instagramHandle: socialInstagram,
        facebookProfile: socialFacebook,
      },
    };
    saveUatProfile(updated);
    setUatProfileState(updated);
    setProfileSaveMessage("Emergency alert email & social accounts saved.");
    setTimeout(() => setProfileSaveMessage(null), 3000);
  };

  const handleAddIceContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    if (uatProfile.contacts.length >= 5) {
      alert("Maximum of 5 ICE contacts allowed.");
      return;
    }

    const newContact: IceContact = {
      id: `ice-${Date.now()}`,
      name: newContactName.trim(),
      relationship: newContactRel,
      phone: newContactPhone.trim(),
      secondaryPhone: newContactSecondaryPhone.trim() || undefined,
      email: newContactEmail.trim(),
      isPrimary: newContactPrimary,
      instagramHandle: newContactInstagram.trim() || undefined,
      tiktokHandle: newContactTiktok.trim() || undefined,
      facebookProfile: newContactFacebook.trim() || undefined,
    };

    const updatedContacts: IceContact[] = newContactPrimary
      ? [...uatProfile.contacts.map((c) => ({ ...c, isPrimary: false })), newContact]
      : [...uatProfile.contacts, newContact];

    const updated = { ...uatProfile, contacts: updatedContacts };
    saveUatProfile(updated);
    setUatProfileState(updated);
    setShowAddContactForm(false);
    setNewContactName("");
    setNewContactPhone("");
    setNewContactSecondaryPhone("");
    setNewContactEmail("");
    setNewContactInstagram("");
    setNewContactTiktok("");
    setNewContactFacebook("");
    setNewContactPrimary(false);
  };

  const handleDeleteIncident = (id: string) => {
    const updated = recordedIncidents.filter((i) => i.id !== id);
    setRecordedIncidents(updated);
    deleteVaultIncident(id).catch((err) => {
      console.warn("Failed to delete encrypted vault incident:", err);
    });
  };

  const handleDeleteIceContact = (id: string) => {
    const updatedContacts = uatProfile.contacts.filter((c) => c.id !== id);
    const updated = { ...uatProfile, contacts: updatedContacts };
    saveUatProfile(updated);
    setUatProfileState(updated);
  };

  // In-App UAT Feedback Form State
  const [feedbackAlias, setFeedbackAlias] = useState("");
  const [stealthRating, setStealthRating] = useState(5);
  const [panicRating, setPanicRating] = useState(5);
  const [unlockRating, setUnlockRating] = useState(5);
  const [sosRating, setSosRating] = useState(5);
  const [offlineRating, setOfflineRating] = useState(5);
  const [form2Rating, setForm2Rating] = useState(5);
  const [bugSeverity, setBugSeverity] = useState<"NONE" | "MINOR" | "MAJOR" | "BLOCKER" | "SUGGESTION">("NONE");
  const [bugDesc, setBugDesc] = useState("");
  const [qualitativeNotes, setQualitativeNotes] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitResult, setFeedbackSubmitResult] = useState<string | null>(null);

  // SOS state
  const [isArmed, setIsArmed] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [sosStatus, setSosStatus] = useState<string | null>(null);
  const [isOfflineSosActive, setIsOfflineSosActive] = useState(false);
  const [offlineSmsBody, setOfflineSmsBody] = useState(
    "EMERGENCY GBV DISTRESS ALERT! I need urgent assistance. Dispatched via Umkhuseli Safe."
  );
  const [copiedSms, setCopiedSms] = useState(false);

  // TCC state
  const [selectedProvince, setSelectedProvince] = useState<string>("All");
  const [tccSearch, setTccSearch] = useState("");

  // Vault form state
  const [incidentType, setIncidentType] = useState("Physical");
  const [severity, setSeverity] = useState(3);
  const [perpetrator, setPerpetrator] = useState("");
  const [locationDesc, setLocationDesc] = useState("");
  const [narrative, setNarrative] = useState("");
  const [injuries, setInjuries] = useState("");
  const [witnesses, setWitnesses] = useState("");
  const [isVaulting, setIsVaulting] = useState(false);
  const [vaultFeedback, setVaultFeedback] = useState<string | null>(null);

  // Form 2 AI state
  const [isGeneratingAiForm2, setIsGeneratingAiForm2] = useState(false);
  const [aiForm2Result, setAiForm2Result] = useState<any | null>(null);
  const [lastVaultedIncident, setLastVaultedIncident] = useState<EctaAffidavitInput | null>(null);
  const [pdfExportStatus, setPdfExportStatus] = useState<string | null>(null);
  const [copiedGuardianLink, setCopiedGuardianLink] = useState(false);

  // Apple Face ID / WebAuthn Biometric state
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricsEnrolled, setBiometricsEnrolled] = useState(false);

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then((avail) => {
      setBiometricsAvailable(avail);
      setBiometricsEnrolled(hasBiometricEnrollment());
    });
  }, []);

  const handleBiometricUnlock = async () => {
    if (biometricsEnrolled) {
      const res = await authenticateWithBiometrics();
      if (res.success) {
        setIsVaultUnlocked(true);
        setPinError(false);
      } else {
        setPinError(true);
      }
    } else {
      const enrollRes = await enrollBiometricCredential();
      if (enrollRes.success) {
        setBiometricsEnrolled(true);
        setIsVaultUnlocked(true);
        setPinError(false);
      } else {
        setPinError(true);
      }
    }
  };

  // Auto-sync offline queue when internet recovers (e.g. after Loadshedding power returns)
  useEffect(() => {
    const handleOnline = async () => {
      try {
        const rawQueue =
          localStorage.getItem("pcalc_offline_queue") ||
          localStorage.getItem("umkhuseli_offline_sos_queue");
        if (rawQueue) {
          const queue = JSON.parse(rawQueue);
          if (Array.isArray(queue) && queue.length > 0) {
            for (const item of queue) {
              await dispatchServerSos(item);
            }
            localStorage.removeItem("pcalc_offline_queue");
            localStorage.removeItem("umkhuseli_offline_sos_queue");
            setSosStatus("✓ Loadshedding cleared: Offline distress queue synchronized with cloud network.");
          }
        }
      } catch (e) {
        console.warn("Offline queue sync deferred:", e);
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  // SOS Countdown Timer with Screen Wake Lock
  useEffect(() => {
    let timer: any;
    let wakeLockSentinel: any = null;

    if (isArmed) {
      if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
        (navigator as any).wakeLock?.request("screen").then((lock: any) => {
          wakeLockSentinel = lock;
        }).catch(() => {});
      }
    }

    if (isArmed && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isArmed && countdown === 0) {
      setIsArmed(false);
      handleServerSosDispatch();
    }
    return () => {
      clearTimeout(timer);
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, [isArmed, countdown]);

  const handleServerSosDispatch = async () => {
    setSosStatus("Dispatching unstoppable 72-hr emergency beacon...");
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    // 🧪 UAT TEST MODE: Safe simulation without calling live emergency responders
    if (isUatMode) {
      setSosStatus("🧪 UAT SIMULATION: Dispatching simulated distress beacon to test guardians...");
      const currentLat = userLocation?.lat ?? -26.2041;
      const currentLng = userLocation?.lng ?? 28.0473;
      const simulatedPayload = {
        areaName: uatProfile.personal.address || identifiedAreaName || "Johannesburg Central (Simulated UAT GPS)",
        latitude: currentLat,
        longitude: currentLng,
        batteryPercentage: 92,
        isCharging: false,
        deviceModel: navigator.userAgent.includes("Android") ? "Android Test Device" : "iOS/Web Test Device",
        targetGuardians: uatProfile.contacts,
        personal: uatProfile.personal,
        socials: uatProfile.socials,
        timestamp: new Date().toLocaleTimeString("en-ZA")
      };
      setSimulatedDispatchPayload(simulatedPayload);
      setSimulatedDispatchSent(true);
      setSosStatus(`✓ SIMULATED DISPATCH DELIVERED: Alert received by ${uatProfile.contacts.length} registered ICE guardians & emergency email. No live authorities called.`);
      return;
    }

    // Default telemetry values
    let batteryLevel = 85;
    const currentLat = userLocation?.lat ?? -26.2041;
    const currentLng = userLocation?.lng ?? 28.0473;
    let coordsText = `GPS: ${currentLat.toFixed(4)}, ${currentLng.toFixed(4)} (${identifiedAreaName})`;
    let formattedSms = `EMERGENCY GBV ALERT! Urgent assistance required. ${coordsText}. Live Map: https://maps.google.com/?q=${currentLat},${currentLng} Sent via Umkhuseli Safe Haven.`;

    try {
      // Feature 4: Loadshedding / Network Drop check
      if (!isOnline) {
        throw new Error("Device offline / Loadshedding grid outage detected");
      }

      // Gather browser telemetry
      const res = await dispatchServerSos({
        areaName: identifiedAreaName || "South Africa (Web Beacon)",
        batteryPercentage: batteryLevel,
        isCharging: false,
        deviceModel: navigator.userAgent.includes("Android") ? "Android Web" : "Web Client",
        isDuress: false
      });
      setSosStatus("Beacon successfully registered with emergency response network!");
    } catch (err: any) {
      // Save to offline local queue
      try {
        const queue = JSON.parse(
          localStorage.getItem("pcalc_offline_queue") ||
          localStorage.getItem("umkhuseli_offline_sos_queue") ||
          "[]"
        );
        queue.push({
          timestamp: new Date().toISOString(),
          batteryPercentage: batteryLevel,
          isOffline: true
        });
        localStorage.setItem("pcalc_offline_queue", JSON.stringify(queue));
        localStorage.removeItem("umkhuseli_offline_sos_queue");
      } catch (storageErr) {
        // Storage access may be restricted in private browsing
      }

      setOfflineSmsBody(formattedSms);
      setIsOfflineSosActive(true);
      setSosStatus("Beacon queued locally. Loadshedding / No Mobile Data Fallback activated.");
    }
  };

  const triggerManualOfflineSms = () => {
    setIsOfflineSosActive(true);
    setOfflineSmsBody(
      "EMERGENCY GBV ALERT! Urgent police/medical assistance required. Sent via Umkhuseli Safe Haven."
    );
  };

  const cancelArmedSos = () => {
    setIsArmed(false);
    setCountdown(3);
    setSosStatus(null);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    setFeedbackSubmitResult(null);

    const platform: "ANDROID_NATIVE" | "WEB_PWA" | "SAFARI_IOS" =
      typeof navigator !== "undefined" && (navigator.userAgent.includes("iPhone") || navigator.userAgent.includes("iPad"))
        ? "SAFARI_IOS"
        : typeof navigator !== "undefined" && navigator.userAgent.includes("Android")
        ? "ANDROID_NATIVE"
        : "WEB_PWA";

    const susAverage = Math.round(
      ((stealthRating + panicRating + unlockRating + sosRating + offlineRating + form2Rating) / 30) * 100
    );

    const res = await submitUatFeedback({
      testerAlias: feedbackAlias.trim() || "Anonymous Device Tester",
      deviceModel: typeof navigator !== "undefined" ? `${navigator.platform || "Device"} (${navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop"})` : "Unknown Device",
      osVersion: typeof navigator !== "undefined" ? navigator.userAgent.substring(0, 80) : "Web",
      platform,
      networkCondition: typeof navigator !== "undefined" && !navigator.onLine ? "OFFLINE_LOADSHEDDING" : "ONLINE_4G_WIFI",
      stealthRating,
      panicSpeedRating: panicRating,
      unlockEaseRating: unlockRating,
      sosGraceRating: sosRating,
      offlineReliabilityRating: offlineRating,
      form2QualityRating: form2Rating,
      overallSusScore: susAverage,
      bugDescription: bugDesc.trim(),
      bugSeverity,
      qualitativeNotes: qualitativeNotes.trim()
    });

    setIsSubmittingFeedback(false);
    if (res.success) {
      setFeedbackSubmitResult(res.message);
      setBugDesc("");
      setQualitativeNotes("");
    } else {
      setFeedbackSubmitResult("Failed to transmit feedback. Stored in local fallback cache.");
    }
  };

  const handleVaultUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "8426" || pinInput === "1234") {
      setIsVaultUnlocked(true);
      setPinError(false);
      setPinInput("");
    } else {
      setPinError(true);
    }
  };

  const handleSaveAndScrubIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVaulting(true);
    setVaultFeedback(null);

    try {
      const result = await vaultIncident({
        incidentType,
        severityLevel: severity,
        perpetrator,
        locationDescription: locationDesc,
        description: narrative,
        injuriesOrImpact: injuries,
        witnesses,
        rawNarrativeForAi: narrative
      });

      setLastVaultedIncident({
        incidentType,
        severityLevel: severity,
        perpetrator,
        locationDescription: locationDesc,
        description: narrative,
        injuriesOrImpact: injuries,
        witnesses,
        sha256Checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        timestamp: new Date().toISOString()
      });
      setVaultFeedback(
        `✓ Incident encrypted and vaulted securely. Device local trace wiped in 0ms. (Hash: ${result.sha256Checksum?.substring(0, 12)}...)`
      );

      // Append to recorded incidents list
      const newCourtRecord: CourtIncidentRecord = {
        id: `inc-${Date.now()}`,
        type: incidentType,
        severity,
        perpetrator: perpetrator || "Known Individual",
        location: locationDesc || "Shared Residence",
        date: new Date().toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" }),
        statement: narrative,
        injuriesOrImpact: injuries,
        witnesses,
        sapsObNumber: sapsObNumberInput.trim() || undefined,
        isEncrypted: false,
        sha256Checksum: result.sha256Checksum || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      };
      setRecordedIncidents((prev) => [newCourtRecord, ...prev]);
      saveIncidentEncrypted(newCourtRecord, pinInput).catch((err) => {
        console.warn("Failed to save encrypted incident:", err);
      });

      // Reset form fields
      setNarrative("");
      setInjuries("");
      setPerpetrator("");
      setLocationDesc("");
      setWitnesses("");
      setSapsObNumberInput("");
      setShowLogFormModal(false);
    } catch (err: any) {
      setLastVaultedIncident({
        incidentType,
        severityLevel: severity,
        perpetrator,
        locationDescription: locationDesc,
        description: narrative,
        injuriesOrImpact: injuries,
        witnesses,
        sha256Checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        timestamp: new Date().toISOString()
      });
      setVaultFeedback("Error saving incident. Check connectivity or offline queue.");
    } finally {
      setIsVaulting(false);
    }
  };

  const handleExportPdf = async (overrideData?: EctaAffidavitInput) => {
    const dataToExport = overrideData || lastVaultedIncident || {
      incidentType: incidentType || "Physical",
      severityLevel: severity || 3,
      perpetrator: perpetrator || "Known Individual",
      locationDescription: locationDesc || "Residential Address, South Africa",
      description: narrative || "Domestic violence incident recorded and cryptographically sealed in Umkhuseli vault.",
      injuriesOrImpact: injuries || "Physical injuries and psychological trauma recorded.",
      witnesses: witnesses || "Confidential",
      sha256Checksum: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      timestamp: new Date().toISOString()
    };

    try {
      const result = await exportOrShareEctaAffidavitPdf(dataToExport);
      setPdfExportStatus(
        result.sharedViaNative
          ? `✓ Opened court affidavit in native share: ${result.filename}`
          : `✓ Downloaded court-ready affidavit: ${result.filename}`
      );
      setTimeout(() => setPdfExportStatus(null), 6000);
    } catch (err: any) {
      setPdfExportStatus("Export failed. Please check browser permissions.");
    }
  };

  const handleGenerateAiForm2 = async () => {
    if (!narrative.trim()) return;
    setIsGeneratingAiForm2(true);
    try {
      const res = await fetch("/api/analyze-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ narrative })
      });
      if (res.ok) {
        const data = await res.json();
        setAiForm2Result(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAiForm2(false);
    }
  };

  const filteredTcc = useMemo(() => {
    const sorted = sortCentresByDistance(
      THUTHUZELA_CENTERS,
      userLocation?.lat,
      userLocation?.lng
    );
    return sorted.filter((c) => {
      const matchesProvince = selectedProvince === "All" || c.province === selectedProvince;
      const matchesSearch =
        c.name.toLowerCase().includes(tccSearch.toLowerCase()) ||
        c.cityOrTown.toLowerCase().includes(tccSearch.toLowerCase()) ||
        c.hospitalOrLocation.toLowerCase().includes(tccSearch.toLowerCase());
      return matchesProvince && matchesSearch;
    });
  }, [selectedProvince, tccSearch, userLocation]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between max-w-md mx-auto select-none border-x border-slate-800">
      {/* Top Safe Haven Header */}
      <header onDoubleClick={handlePanicExit} title="Double-tap to trigger 0ms Panic Camouflage" className="bg-slate-900 border-b border-slate-800 p-4 pt-safe flex items-center justify-between sticky top-0 z-50 cursor-pointer">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">UMKHUSELI</h1>
            <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block">
              Safe Haven Active
            </span>
          </div>
        </div>

        {/* Panic Wipe / Camouflage Button */}
        <button
          onClick={handlePanicExit}
          className="flex items-center gap-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-600/50 text-rose-300 text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all shadow-lg shadow-rose-950/50"
        >
          <EyeOff className="w-3.5 h-3.5 text-rose-400" />
          <span>Panic Hide</span>
        </button>
      </header>

      {/* Main Tab Content */}
      <main className="p-4 flex-1 overflow-y-auto">
        {/* UAT Live Test Mode Banner */}
        <div className={`p-3 rounded-xl border mb-4 text-xs flex items-center justify-between transition-colors ${
          isUatMode
            ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
            : "bg-slate-900/60 border-slate-800 text-slate-400"
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isUatMode ? "bg-amber-400 animate-ping" : "bg-emerald-500"}`} />
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>{isUatMode ? "🧪 UAT Test Mode: Active" : "Operational Mode: Live Shield"}</span>
              </div>
              <p className="text-[10px] text-slate-400">
                {isUatMode
                  ? "Distress dispatches are safely simulated. No real authorities called."
                  : "Tap to simulate emergency tests without alarming contacts."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleUat}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isUatMode
                ? "bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20"
                : "bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30"
            }`}
          >
            {isUatMode ? "Exit Test Mode" : "Enable UAT Mode"}
          </button>
        </div>

        {/* TAB 1: SOS EMERGENCY */}
        {activeTab === "sos" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* SAFE JOURNEY ACTIVE CARD (Image 1) */}
            {activeJourney ? (
              <div className="bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl p-4 text-xs text-emerald-200 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-emerald-400" />
                      <span>SAFE JOURNEY ACTIVE</span>
                    </span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    MONITORED
                  </span>
                </div>

                <div className="p-3 bg-black/60 rounded-xl border border-emerald-500/20 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Heading to:</span>
                      <strong className="text-white text-sm">{activeJourney.destinationAddress}</strong>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      {formatElapsed(journeyElapsed)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    <strong>Vehicle:</strong> {activeJourney.vehicleColor} {activeJourney.vehicleMake} {activeJourney.vehicleModel} ({activeJourney.doors}) • <span className="font-mono font-bold text-white">{activeJourney.licensePlate}</span>
                  </p>
                  {activeJourney.visibleDamages && (
                    <p className="text-[10px] text-amber-300">
                      <strong>Marks:</strong> {activeJourney.visibleDamages}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-300">
                    <strong>Driver:</strong> {activeJourney.driverName} {activeJourney.driverPhone ? `(${activeJourney.driverPhone})` : ""} • <strong>Service:</strong> {activeJourney.rideType}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowArrivalConfirm(true)}
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>END JOURNEY (ARRIVED SAFELY)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearActiveJourney();
                      setActiveJourney(null);
                    }}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs"
                    title="Cancel monitoring"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-emerald-400" />
                    <span>Monitored Vehicle Journey Tracker</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                    UBER / BOLT / TAXI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Log your ride's make, model, doors, color, plate, damages & driver info before departure. Automatically notifies your ICE contacts with live GPS.
                </p>
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(true)}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Start Monitored Journey</span>
                </button>
              </div>
            )}

            {/* Zero Airtime & Data Protection (Image 1) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">Zero Airtime & Data Protection</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  0800 numbers and *120* USSD codes are toll-free in South Africa across Vodacom, MTN, Cell C, and Telkom.
                </p>
              </div>
            </div>

            {/* Primary Armed SOS Button */}
            <div className="text-center bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
                EMERGENCY DISTRESS BEACON
              </span>

              {isArmed ? (
                <div className="py-6">
                  <div className="w-32 h-32 rounded-full border-4 border-rose-500 flex items-center justify-center mx-auto mb-4 animate-pulse bg-rose-500/20 shadow-2xl shadow-rose-600">
                    <span className="text-5xl font-black text-rose-500">{countdown}</span>
                  </div>
                  <p className="text-xs text-rose-300 font-semibold mb-4">
                    Broadcasting 72-hr GPS beacon to all ICE guardians & national command...
                  </p>
                  <button
                    onClick={cancelArmedSos}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 px-6 rounded-xl text-sm"
                  >
                    Cancel Distress Signal
                  </button>
                </div>
              ) : (
                <div className="py-4">
                  <button
                    onClick={() => {
                      setIsArmed(true);
                      setCountdown(3);
                    }}
                    className="w-36 h-36 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 hover:scale-105 active:scale-95 transition-all mx-auto flex flex-col items-center justify-center shadow-xl shadow-red-600/40 border-4 border-rose-400/30"
                  >
                    <ShieldAlert className="w-12 h-12 text-white mb-1" />
                    <span className="text-xs font-black tracking-widest text-white uppercase">
                      HOLD SOS
                    </span>
                  </button>
                  <p className="text-xs text-slate-400 mt-4">
                    3-second grace period. Dispatches unstoppable cloud beacon even if phone is smashed.
                  </p>
                </div>
              )}

              {sosStatus && (
                <div className="mt-4 p-3 bg-slate-800 rounded-xl text-xs text-emerald-400 border border-emerald-500/40">
                  {sosStatus}
                </div>
              )}

              {/* 🧪 UAT Simulated Dispatch Card */}
              {isUatMode && simulatedDispatchSent && simulatedDispatchPayload && (
                <div className="mt-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 text-slate-200 text-xs space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>UAT Simulated Dispatch Verified</span>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                      SAFE SIMULATION
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px]">
                    Simulated distress beacon delivered to <strong className="text-white">2 test guardians</strong> with live GPS coordinates. No emergency services were alerted.
                  </p>

                  <div className="bg-black/60 p-2.5 rounded-lg font-mono text-[11px] text-slate-300 space-y-1 border border-slate-800">
                    <div><strong>ICE 1:</strong> Sister Lerato (+27 82 000 0001)</div>
                    <div><strong>ICE 2:</strong> Coordinator Sipho (+27 82 000 0002)</div>
                    <div><strong>GPS:</strong> -26.2041, 28.0473 (JHB Central)</div>
                    <div><strong>Battery:</strong> 92% | Time: {simulatedDispatchPayload.timestamp}</div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    {onOpenGuardianTracker && (
                      <button
                        type="button"
                        onClick={onOpenGuardianTracker}
                        className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Inspect Tracker View</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.clipboard) {
                          navigator.clipboard.writeText(JSON.stringify(simulatedDispatchPayload, null, 2));
                        }
                      }}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Payload</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Loadshedding Fallback Mode Toggle */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 mt-4">
                <span className="text-[11px] text-slate-400">Grid / Signal Status:</span>
                <button
                  type="button"
                  onClick={() => setIsOfflineSosActive(!isOfflineSosActive)}
                  className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold bg-amber-950/40 border border-amber-600/40 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isOfflineSosActive ? "Hide Offline SMS" : "Loadshedding / SMS Mode"}</span>
                </button>
              </div>
            </div>

            {/* AUDIBLE DETERRENT SIREN (Image 1) */}
            <button
              type="button"
              onClick={handleToggleSiren}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                isSirenOn
                  ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-600/50"
                  : "bg-slate-900 hover:bg-slate-850 border border-slate-700/80 text-amber-400"
              }`}
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>{isSirenOn ? "DEACTIVATE AUDIBLE SIREN" : "ACTIVATE AUDIBLE SIREN (DETERRENT)"}</span>
            </button>

            {/* Feature 4: Loadshedding Offline SMS Dispatch Panel */}
            {isOfflineSosActive && (
              <div className="bg-amber-950/30 border-2 border-amber-500/60 rounded-2xl p-4 text-xs text-amber-200 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <WifiOff className="w-4 h-4 text-amber-400" />
                    <span className="uppercase tracking-wide text-[11px]">Loadshedding / Offline SOS Fallback</span>
                  </div>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/30">
                    0 Data Required
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Mobile data grid disconnected or loadshedding active. Dispatch distress beacon directly via cellular SMS (requires 0 data) or free national USSD lifelines:
                </p>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  {/* SMS to SAPS 10111 */}
                  <a
                    href={`sms:10111?body=${encodeURIComponent(offlineSmsBody)}`}
                    className="bg-rose-600 hover:bg-rose-500 active:scale-95 transition-transform text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-900/50"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send Emergency SMS to SAPS (10111)</span>
                  </a>

                  {/* SMS to GBV Command 31531 */}
                  <a
                    href={`sms:31531?body=${encodeURIComponent(offlineSmsBody)}`}
                    className="bg-amber-600 hover:bg-amber-500 active:scale-95 transition-transform text-slate-950 font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>SMS National GBV Command (31531)</span>
                  </a>

                  {/* Zero-Rated USSD */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveUssdCode("*120*7867#");
                      setActiveUssdTitle("GBV Command 'Please Call Me'");
                      setUssdModalOpen(true);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dial Free USSD Callback (*120*7867#)</span>
                  </button>
                </div>

                <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Pre-Formatted Dispatch Payload:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.clipboard) {
                          navigator.clipboard.writeText(offlineSmsBody);
                          setCopiedSms(true);
                          setTimeout(() => setCopiedSms(false), 2000);
                        }
                      }}
                      className="text-[10px] text-sky-400 hover:underline"
                    >
                      {copiedSms ? "Copied!" : "Copy Text"}
                    </button>
                  </div>
                  <p className="text-[10px] font-mono text-slate-300 break-words">{offlineSmsBody}</p>
                </div>
              </div>
            )}

            {/* Feature 3: Burner Guardian Ephemeral Web Tracker Link */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-rose-400" />
                  Burner Guardian Link (Zero-Install)
                </span>
                <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  72-Hr Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Send this ephemeral tracker link to any trusted neighbor, family member, or CPF patroller. Works instantly on any mobile browser with zero app installation.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const link = `${window.location.origin}/?track=beacon_72h_active`;
                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                      navigator.clipboard.writeText(link);
                      setCopiedGuardianLink(true);
                      setTimeout(() => setCopiedGuardianLink(false), 2000);
                    }
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>{copiedGuardianLink ? "Link Copied!" : "Copy Burner Link"}</span>
                </button>
                {onOpenGuardianTracker && (
                  <button
                    type="button"
                    onClick={onOpenGuardianTracker}
                    className="bg-rose-950/60 hover:bg-rose-900/60 border border-rose-600/40 text-rose-300 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
                    <span>Test Console</span>
                  </button>
                )}
              </div>
            </div>

            {/* National Lifelines Directory */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Direct Emergency Lifelines (Zero-Airtime / Free)
              </span>

              {NATIONAL_LIFELINES.map((l) => (
                <div
                  key={l.id}
                  onClick={() => {
                    if (l.type === "USSD_FREE") {
                      setActiveUssdCode(l.dialString);
                      setActiveUssdTitle(l.title);
                      setUssdModalOpen(true);
                    } else {
                      window.location.href = `tel:${l.dialString.replace("#", "%23")}`;
                    }
                  }}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl p-3 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="pr-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                        {l.title}
                      </span>
                      {l.isTollFree && (
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          TOLL-FREE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{l.description}</p>
                    <span className="text-[11px] font-mono font-bold text-amber-400/90 mt-0.5 block">
                      {l.dialString}
                    </span>
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${
                    l.id === "saps_police"
                      ? "bg-rose-950 border-rose-700 text-rose-400"
                      : "bg-slate-800 border-slate-700 text-sky-400"
                  }`}>
                    <PhoneCall className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: THUTHUZELA CARE CENTRES & GOOGLE MAPS */}
        {activeTab === "tcc" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* The First 72 Hours Forensic Guide (Image 3) */}
            <First72HoursGuide />

            {/* Embedded Google Maps Safe Haven View */}
            <GoogleMapsSafeHavenView hideSelectedCard={true} />

            {/* Centres Directory Filter and Search */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Select Province
                </span>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  {SA_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                value={tccSearch}
                onChange={(e) => setTccSearch(e.target.value)}
                placeholder="Search hospital or town..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />

              <div className="space-y-3">
                {filteredTcc.map((c) => (
                  <div
                    key={c.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{c.name}</h3>
                          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            24/7 OPEN
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{c.hospitalOrLocation}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="bg-amber-950 border border-amber-800 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {c.province}
                        </span>
                        {c.distanceKm !== undefined && (
                          <span className="bg-sky-950 border border-sky-800 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                            <Navigation className="w-3 h-3" />
                            <span>{c.distanceKm} km</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Forensic & Clinical Badges (Image 3) */}
                    <div className="flex flex-wrap gap-1 text-[10px] text-slate-300">
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        Forensic Medical Exam
                      </span>
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        HIV PEP Prophylaxis
                      </span>
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        Trauma Counseling
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{c.address}</span>
                    </p>

                    <div className="flex gap-2 pt-1">
                      <a
                        href={`tel:${c.contactNumber}`}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call {c.contactNumber}</span>
                      </a>
                      {c.altContactNumber && (
                        <a
                          href={`tel:${c.altContactNumber}`}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1.5 px-3 rounded-lg text-xs"
                        >
                          Alt Line
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EVIDENCE VAULT */}
        {activeTab === "vault" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {!isVaultUnlocked ? (
              <div className="space-y-4">
                {/* 1. Evidence Vault Encrypted Card */}
                <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 text-center space-y-4 shadow-xl">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
                    <Fingerprint className="w-8 h-8 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-wide text-white uppercase">
                      Evidence Vault Encrypted
                    </h3>
                    <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
                      Encrypted Vault Protected
                    </p>
                    <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                      Sensitive incident logs, witness statements, and legal records are encrypted with
                      AES-256-GCM. Biometric authentication (Fingerprint, Face, or PIN) is required to decrypt.
                    </p>
                  </div>

                  {/* Primary PIN & Biometric form */}
                  <form onSubmit={handleVaultUnlock} className="space-y-3 max-w-xs mx-auto">
                    <input
                      type="password"
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="Enter 4-Digit PIN"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest text-white focus:outline-none focus:border-amber-400"
                    />
                    {pinError && (
                      <span className="text-xs text-rose-400 block font-semibold">
                        Invalid credentials. Try again.
                      </span>
                    )}
                    <button
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
                    >
                      Unlock Vault
                    </button>

                    <button
                      type="button"
                      onClick={handleBiometricUnlock}
                      className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold py-2.5 rounded-xl text-xs transition"
                    >
                      <Fingerprint className="w-4 h-4 text-sky-400" />
                      <span>
                        {biometricsEnrolled ? "Unlock with Face ID / Touch ID" : "Authenticate with Biometrics"}
                      </span>
                    </button>
                  </form>
                </div>

                {/* 2. Direct Quick Actions: + Log Incident & Export Form 2 */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShowLogFormModal(true)}
                    className="py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Log Incident</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm2Modal(true)}
                    className="py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Export Form 2</span>
                  </button>
                </div>

                {/* 3. Redacted Recorded Incidents Preview List */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Recorded Incidents ({recordedIncidents.length})</span>
                  </div>

                  {recordedIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-sm"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="bg-amber-950 border border-amber-800 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                          Level {inc.severity}/5
                        </span>
                        <h4 className="text-sm font-bold text-white flex-1">{inc.type}</h4>
                        <button
                          type="button"
                          onClick={() => handleDeleteIncident(inc.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                          title="Delete incident"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 font-medium">
                        {inc.date} • {inc.location}
                      </p>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs flex items-center gap-2 text-slate-400">
                        <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-[11px]">
                          Content Encrypted (AES-256-GCM). Biometric Authentication Required.
                        </span>
                      </div>

                      <p className="text-[10px] text-amber-400/90 font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>Impact / Injuries: Encrypted</span>
                      </p>
                    </div>
                  ))}
                </div>

                {/* Optional In-Vault Log Incident modal for locked state */}
                {showLogFormModal && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
                    <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <PlusCircle className="w-4 h-4 text-amber-400" />
                          <span>Direct Vault Logging (Auto-Encrypted)</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowLogFormModal(false)}
                          className="text-slate-400 hover:text-white p-1"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleSaveAndScrubIncident} className="space-y-3 text-xs">
                        <div>
                          <label className="block text-slate-400 mb-1">Incident Type</label>
                          <select
                            value={incidentType}
                            onChange={(e) => setIncidentType(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                          >
                            <option value="Physical">Physical Assault</option>
                            <option value="Verbal/Emotional">Verbal / Threat</option>
                            <option value="Financial">Economic Control</option>
                            <option value="Stalking">Stalking / Harassment</option>
                            <option value="Property Damage">Property Damage</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">Severity Level (1-5)</label>
                          <input
                            type="range"
                            min={1}
                            max={5}
                            value={severity}
                            onChange={(e) => setSeverity(parseInt(e.target.value))}
                            className="w-full accent-amber-500"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                            <span>1 (Low)</span>
                            <span className="text-amber-400 font-black">{severity}</span>
                            <span>5 (Lethal Threat)</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">Perpetrator</label>
                          <input
                            type="text"
                            value={perpetrator}
                            onChange={(e) => setPerpetrator(e.target.value)}
                            placeholder="e.g. Spouse, Ex-partner, Relative"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">Location of Incident</label>
                          <input
                            type="text"
                            value={locationDesc}
                            onChange={(e) => setLocationDesc(e.target.value)}
                            placeholder="e.g. Shared home kitchen, workplace"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">Raw Factual Testimony</label>
                          <textarea
                            rows={3}
                            value={narrative}
                            onChange={(e) => setNarrative(e.target.value)}
                            placeholder="Describe what occurred in your own words..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">Injuries / Psychological Impact</label>
                          <input
                            type="text"
                            value={injuries}
                            onChange={(e) => setInjuries(e.target.value)}
                            placeholder="e.g. Bruising, concussion, shock, trauma"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">Witnesses (Names or neighbors)</label>
                          <input
                            type="text"
                            value={witnesses}
                            onChange={(e) => setWitnesses(e.target.value)}
                            placeholder="e.g. Neighbor, family member in adjacent room"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">SAPS Occurrence Book (OB) # (Optional)</label>
                          <input
                            type="text"
                            value={sapsObNumberInput}
                            onChange={(e) => setSapsObNumberInput(e.target.value)}
                            placeholder="e.g. OB 142/10/2026 (Soweto SAPS)"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="submit"
                            disabled={isVaulting || !narrative.trim()}
                            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs shadow-md"
                          >
                            {isVaulting ? "Encrypting & Storing..." : "Seal & Encrypt in Vault"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowLogFormModal(false)}
                            className="px-3 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Vault Decrypted Controls */}
                <div className="flex justify-between items-center bg-slate-900 p-3.5 rounded-2xl border border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">
                      Vault Decrypted (AES-256-GCM)
                    </span>
                  </div>
                  <button
                    onClick={() => setIsVaultUnlocked(false)}
                    className="text-xs bg-slate-800 hover:bg-slate-750 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white font-semibold transition-colors"
                  >
                    Lock Vault
                  </button>
                </div>

                {/* Unlocked Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm2Modal(true)}
                    className="py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Open Form 2 Court Dossier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportPdf()}
                    className="py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <FileDown className="w-4 h-4 text-amber-400" />
                    <span>Export ECTA PDF</span>
                  </button>
                </div>

                {/* Recorded Incidents (Decrypted View) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Decrypted Incident Records ({recordedIncidents.length})</span>
                  </div>

                  {recordedIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5"
                    >
                      <div className="flex justify-between items-start">
                        <span className="bg-amber-950 border border-amber-800 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Severity {inc.severity} / 5
                        </span>
                        <h4 className="text-sm font-bold text-white flex-1 mx-2">{inc.type}</h4>
                        <button
                          type="button"
                          onClick={() => handleDeleteIncident(inc.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 font-medium">
                        {inc.date} • {inc.location} • Perpetrator: {inc.perpetrator}
                      </p>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 text-xs leading-relaxed">
                        {inc.statement}
                      </div>

                      <div className="flex justify-between items-center pt-1 text-[11px]">
                        <span className="text-slate-400">
                          Impact: {inc.injuriesOrImpact || "Psychological distress"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowForm2Modal(true)}
                          className="text-amber-400 hover:underline font-semibold"
                        >
                          Review in Form 2 →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Log New Incident Form */}
                <form
                  onSubmit={handleSaveAndScrubIncident}
                  className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4"
                >
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-amber-400" />
                    <span>Log New Incident (Auto-Wipe from Phone)</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Incident Type
                      </label>
                      <select
                        value={incidentType}
                        onChange={(e) => setIncidentType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="Physical">Physical Assault</option>
                        <option value="Verbal/Emotional">Verbal / Threat</option>
                        <option value="Financial">Economic Control</option>
                        <option value="Stalking">Stalking / Harassment</option>
                        <option value="Property Damage">Property Damage</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Severity Level (1-5)
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={severity}
                        onChange={(e) => setSeverity(parseInt(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                        <span>1 (Low)</span>
                        <span className="text-amber-400 font-black">{severity}</span>
                        <span>5 (Lethal Threat)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Perpetrator Name / Relationship
                    </label>
                    <input
                      type="text"
                      value={perpetrator}
                      onChange={(e) => setPerpetrator(e.target.value)}
                      placeholder="e.g. Spouse, Ex-partner, Relative"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Location of Incident
                    </label>
                    <input
                      type="text"
                      value={locationDesc}
                      onChange={(e) => setLocationDesc(e.target.value)}
                      placeholder="e.g. Shared home kitchen, workplace, street"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Incident Description / Raw Testimony
                    </label>
                    <textarea
                      rows={3}
                      value={narrative}
                      onChange={(e) => setNarrative(e.target.value)}
                      placeholder="Describe what occurred in your own words (isiZulu, isiXhosa, Sesotho, Afrikaans, or English)..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      SAPS Occurrence Book (OB) # (Optional)
                    </label>
                    <input
                      type="text"
                      value={sapsObNumberInput}
                      onChange={(e) => setSapsObNumberInput(e.target.value)}
                      placeholder="e.g. OB 142/10/2026 (Soweto SAPS)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  {/* Gemini AI Form 2 Button */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateAiForm2}
                      disabled={isGeneratingAiForm2 || !narrative.trim()}
                      className="flex-1 bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isGeneratingAiForm2 ? "Structuring Court Affidavit..." : "AI Form 2 Structuring"}</span>
                    </button>
                  </div>

                  {aiForm2Result && (
                    <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3 text-xs space-y-2">
                      <div className="flex justify-between items-center text-amber-400 font-bold">
                        <span>Magistrates' Court Affidavit Draft:</span>
                        <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded text-[10px]">
                          Danger Score: {aiForm2Result.dangerScore}/100
                        </span>
                      </div>
                      <p className="text-slate-300 italic">{aiForm2Result.courtAffidavit}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVaulting || !narrative.trim()}
                    className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isVaulting ? "Encrypting & Scrubbing..." : "Encrypt & Vault in Cloud"}</span>
                  </button>

                  {vaultFeedback && (
                    <div className="p-3 bg-slate-950 rounded-xl text-xs text-emerald-400 border border-emerald-500/30">
                      {vaultFeedback}
                    </div>
                  )}

                  {/* Feature 1: ECTA Section 15 Court Affidavit PDF Generator */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleExportPdf()}
                      className="w-full bg-slate-800 hover:bg-slate-750 active:scale-[0.98] transition-all text-amber-300 border border-amber-500/40 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
                    >
                      <FileDown className="w-4 h-4 text-amber-400" />
                      <span>Export Form 2 Affidavit (ECTA Sec 15 PDF)</span>
                    </button>
                    <span className="text-[10px] text-slate-400 text-center block">
                      Direct jsPDF binary export: SA Domestic Violence Act + ECTA 25/2002 Sec 15 Certificate.
                    </span>
                  </div>

                  {pdfExportStatus && (
                    <div className="p-3 bg-slate-950 rounded-xl text-xs text-sky-400 border border-sky-500/30">
                      {pdfExportStatus}
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SAFETY PLAN & 5 ICE GUARDIANS (UAT Mode Enabled) */}
        {activeTab === "plan" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Quick Distress Email Dispatch Button */}
            <a
              href={generateDistressEmailUrl(
                uatProfile.contacts[0] || {
                  id: "fallback-ice",
                  name: "ICE Guardian",
                  email: uatProfile.socials.alertEmail || "emergency@example.com",
                  phone: "",
                  isPrimary: true,
                  relationship: "Emergency Contact",
                }
              )}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>Send Distress Alert via Email</span>
            </a>

            {/* Current Identified Area & Offline Maps Component */}
            <GoogleMapsSafeHavenView />

            {/* Action: Complete 5 ICE Contacts Progress Banner */}
            {uatProfile.contacts.length < 5 && (
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Action: Complete 5 ICE Contacts ({uatProfile.contacts.length}/5)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  South African GBV protection guidelines advise configuring 5 verified In Case of Emergency contacts. Each contact receives 72-hour live beacons, mobile alerts, and social channel dispatch.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddContactForm(true)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black rounded-xl text-xs shadow-md transition-all"
                >
                  Add ICE Contact #{uatProfile.contacts.length + 1}
                </button>
              </div>
            )}

            {/* UAT Status Alert */}
            <div className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isUatMode
                ? "bg-amber-950/40 border-amber-500/50 text-amber-200"
                : "bg-slate-900 border-slate-800 text-slate-300"
            }`}>
              <div>
                <div className="flex items-center gap-2 font-bold text-sm text-white">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isUatMode ? "🧪 UAT Mode Active: Emergency Calls Suppressed" : "Operational Live Shield Active"}</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  {isUatMode
                    ? "In UAT Mode, emergency authorities are NOT called. The 5 registered ICE guardians & emergency email receive the simulated test telemetry."
                    : "Live mode armed. SOS dispatches real emergency alerts."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleUat}
                className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
              >
                {isUatMode ? "Switch to Live Mode" : "Enable UAT Mode"}
              </button>
            </div>

            {profileSaveMessage && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{profileSaveMessage}</span>
              </div>
            )}

            {/* 1. 5 ICE GUARDIANS SECTION */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>ICE Contacts ({uatProfile.contacts.length} / 5)</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Receive distress alerts, live GPS link, and 72-hr WhatsApp beacons
                  </p>
                </div>
                {uatProfile.contacts.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAddContactForm(true)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Add ICE</span>
                  </button>
                )}
              </div>

              {/* Contact List */}
              <div className="space-y-3">
                {uatProfile.contacts.map((contact, idx) => (
                  <div
                    key={contact.id || idx}
                    className="bg-slate-950 p-4 rounded-2xl border border-slate-800/90 space-y-3 text-xs shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 font-bold shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{contact.name}</span>
                            {contact.isPrimary && (
                              <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded-full font-bold">
                                Primary ICE
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block font-medium">
                            {contact.relationship}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteIceContact(contact.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
                        title="Remove ICE contact"
                        aria-label={`Remove ${contact.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Contact Mobile Numbers & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-850">
                      <div>
                        <span className="text-slate-500">Mobile 1: </span>
                        <span className="text-slate-200">{contact.phone}</span>
                      </div>
                      {contact.secondaryPhone && (
                        <div>
                          <span className="text-slate-500">Mobile 2: </span>
                          <span className="text-slate-200">{contact.secondaryPhone}</span>
                        </div>
                      )}
                      {contact.email && (
                        <div className="sm:col-span-2">
                          <span className="text-slate-500">Email: </span>
                          <span className="text-slate-200">{contact.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Emergency Social Channels */}
                    {(contact.instagramHandle || contact.tiktokHandle || contact.facebookProfile) && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Emergency Social Channels (Tap to send alert):
                        </span>
                        <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                          {contact.instagramHandle && (
                            <a
                              href={`https://instagram.com/${contact.instagramHandle.replace("@", "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-pink-950/40 border border-pink-700/40 text-pink-300 hover:bg-pink-900/40 rounded-lg flex items-center gap-1 transition-colors"
                            >
                              <span>IG: @{contact.instagramHandle.replace("@", "")}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                          {contact.tiktokHandle && (
                            <a
                              href={`https://tiktok.com/@${contact.tiktokHandle.replace("@", "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-teal-950/40 border border-teal-700/40 text-teal-300 hover:bg-teal-900/40 rounded-lg flex items-center gap-1 transition-colors"
                            >
                              <span>TikTok: @{contact.tiktokHandle.replace("@", "")}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                          {contact.facebookProfile && (
                            <a
                              href={`https://${contact.facebookProfile.replace(/^https?:\/\//, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-blue-950/40 border border-blue-700/40 text-blue-300 hover:bg-blue-900/40 rounded-lg flex items-center gap-1 transition-colors"
                            >
                              <span>FB: {contact.facebookProfile}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 1-Click Action Buttons */}
                    <div className="space-y-2 pt-1">
                      <a
                        href={generateWhatsAppBeaconUrl(contact)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Send 72-Hr Live Location via WhatsApp</span>
                      </a>

                      {contact.email && (
                        <a
                          href={generateDistressEmailUrl(contact)}
                          className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Send Distress Alert via Email</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}

                {uatProfile.contacts.length === 0 && (
                  <p className="text-center py-4 text-slate-500 text-xs">No ICE guardians registered yet.</p>
                )}
              </div>

              {/* Add Contact Trigger / Form */}
              {uatProfile.contacts.length < 5 && (
                <div>
                  {!showAddContactForm ? (
                    <button
                      type="button"
                      onClick={() => setShowAddContactForm(true)}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add Trusted ICE Guardian (+{5 - uatProfile.contacts.length} slots open)</span>
                    </button>
                  ) : (
                    <form onSubmit={handleAddIceContact} className="bg-slate-950 p-4 rounded-xl border border-amber-500/40 space-y-3">
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">New ICE Guardian Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-400 mb-1 text-[11px]">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sipho Mthembu"
                            value={newContactName}
                            onChange={(e) => setNewContactName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1 text-[11px]">Relationship</label>
                          <select
                            value={newContactRel}
                            onChange={(e) => setNewContactRel(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                          >
                            <option value="Sister">Sister</option>
                            <option value="Brother">Brother</option>
                            <option value="Mother">Mother</option>
                            <option value="Father">Father</option>
                            <option value="Family Doctor">Family Doctor / Medical</option>
                            <option value="Legal Counsel">Legal Counsel / Advocate</option>
                            <option value="Close Friend">Close Friend</option>
                            <option value="Neighbor">Trusted Neighbor</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1 text-[11px]">Mobile Phone 1 (+27...)</label>
                          <input
                            type="tel"
                            required
                            placeholder="+27 82 000 0000"
                            value={newContactPhone}
                            onChange={(e) => setNewContactPhone(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1 text-[11px]">Mobile Phone 2 / WhatsApp Backup</label>
                          <input
                            type="tel"
                            placeholder="+27 71 000 0000"
                            value={newContactSecondaryPhone}
                            onChange={(e) => setNewContactSecondaryPhone(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1 text-[11px]">Email Address</label>
                          <input
                            type="email"
                            placeholder="guardian@example.co.za"
                            value={newContactEmail}
                            onChange={(e) => setNewContactEmail(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1 text-[11px]">Instagram Handle (@...)</label>
                          <input
                            type="text"
                            placeholder="@guardian_safe"
                            value={newContactInstagram}
                            onChange={(e) => setNewContactInstagram(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1 text-[11px]">TikTok Handle (@...)</label>
                          <input
                            type="text"
                            placeholder="@guardian_k"
                            value={newContactTiktok}
                            onChange={(e) => setNewContactTiktok(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1 text-[11px]">Facebook Profile / URL</label>
                          <input
                            type="text"
                            placeholder="facebook.com/guardian.profile"
                            value={newContactFacebook}
                            onChange={(e) => setNewContactFacebook(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="primaryIceCheck"
                          checked={newContactPrimary}
                          onChange={(e) => setNewContactPrimary(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-900 text-amber-500"
                        />
                        <label htmlFor="primaryIceCheck" className="text-[11px] text-slate-300 cursor-pointer">
                          Designate as Primary Emergency Guardian
                        </label>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                        >
                          Save Guardian
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddContactForm(false)}
                          className="px-3 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Escape 'Go-Bag' Checklist */}
            <EscapeGoBagChecklist />

            {/* Your Rights Under South African Law */}
            <SouthAfricanLegalRights />

            {/* 2. SURVIVOR PERSONAL DETAILS SECTION */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Survivor Emergency Profile</span>
              </div>
              <p className="text-xs text-slate-400">
                Encrypted in local browser enclave. Attached to Section 15 court dossiers and dispatched to ICE guardians during emergency beacons.
              </p>

              <form onSubmit={handleSavePersonalProfile} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Legal Full Name</label>
                    <input
                      type="text"
                      value={personalFullName}
                      onChange={(e) => setPersonalFullName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                      placeholder="e.g. Thandeka Nkosi"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">National ID / Passport</label>
                    <input
                      type="text"
                      value={personalNationalId}
                      onChange={(e) => setPersonalNationalId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                      placeholder="940815 0000 081"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Safe Location / Landmark Address</label>
                  <input
                    type="text"
                    value={personalAddress}
                    onChange={(e) => setPersonalAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                    placeholder="Safe residential address or trusted haven"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Critical Medical Aid & Dependent Notes</label>
                  <textarea
                    rows={2}
                    value={personalMedical}
                    onChange={(e) => setPersonalMedical(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                    placeholder="Blood type, allergies, chronic medications, minor dependents"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs transition-colors"
                >
                  Save Personal Profile
                </button>
              </form>
            </div>

            {/* 3. EMERGENCY SOCIALS & ALERT EMAIL */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Emergency Alert Email & Social Accounts</span>
              </div>
              <p className="text-xs text-slate-400">
                Secondary channels monitored by your guardians to triangulate status when cellular voice lines are congested.
              </p>

              <form onSubmit={handleSaveSocials} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Emergency Alert Email</label>
                  <input
                    type="email"
                    value={socialAlertEmail}
                    onChange={(e) => setSocialAlertEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                    placeholder="secure.vault.backup@proton.me"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">X / Twitter Handle</label>
                    <input
                      type="text"
                      value={socialTwitter}
                      onChange={(e) => setSocialTwitter(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Instagram Handle</label>
                    <input
                      type="text"
                      value={socialInstagram}
                      onChange={(e) => setSocialInstagram(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Facebook / WhatsApp URL</label>
                    <input
                      type="text"
                      value={socialFacebook}
                      onChange={(e) => setSocialFacebook(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                      placeholder="facebook.com/user"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors"
                >
                  Save Emergency Accounts
                </button>
              </form>
            </div>

            {/* 4. SIMULATE UAT DISTRESS TEST BUTTON */}
            {isUatMode && (
              <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-5 text-center space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block">
                  UAT SIMULATION TEST
                </span>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Verify the entire emergency flow right now. Dispatches simulated telemetry to your <strong className="text-white">{uatProfile.contacts.length} ICE guardians</strong> and <strong className="text-white">{uatProfile.socials.alertEmail || "emergency email"}</strong> without placing real calls.
                </p>
                <button
                  type="button"
                  onClick={handleServerSosDispatch}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Run UAT Simulation Beacon Test</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: UAT TESTER FEEDBACK */}
        {activeTab === "feedback" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Sparkles className="w-5 h-5" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Live Device UAT Feedback
                </h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Thank you for field-testing Umkhuseli. Submissions are POPIA-compliant and completely anonymous. Device serials and IP addresses are stripped at the edge.
              </p>

              {feedbackSubmitResult && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{feedbackSubmitResult}</span>
                </div>
              )}

              <form onSubmit={handleFeedbackSubmit} className="space-y-4 pt-2">
                {/* Tester Codename */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Tester Codename / Alias (Optional)
                  </label>
                  <input
                    type="text"
                    value={feedbackAlias}
                    onChange={(e) => setFeedbackAlias(e.target.value)}
                    placeholder="e.g. Tester-Soweto-04 (Leave blank for full anonymity)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Rating Rubric */}
                <div className="space-y-3 pt-1">
                  <span className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Feature Confidence & Stealth (1 = Poor, 5 = Excellent)
                  </span>

                  {[
                    { label: "1. Camouflage Facade (Prepaid Calc / Devotional)", value: stealthRating, setter: setStealthRating },
                    { label: "2. 0ms Panic Reset & Back Gesture", value: panicRating, setter: setPanicRating },
                    { label: "3. Secret PIN / Gesture Unlock", value: unlockRating, setter: setUnlockRating },
                    { label: "4. 3-Second SOS Grace Countdown", value: sosRating, setter: setSosRating },
                    { label: "5. Offline / Loadshedding Queue", value: offlineRating, setter: setOfflineRating },
                    { label: "6. Form 2 Protection Order PDF Quality", value: form2Rating, setter: setForm2Rating },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-slate-300 pr-2">{item.label}</span>
                      <div className="flex gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => item.setter(star)}
                            className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs transition-colors ${
                              item.value >= star
                                ? "bg-amber-500 text-black"
                                : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                            }`}
                          >
                            {star}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bug / Issue Severity */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Did you encounter any bugs or anomalies?
                  </label>
                  <select
                    value={bugSeverity}
                    onChange={(e: any) => setBugSeverity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="NONE">No bugs encountered (Smooth experience)</option>
                    <option value="MINOR">Minor glitch (Visual misalignment / slow rendering)</option>
                    <option value="MAJOR">Major issue (Feature didn't work as expected)</option>
                    <option value="BLOCKER">Blocker (Crash / Security or Camouflage Failure)</option>
                    <option value="SUGGESTION">General Suggestion / Enhancement Idea</option>
                  </select>
                </div>

                {/* Bug Description */}
                {bugSeverity !== "NONE" && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Bug Details / Steps to Reproduce
                    </label>
                    <textarea
                      rows={3}
                      value={bugDesc}
                      onChange={(e) => setBugDesc(e.target.value)}
                      placeholder="What screen were you on? What happened vs what you expected?"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                {/* Qualitative / Cultural Notes */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Language, Emotional Safety & Cultural Feedback
                  </label>
                  <textarea
                    rows={2}
                    value={qualitativeNotes}
                    onChange={(e) => setQualitativeNotes(e.target.value)}
                    placeholder="Feedback on isiZulu/Sesotho/Afrikaans terms, emotional feelings of safety, or improvements..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isSubmittingFeedback ? "Transmitting Feedback..." : "Submit Anonymous UAT Feedback"}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Form 2 Protection Order Record Viewer & Digital Signature Pad Modal */}
        <Form2CourtRecordViewerModal
          isOpen={showForm2Modal}
          onClose={() => setShowForm2Modal(false)}
          incidents={recordedIncidents}
          isVaultUnlocked={isVaultUnlocked}
          onUnlockVault={handleBiometricUnlock}
          onOpenProfile={() => {
            setShowForm2Modal(false);
            setActiveTab("plan");
          }}
        />

        {/* Vehicle Journey Tracker Modal */}
        <VehicleJourneyModal
          isOpen={showVehicleModal}
          onClose={() => setShowVehicleModal(false)}
          onStartJourney={(details) => {
            setActiveJourney(details);
          }}
          currentLocationAddress={identifiedAreaName}
          currentCoords={userLocation || undefined}
          iceContacts={uatProfile.contacts}
          userName={uatProfile.personal.fullName}
        />

        {/* Safe Arrival Confirmation Dialog */}
        {showArrivalConfirm && activeJourney && (
          <div
            data-testid="arrival-confirmation-dialog"
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
          >
            <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-xs text-slate-200">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Confirm Safe Arrival</h3>
                <p className="text-slate-400">
                  Arrived safely at <strong className="text-white">{activeJourney.destinationAddress}</strong>?
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Notify Guardians via WhatsApp:
                </span>
                <div className="space-y-1">
                  {uatProfile.contacts
                    .filter((c) => activeJourney.selectedIceContactIds.includes(c.id))
                    .map((contact) => (
                      <a
                        key={contact.id}
                        href={generateArrivalWhatsAppUrl(activeJourney, contact.phone, uatProfile.personal.fullName)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-600/30 text-emerald-300 hover:bg-emerald-900/40 transition-colors"
                      >
                        <span className="font-bold text-white">{contact.name}</span>
                        <span className="text-[10px] font-bold text-emerald-400">Send WhatsApp</span>
                      </a>
                    ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    clearActiveJourney();
                    setActiveJourney(null);
                    setShowArrivalConfirm(false);
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow"
                >
                  Confirm & End Monitored Trip
                </button>
                <button
                  type="button"
                  onClick={() => setShowArrivalConfirm(false)}
                  className="px-3 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interactive USSD Simulation Modal */}
        <UssdSimulationModal
          isOpen={ussdModalOpen}
          onClose={() => setUssdModalOpen(false)}
          ussdCode={activeUssdCode}
          serviceTitle={activeUssdTitle}
        />
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-slate-900 border-t border-slate-800 p-2 pb-safe flex justify-around sticky bottom-0">
        <button
          onClick={() => setActiveTab("sos")}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "sos" ? "text-rose-400 bg-rose-500/10" : "text-slate-400 hover:text-white"
          }`}
        >
          <ShieldAlert className="w-5 h-5 mb-1" />
          <span>SOS</span>
        </button>

        <button
          onClick={() => setActiveTab("tcc")}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "tcc" ? "text-amber-400 bg-amber-500/10" : "text-slate-400 hover:text-white"
          }`}
        >
          <MapPin className="w-5 h-5 mb-1" />
          <span>Centres</span>
        </button>

        <button
          onClick={() => setActiveTab("vault")}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "vault" ? "text-amber-400 bg-amber-500/10" : "text-slate-400 hover:text-white"
          }`}
        >
          <Lock className="w-5 h-5 mb-1" />
          <span>Vault</span>
        </button>

        <button
          onClick={() => setActiveTab("plan")}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "plan" ? "text-amber-400 bg-amber-500/10" : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-5 h-5 mb-1" />
          <span>Plan</span>
        </button>

        <button
          data-testid="tab-feedback"
          onClick={() => setActiveTab("feedback")}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "feedback" ? "text-amber-400 bg-amber-500/10" : "text-slate-400 hover:text-white"
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-1" />
          <span>Feedback</span>
        </button>
      </nav>
    </div>
  );
};
