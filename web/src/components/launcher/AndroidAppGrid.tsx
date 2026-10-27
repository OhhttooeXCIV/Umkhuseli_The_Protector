import React from "react";
import {
  Phone,
  MessageSquare,
  Camera,
  Zap,
  BookOpen,
  Settings,
  MapPin,
  Image,
  Radio,
  ShieldCheck,
  Music,
} from "lucide-react";
import { setActiveDisguise } from "../../services/disguiseManager";

interface AndroidAppGridProps {
  onOpenDialer: () => void;
  onOpenSettings: () => void;
  onOpenMessages: () => void;
  onOpenMockApp: (appName: string, info: string) => void;
  onUnlockSafeHaven: () => void;
}

interface AppIconItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  bgGradient: string;
  onClick: () => void;
}

export const AndroidAppGrid: React.FC<AndroidAppGridProps> = ({
  onOpenDialer,
  onOpenSettings,
  onOpenMessages,
  onOpenMockApp,
  onUnlockSafeHaven,
}) => {
  const apps: AppIconItem[] = [
    {
      id: "phone",
      name: "Phone",
      icon: <Phone className="w-6 h-6 text-white fill-current" />,
      bgGradient: "bg-emerald-500 shadow-emerald-500/25",
      onClick: onOpenDialer,
    },
    {
      id: "messages",
      name: "Messages",
      icon: <MessageSquare className="w-6 h-6 text-white" />,
      bgGradient: "bg-sky-500 shadow-sky-500/25",
      onClick: onOpenMessages,
    },
    {
      id: "camera",
      name: "Camera",
      icon: <Camera className="w-6 h-6 text-white" />,
      bgGradient: "bg-rose-500 shadow-rose-500/25",
      onClick: () => onOpenMockApp("Camera", "Ultra-wide lens active • Ready to capture."),
    },
    {
      id: "powercalc",
      name: "PowerCalc",
      icon: <Zap className="w-6 h-6 text-white fill-current" />,
      bgGradient: "bg-amber-500 shadow-amber-500/25",
      onClick: () => {
        setActiveDisguise("MUNICIPAL_PREPAID");
      },
    },
    {
      id: "bible",
      name: "Daily Bible",
      icon: <BookOpen className="w-6 h-6 text-white" />,
      bgGradient: "bg-indigo-600 shadow-indigo-600/25",
      onClick: () => {
        setActiveDisguise("DAILY_DEVOTIONAL");
      },
    },
    {
      id: "music",
      name: "Music",
      icon: <Music className="w-6 h-6 text-white" />,
      bgGradient: "bg-fuchsia-600 shadow-fuchsia-600/25",
      onClick: () => onOpenMockApp("Music", "South African Hitlist: Amapiano Grooves Vol. 4 (Offline)"),
    },
    {
      id: "maps",
      name: "Maps",
      icon: <MapPin className="w-6 h-6 text-white" />,
      bgGradient: "bg-blue-600 shadow-blue-600/25",
      onClick: onUnlockSafeHaven, // Covert quick shortcut directly to safe haven maps
    },
    {
      id: "gallery",
      name: "Gallery",
      icon: <Image className="w-6 h-6 text-white" />,
      bgGradient: "bg-teal-500 shadow-teal-500/25",
      onClick: () => onOpenMockApp("Gallery", "128 Photos • 0 Pending Cloud Uploads"),
    },
    {
      id: "radio",
      name: "FM Radio",
      icon: <Radio className="w-6 h-6 text-white" />,
      bgGradient: "bg-orange-500 shadow-orange-500/25",
      onClick: () => onOpenMockApp("FM Radio", "Tuned to 94.7 Highveld Stereo • Signal Strong"),
    },
    {
      id: "security",
      name: "Security",
      icon: <ShieldCheck className="w-6 h-6 text-white" />,
      bgGradient: "bg-green-600 shadow-green-600/25",
      onClick: () => onOpenMockApp("Device Security", "Google Play Protect: No harmful apps found • System Secure"),
    },
    {
      id: "settings",
      name: "Settings",
      icon: <Settings className="w-6 h-6 text-white" />,
      bgGradient: "bg-slate-700 shadow-slate-700/25",
      onClick: onOpenSettings,
    },
  ];

  return (
    <div className="w-full px-4 py-3 flex-1 flex flex-col justify-center">
      <div className="grid grid-cols-4 gap-y-6 gap-x-3 sm:gap-x-6 max-w-sm sm:max-w-md mx-auto w-full">
        {apps.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={app.onClick}
            className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform select-none"
            aria-label={`Open ${app.name}`}
          >
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${app.bgGradient}`}
            >
              {app.icon}
            </div>
            <span className="text-xs font-medium text-slate-100 drop-shadow text-center tracking-tight truncate max-w-[70px]">
              {app.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
