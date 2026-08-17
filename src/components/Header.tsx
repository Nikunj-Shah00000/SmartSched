import React from "react";
import {
  Zap,
  Crosshair,
  FileSearch,
  Calendar,
  Users,
  LineChart,
  Volume2,
  VolumeX,
  Heart,
  Sparkles,
} from "lucide-react";
import { isSoundMuted, toggleMuteSound } from "../utils/audio";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unresolvedAlertCount: number;
  expLevel: number;
  systemHealthHearts: number; // 0 to 10
  onMuteToggle: () => void;
  soundMuted: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  unresolvedAlertCount,
  expLevel,
  systemHealthHearts,
  onMuteToggle,
  soundMuted,
}) => {
  // Render 5 heart containers
  const renderHearts = () => {
    const hearts = [];
    for (let i = 0; i < 5; i++) {
      const heartValue = systemHealthHearts - i * 2;
      if (heartValue >= 2) {
        // Full Heart
        hearts.push(
          <span key={i} className="text-red-500 drop-shadow-[0_2px_0_#000] text-xl select-none" title="Full Health">
            ❤️
          </span>
        );
      } else if (heartValue === 1) {
        // Half Heart
        hearts.push(
          <span key={i} className="text-red-400 drop-shadow-[0_2px_0_#000] text-xl select-none" title="Half Health">
            💔
          </span>
        );
      } else {
        // Empty Heart
        hearts.push(
          <span key={i} className="text-neutral-700 drop-shadow-[0_2px_0_#000] text-xl select-none" title="Critical Health">
            🖤
          </span>
        );
      }
    }
    return hearts;
  };

  const navItems = [
    { id: "slingshot", label: "Slingshot Command Center", icon: Crosshair, badge: unresolvedAlertCount },
    { id: "crafting", label: "Crafting Extractor (AI Vision)", icon: FileSearch },
    { id: "redstone", label: "Redstone Timetable", icon: Calendar },
    { id: "attendance", label: "X-Ray Attendance", icon: Users },
    { id: "analytics", label: "Spawn Rate Analytics", icon: LineChart },
  ];

  return (
    <header className="bg-[#5B8731] border-4 border-[#2D4519] text-white p-3 sm:p-4 mb-4 select-none shadow-[inset_0_-4px_0_rgba(0,0,0,0.2),4px_4px_0_rgba(0,0,0,0.4)]">
      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-[#2D4519]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF5500] border-2 border-black flex items-center justify-center shadow-[4px_4px_0_#000]">
            <span className="text-white font-black text-xs leading-none">TNT</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-white font-black text-xl sm:text-2xl tracking-tight italic uppercase drop-shadow-[2px_2px_0_#2D4519]">
                Slingshot Command Center
              </h1>
              <span className="bg-[#FF5500] border border-black px-2 py-0.5 text-xs font-mono font-bold tracking-widest text-white animate-pulse">
                RIVERPOD: SYNCED
              </span>
            </div>
            <p className="text-xs text-emerald-100 font-mono">
              REDSTONE & SLINGSHOT OS • Gamified School Command Center & Physics Engine
            </p>
          </div>
        </div>

        {/* HUD Bars (Minecraft Hearts + EXP Level) */}
        <div className="flex flex-wrap items-center gap-3 bg-[#1a1a1a]/90 border-2 border-black p-2 px-3 shadow-[4px_4px_0_#000]">
          {/* Hearts */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono font-bold text-[#E0E0E0] uppercase tracking-widest mb-0.5">
              Server Health
            </span>
            <div className="flex items-center gap-1">{renderHearts()}</div>
          </div>

          <div className="h-8 w-0.5 bg-neutral-700 hidden sm:block" />

          {/* EXP Level */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-2 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
                <span>School EXP Level</span>
                <span className="text-amber-400">LVL {expLevel}</span>
              </div>
              <div className="exp-bar-bg w-32 sm:w-40">
                <div className="exp-bar-fill" style={{ width: `${Math.min(100, (expLevel / 100) * 100)}%` }} />
              </div>
            </div>
            <div className="w-7 h-7 bg-[#5B8731] border-2 border-black flex items-center justify-center font-mono font-black text-xs text-white shadow-[2px_2px_0_#000]">
              {expLevel}
            </div>
          </div>

          <div className="h-8 w-0.5 bg-neutral-700 hidden sm:block" />

          {/* Sound Toggle */}
          <button
            onClick={onMuteToggle}
            className="mc-button px-2.5 py-1.5 text-xs flex items-center gap-1 text-neutral-200"
            title={soundMuted ? "Unmute Retro SFX" : "Mute Retro SFX"}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span className="hidden lg:inline">{soundMuted ? "Muted" : "SFX On"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-mono text-xs sm:text-sm font-bold tracking-wide uppercase transition-all border-2 border-black ${
                isActive
                  ? "bg-[#FF5500] text-white shadow-[4px_4px_0_#000] translate-y-[-2px]"
                  : "bg-[#2D4519] text-emerald-100 hover:bg-[#3c5c22] hover:text-white shadow-[2px_2px_0_#000]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-amber-200" : "text-emerald-300"}`} />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-mono px-1.5 py-0.2 border border-black animate-bounce">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
