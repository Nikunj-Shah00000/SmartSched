import React, { useState } from "react";
import { TimetableSlot } from "../types";
import { resolveTimetableConflicts, ConflictReport } from "../utils/scheduler";
import { playRedstoneSound, playExpChime } from "../utils/audio";
import { Calendar, Zap, AlertTriangle, CheckCircle, RefreshCw, Layers } from "lucide-react";

interface RedstoneSchedulerProps {
  slots: TimetableSlot[];
  onUpdateSlots: (updated: TimetableSlot[]) => void;
}

export const RedstoneScheduler: React.FC<RedstoneSchedulerProps> = ({ slots, onUpdateSlots }) => {
  const [selectedGrade, setSelectedGrade] = useState("Grade 10");
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionLogs, setResolutionLogs] = useState<string[]>([]);
  const [lastReport, setLastReport] = useState<ConflictReport | null>(null);

  const activeConflicts = slots.filter((s) => s.isConflict);

  const handleRunAutoResolver = () => {
    playRedstoneSound();
    setIsResolving(true);

    setTimeout(() => {
      const report = resolveTimetableConflicts(slots);
      onUpdateSlots(report.resolvedSlots);
      setLastReport(report);
      setResolutionLogs(report.summaryLog);
      setIsResolving(false);
      playExpChime();
    }, 600);
  };

  const days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri')[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const periods = [1, 2, 3, 4, 5, 6];

  const filteredSlots = slots.filter((s) => s.grade === selectedGrade);

  return (
    <div className="space-y-6">
      {/* Title Header - Sleek Interface Theme */}
      <div className="bg-white/90 border-4 border-[#4a4a4a] p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[4px_4px_0_rgba(0,0,0,0.3)]">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1a1a1a] uppercase leading-none italic">
            Redstone Scheduler
          </h2>
          <p className="text-[#5B8731] font-bold text-xs mt-1 uppercase tracking-wider">
            CONFLICT-FREE ENGINE ACTIVE • Reactive Constraint Satisfaction Algorithm
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedGrade("Grade 10")}
            className="px-4 py-2 bg-[#8b8b8b] hover:bg-[#7a7a7a] border-b-4 border-[#4a4a4a] text-white font-bold text-xs uppercase active:mt-1 active:border-b-0"
          >
            Grade 10
          </button>
          <button
            onClick={handleRunAutoResolver}
            disabled={isResolving}
            className="px-4 py-2 bg-[#5B8731] hover:bg-[#4a7027] border-b-4 border-[#2D4519] text-white font-bold text-xs uppercase active:mt-1 active:border-b-0 flex items-center gap-2"
          >
            <Zap className={`w-4 h-4 ${isResolving ? "animate-spin text-yellow-300" : "text-yellow-300"}`} />
            <span>{isResolving ? "RESOLVING..." : "AUTO-RESOLVE"}</span>
          </button>
        </div>
      </div>

      {/* Grade Selector Tabs & Status Indicator */}
      <div className="bg-[#1a1a1a] border-4 border-[#4a4a4a] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-white font-bold uppercase mr-2">Filter Grade:</span>
          {["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"].map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`px-3 py-1 font-mono text-xs font-bold border-2 transition-all ${
                selectedGrade === grade
                  ? "bg-[#5B8731] text-white border-black shadow-[2px_2px_0_#000]"
                  : "bg-[#2d2d2d] text-gray-300 border-black hover:bg-[#3d3d3d]"
              }`}
            >
              {grade}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-black p-2 border border-neutral-700">
            <AlertTriangle className={`w-4 h-4 ${activeConflicts.length > 0 ? "text-[#E61010] animate-bounce" : "text-neutral-500"}`} />
            <span className="text-white font-bold">
              Active Collisions:{" "}
              <strong className={activeConflicts.length > 0 ? "text-[#E61010]" : "text-[#5B8731]"}>
                {activeConflicts.length}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Timetable Matrix Grid */}
      <div className="bg-white/90 border-4 border-[#4a4a4a] p-4 overflow-x-auto shadow-[4px_4px_0_rgba(0,0,0,0.3)]">
        <table className="w-full border-collapse font-sans text-xs">
          <thead>
            <tr className="bg-[#f0f0f0] border-b border-[#d1d1d1]">
              <th className="p-2 border-r border-b border-[#d1d1d1] font-bold text-[10px] uppercase text-center text-[#1a1a1a]">
                Period / Day
              </th>
              {days.map((day) => (
                <th key={day} className="p-2 border-r border-b border-[#d1d1d1] font-bold text-[10px] uppercase text-center text-[#1a1a1a]">
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {periods.map((period) => (
              <tr key={period} className="border-b border-[#d1d1d1]">
                <td className="p-2 font-bold text-[#4a4a4a] border-r border-b border-[#d1d1d1] bg-[#f9f9f9] whitespace-nowrap text-center text-[10px] uppercase">
                  Period {period}
                  <span className="block text-[9px] text-[#7a7a7a] font-normal">
                    {period === 1 ? "08:30" : period === 2 ? "09:20" : period === 3 ? "10:10" : period === 4 ? "11:15" : period === 5 ? "12:05" : "13:30"}
                  </span>
                </td>

                {days.map((day) => {
                  const slot = filteredSlots.find((s) => s.day === day && s.period === period);
                  if (!slot) {
                    return (
                      <td key={day} className="p-2 border-r border-b border-[#d1d1d1] text-center text-neutral-400 bg-[#f9f9f9]">
                        -
                      </td>
                    );
                  }

                  return (
                    <td key={day} className="p-2 border-r border-b border-[#d1d1d1] min-w-[140px]">
                      {slot.isConflict ? (
                        <div className="bg-[#E61010]/15 border border-[#E61010] p-1.5 font-bold rounded-sm text-left animate-pulse">
                          <div className="text-[#E61010] text-[9px] font-black uppercase italic">CONFLICT FOUND</div>
                          <div className="text-black text-xs font-bold">{slot.subject}</div>
                          <div className="text-[10px] text-gray-700">{slot.teacher}</div>
                        </div>
                      ) : (
                        <div className="bg-[#7EC0EE] text-white p-1.5 font-bold rounded-sm text-left shadow-[1px_1px_0_rgba(0,0,0,0.2)]">
                          <div className="text-xs font-black uppercase">{slot.subject}</div>
                          <div className="text-[10px] text-blue-950 font-bold">{slot.teacher}</div>
                          <div className="text-[9px] text-white/90 mt-0.5 font-mono">📍 {slot.room}</div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Live Status Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between bg-[#1a1a1a] p-3 border-2 border-[#4a4a4a]">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#E61010] shadow-[0_0_8px_#E61010]"></div>
            <span className="text-[#E61010] font-mono text-[10px] font-bold uppercase">Live Conflict Detection Active</span>
          </div>
          <span className="text-white font-mono text-[10px] mt-1 sm:mt-0">LAST UPDATED: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Resolution Log Activity Feed */}
      {resolutionLogs.length > 0 && (
        <div className="mc-panel p-4 bg-[#141b12] border-2 border-emerald-600">
          <div className="flex items-center justify-between mb-2 border-b border-emerald-800 pb-2">
            <h4 className="font-mono text-xs font-bold text-emerald-400 uppercase flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Redstone Signal Resolution Log
            </h4>
            <span className="text-[10px] font-mono text-emerald-300">
              {lastReport?.resolvedConflicts} Collisions Neutralized
            </span>
          </div>

          <div className="space-y-1 font-mono text-xs text-emerald-200 max-h-40 overflow-y-auto">
            {resolutionLogs.map((log, idx) => (
              <div key={idx} className="bg-black/40 p-1.5 border border-emerald-900/60">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
