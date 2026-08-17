import React, { useState, useRef } from "react";
import { CommandAlert } from "../types";
import { playBoomSound, playSlingSound, playExpChime } from "../utils/audio";
import confetti from "canvas-confetti";
import { Crosshair, Zap, Flame, ShieldAlert, CheckCircle2, RotateCcw } from "lucide-react";

interface SlingshotProps {
  alerts: CommandAlert[];
  onResolveAlert: (alertId: string) => void;
  onResetAlerts: () => void;
}

export const SlingshotCommandCenter: React.FC<SlingshotProps> = ({
  alerts,
  onResolveAlert,
  onResetAlerts,
}) => {
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isFlying, setIsFlying] = useState(false);
  const [projectilePos, setProjectilePos] = useState({ x: 50, y: 150 });
  const [explosionEffect, setExplosionEffect] = useState<{ x: number; y: number; text: string } | null>(null);

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const resolvedAlerts = alerts.filter((a) => a.resolved);

  // Default target if none selected
  const targetAlert = alerts.find((a) => a.id === selectedAlertId) || activeAlerts[0] || null;

  const handleSlingLaunch = (targetId?: string) => {
    const alertToResolve = alerts.find((a) => a.id === (targetId || targetAlert?.id));
    if (!alertToResolve || alertToResolve.resolved) return;

    playSlingSound();
    setIsFlying(true);

    // Animate projectile flight towards the TNT structure
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const x = 50 + step * 25;
      const y = 150 - Math.sin((step / 10) * Math.PI) * 80 + step * 5;
      setProjectilePos({ x, y });

      if (step >= 10) {
        clearInterval(interval);
        setIsFlying(false);

        // BOOM! Hit the TNT Crate
        playBoomSound();
        playExpChime();

        // Trigger confetti explosion
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.4, x: 0.7 },
          colors: ["#ff0000", "#ff5500", "#ffff00", "#866043"],
        });

        setExplosionEffect({
          x: 280,
          y: 80,
          text: `BOOM! ${alertToResolve.title} DESTROYED! (+${alertToResolve.xpReward} EXP)`,
        });

        setTimeout(() => setExplosionEffect(null), 3000);

        onResolveAlert(alertToResolve.id);
        setProjectilePos({ x: 50, y: 150 });
      }
    }, 40);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert Bar */}
      <div className="mc-panel-wood p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600 border-2 border-black flex items-center justify-center text-white text-2xl font-mono font-black animate-bounce shadow-[2px_2px_0_#000]">
            💥
          </div>
          <div>
            <h2 className="font-mono text-xl font-bold text-amber-200 uppercase tracking-wide">
              Slingshot Command Center
            </h2>
            <p className="text-xs text-amber-100/80 font-mono">
              Aim slingshot at TNT bottlenecks to destroy double-bookings & administrative blockades!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onResetAlerts()}
            className="mc-button p-2 text-xs flex items-center gap-1.5 text-neutral-200"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Reset All Bottlenecks</span>
          </button>

          {activeAlerts.length > 0 && (
            <button
              onClick={() => handleSlingLaunch()}
              disabled={isFlying}
              className="mc-button-redstone px-4 py-2 text-sm font-black flex items-center gap-2 animate-pulse"
            >
              <Flame className="w-5 h-5 text-yellow-300" />
              <span>FIRE SLINGSHOT ({activeAlerts.length} Active)</span>
            </button>
          )}
        </div>
      </div>

      {/* Physics Slingshot Arena & TNT Target Structure */}
      <div className="mc-panel-obsidian p-4 sm:p-6 min-h-[320px] relative overflow-hidden flex flex-col justify-between">
        {/* Sky / Grid Background motif */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ff5500_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Title HUD */}
        <div className="relative z-10 flex items-center justify-between border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2 font-mono text-xs text-amber-400 font-bold uppercase">
            <Crosshair className="w-4 h-4 text-red-500 animate-spin" />
            <span>Active Target Matrix • Sling Physics Engaged</span>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            {activeAlerts.length} TNT Bottlenecks Standing
          </span>
        </div>

        {/* Arena Viewport */}
        <div className="relative z-10 my-6 h-56 w-full flex items-center justify-between px-4 sm:px-12">
          {/* Left: Angry Birds Slingshot Base */}
          <div className="relative flex flex-col items-center">
            {/* Wooden Slingshot Y Fork */}
            <div className="w-6 h-28 bg-[#866043] border-2 border-black relative shadow-[3px_3px_0_#000]">
              {/* Left Branch */}
              <div className="absolute -top-6 -left-5 w-4 h-12 bg-[#866043] border-2 border-black -rotate-25" />
              {/* Right Branch */}
              <div className="absolute -top-6 -right-5 w-4 h-12 bg-[#866043] border-2 border-black rotate-25" />

              {/* Elastic Bands */}
              <div className="absolute -top-4 -left-3 w-16 h-1 bg-red-600 origin-right -rotate-12" />
              <div className="absolute -top-4 -right-3 w-16 h-1 bg-red-600 origin-left rotate-12" />
            </div>

            {/* Redstone Ammo / Angry Bird Payload */}
            <div
              className={`w-10 h-10 bg-red-600 border-2 border-black rounded-none shadow-[2px_2px_0_#000] flex items-center justify-center font-bold text-white text-lg transition-transform ${
                isFlying ? "absolute z-30" : "absolute -top-8 left-1/2 -translate-x-1/2 cursor-pointer hover:scale-110"
              }`}
              style={
                isFlying
                  ? { left: `${projectilePos.x}px`, top: `${projectilePos.y}px` }
                  : {}
              }
              onClick={() => !isFlying && handleSlingLaunch()}
              title="Click to Sling Payload!"
            >
              🚀
            </div>
            <span className="text-[10px] font-mono text-neutral-400 mt-2 font-bold">
              [SLING LAUNCHER]
            </span>
          </div>

          {/* Right: Bottleneck TNT Structure Blocks */}
          <div className="relative flex flex-col items-center gap-2">
            {activeAlerts.length === 0 ? (
              <div className="mc-panel-grass p-6 text-center animate-fade-in">
                <span className="text-4xl block mb-2">🏆</span>
                <h3 className="font-mono text-lg font-bold text-emerald-200">
                  ALL BOTTLENECKS CLEARED!
                </h3>
                <p className="text-xs text-emerald-100 font-mono">
                  School operations running smoothly at 100% efficiency.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                {activeAlerts.slice(0, 3).map((alert, idx) => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      setSelectedAlertId(alert.id);
                      handleSlingLaunch(alert.id);
                    }}
                    className={`tnt-crate p-3 min-w-[240px] sm:min-w-[320px] cursor-pointer transition-all hover:scale-105 ${
                      selectedAlertId === alert.id ? "ring-4 ring-yellow-400 animate-pulse" : ""
                    }`}
                  >
                    <div className="tnt-band text-[11px] py-0.5 px-2 mb-1 uppercase font-black tracking-widest">
                      TNT • {alert.category}
                    </div>
                    <div className="flex items-center justify-between text-white font-mono text-xs font-bold">
                      <span className="truncate pr-2">{alert.title}</span>
                      <span className="bg-black/60 px-1.5 py-0.5 text-[10px] text-yellow-300">
                        +{alert.xpReward} XP
                      </span>
                    </div>
                    <p className="text-[10px] text-orange-100 font-mono mt-1 line-clamp-1">
                      {alert.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Explosive Banner Text */}
        {explosionEffect && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-40 bg-red-600/90 border-y-4 border-black p-4 text-center animate-bounce shadow-2xl">
            <p className="font-mono text-lg sm:text-2xl font-black text-yellow-300 tracking-wider text-shadow-[2px_2px_0_#000]">
              {explosionEffect.text}
            </p>
          </div>
        )}

        {/* Slingshot Instructions footer */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-neutral-400 bg-black/40 p-2 border border-neutral-800">
          <span>💡 TIP: Click any TNT crate alert below or press "FIRE SLINGSHOT" to resolve issue.</span>
          <span className="text-amber-400 font-bold">
            Total Resolved Today: {resolvedAlerts.length}
          </span>
        </div>
      </div>

      {/* Proactive Alerts Grid Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Proactive Alerts */}
        <div className="mc-panel p-4 bg-[#1a1a1a]">
          <div className="flex items-center justify-between mb-3 border-b-2 border-black pb-2">
            <h3 className="font-mono text-sm font-bold text-[#FF5500] uppercase flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#FF5500]" />
              Active System Bottlenecks ({activeAlerts.length})
            </h3>
            <span className="text-xs font-mono text-neutral-400">Target Priority</span>
          </div>

          <div className="space-y-3">
            {activeAlerts.length === 0 ? (
              <p className="text-xs font-mono text-neutral-400 text-center py-6">
                No active bottlenecks reported! Great job Principal.
              </p>
            ) : (
              activeAlerts.map((alert, idx) => {
                const isOdd = idx % 2 === 1;
                return (
                  <div
                    key={alert.id}
                    className={`p-4 relative transition-transform ${
                      alert.severity === "critical"
                        ? "bg-[#FF5500] border-4 border-black text-white shadow-[4px_4px_0_#000] rotate-1"
                        : alert.severity === "warning"
                        ? "bg-white text-black border-4 border-[#E61010] shadow-[4px_4px_0_#E61010] -rotate-1"
                        : "bg-white text-black border-4 border-[#5B8731] shadow-[4px_4px_0_#5B8731]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 border-2 border-black ${
                              alert.severity === "critical"
                                ? "bg-black text-[#FF5500]"
                                : alert.severity === "warning"
                                ? "bg-[#E61010] text-white"
                                : "bg-[#5B8731] text-white"
                            }`}
                          >
                            {alert.severity}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold ${
                              alert.severity === "critical" ? "text-amber-200" : "text-gray-700"
                            }`}
                          >
                            📍 {alert.location}
                          </span>
                        </div>
                        <h4
                          className={`font-mono text-sm font-black uppercase ${
                            alert.severity === "critical" ? "text-white" : "text-black"
                          }`}
                        >
                          {alert.title}
                        </h4>
                        <p
                          className={`text-xs font-mono font-medium mt-1 ${
                            alert.severity === "critical" ? "text-white/90" : "text-gray-700"
                          }`}
                        >
                          {alert.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleSlingLaunch(alert.id)}
                        className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0_#000] flex items-center gap-1 active:translate-y-0.5 ${
                          alert.severity === "critical"
                            ? "bg-black text-[#FF5500] hover:bg-neutral-900"
                            : "bg-[#E61010] text-white hover:bg-red-700"
                        }`}
                      >
                        <span>SLING</span>
                        <Crosshair className="w-3.5 h-3.5 text-yellow-300" />
                      </button>
                    </div>

                    <div
                      className={`mt-2 p-1.5 border border-black text-[11px] font-mono font-bold flex items-center justify-between ${
                        alert.severity === "critical"
                          ? "bg-black/30 text-yellow-200"
                          : "bg-gray-100 text-[#2D4519]"
                      }`}
                    >
                      <span>Action: {alert.actionPrompt}</span>
                      <span className="font-black">+{alert.xpReward} XP</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Resolved Bottlenecks Log */}
        <div className="mc-panel p-4 bg-[#1e241b]">
          <div className="flex items-center justify-between mb-3 border-b-2 border-black pb-2">
            <h3 className="font-mono text-sm font-bold text-emerald-400 uppercase flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Destroyed Bottlenecks Log ({resolvedAlerts.length})
            </h3>
            <span className="text-xs font-mono text-neutral-400">Resolved Stream</span>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {resolvedAlerts.length === 0 ? (
              <p className="text-xs font-mono text-neutral-400 text-center py-6">
                No alerts resolved yet. Launch your first slingshot payload!
              </p>
            ) : (
              resolvedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-[#141b12] border border-black p-2.5 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-sm">✓</span>
                    <div>
                      <h5 className="font-mono text-xs font-bold text-emerald-200 line-through">
                        {alert.title}
                      </h5>
                      <span className="text-[10px] font-mono text-neutral-400">
                        Resolved via Slingshot Command • {alert.resolvedAt || "Just now"}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-black/50 px-2 py-0.5 border border-neutral-700">
                    +{alert.xpReward} EXP
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
