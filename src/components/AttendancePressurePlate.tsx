import React, { useState } from "react";
import { AttendanceStudent } from "../types";
import { playPressurePlateSound, playExpChime } from "../utils/audio";
import { Users, CheckCircle, Footprints, Shield, Activity, RefreshCw } from "lucide-react";

interface AttendanceProps {
  students: AttendanceStudent[];
  onCheckInStudent: (studentId: string) => void;
  onSimulateBatchCheckIn: () => void;
}

export const AttendancePressurePlate: React.FC<AttendanceProps> = ({
  students,
  onCheckInStudent,
  onSimulateBatchCheckIn,
}) => {
  const [activeZone, setActiveZone] = useState("Gate 1 (Main Redstone Arch)");

  const handlePlateStep = (studentId: string) => {
    playPressurePlateSound();
    onCheckInStudent(studentId);
  };

  const handleBatchStep = () => {
    playPressurePlateSound();
    playExpChime();
    onSimulateBatchCheckIn();
  };

  const presentCount = students.filter((s) => s.status === "PRESENT").length;
  const attendancePercentage = Math.round((presentCount / students.length) * 100);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="mc-panel-wood p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-800 border-2 border-black flex items-center justify-center text-3xl shadow-[2px_2px_0_#000]">
            🦶
          </div>
          <div>
            <h2 className="font-mono text-xl font-bold text-amber-200 uppercase tracking-wide">
              X-Ray & Pressure Plate Auto-Attendance
            </h2>
            <p className="text-xs text-amber-100/80 font-mono">
              RFID & Computer Vision pipeline logs arrival as students step across pressure plates, filling health bars in real time.
            </p>
          </div>
        </div>

        <button
          onClick={handleBatchStep}
          className="mc-button-redstone px-4 py-2 text-sm font-black flex items-center gap-2"
        >
          <Footprints className="w-4 h-4 text-yellow-300" />
          <span>SIMULATE MORNING GATE RUSH</span>
        </button>
      </div>

      {/* Attendance Stats HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Sleek Interface Theme Daily Attendance Card */}
        <div className="sm:col-span-2 bg-[#4d3324] border-4 border-[#866043] p-4 text-white shadow-[4px_4px_0_#2d1d14]">
          <h2 className="text-white font-bold text-xs uppercase mb-3 tracking-wider">
            Daily Attendance Health Status
          </h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-white font-bold">
                <span>GRADE 10 (CREATIVE MODE)</span>
                <span>{attendancePercentage}% PRESENT</span>
              </div>
              <div className="h-4 w-full bg-[#1a1a1a] border border-white p-[2px]">
                <div
                  className="h-full bg-[#5B8731] shadow-[inset_0_2px_0_rgba(255,255,255,0.3)] transition-all duration-500"
                  style={{ width: `${attendancePercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-white font-bold">
                <span>ABSENTEE / PENDING RATE</span>
                <span>{100 - attendancePercentage}% ABSENT</span>
              </div>
              <div className="h-4 w-full bg-[#1a1a1a] border border-white p-[2px]">
                <div
                  className="h-full bg-[#E61010] shadow-[inset_0_2px_0_rgba(255,255,255,0.3)] transition-all duration-500"
                  style={{ width: `${100 - attendancePercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mc-panel p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">Active Pressure Plate</span>
            <div className="font-mono text-xs font-bold text-emerald-400 mt-1">{activeZone}</div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-700">
            <span className="text-[10px] font-mono text-amber-300">RFID GATE 1 ACTIVE</span>
            <span className="text-2xl">⚡</span>
          </div>
        </div>
      </div>

      {/* Interactive Pressure Plate Floor Grid */}
      <div className="mc-panel p-4">
        <h3 className="font-mono text-xs font-bold text-amber-400 uppercase mb-3 border-b border-neutral-700 pb-2">
          Step On Stone Pressure Plate To Log Arrival (Computer Vision / RFID)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {students.map((student) => {
            const isPresent = student.status === "PRESENT";
            return (
              <div
                key={student.id}
                onClick={() => handlePlateStep(student.id)}
                className={`p-3 border-4 border-black cursor-pointer transition-all flex flex-col items-center justify-between text-center min-h-[140px] ${
                  isPresent
                    ? "bg-[#1f2e1a] border-emerald-600 shadow-[inset_2px_2px_0_#488536]"
                    : "bg-[#291e18] border-neutral-700 hover:border-amber-500 shadow-[inset_2px_2px_0_#423229]"
                }`}
              >
                <div className="text-3xl mb-1">{student.avatar}</div>
                <div className="font-mono font-bold text-xs text-white truncate w-full">{student.name}</div>
                <div className="text-[10px] font-mono text-neutral-400 mb-2">{student.grade}</div>

                {/* Heart Container indicator */}
                <div className="text-xs mb-1">
                  {isPresent ? "❤️❤️❤️❤️❤️" : "🖤🖤🖤🖤🖤"}
                </div>

                <div
                  className={`w-full py-1 font-mono text-[10px] font-black uppercase border border-black ${
                    isPresent ? "bg-emerald-600 text-white" : "bg-neutral-700 text-neutral-300"
                  }`}
                >
                  {isPresent ? `ARRIVED ${student.checkInTime || ""}` : "ABSENT • STEP"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
