import React, { useState } from "react";
import { CommandAlert, TimetableSlot, AttendanceStudent } from "./types";
import { Header } from "./components/Header";
import { SlingshotCommandCenter } from "./components/SlingshotCommandCenter";
import { CraftingTableExtractor } from "./components/CraftingTableExtractor";
import { RedstoneScheduler } from "./components/RedstoneScheduler";
import { AttendancePressurePlate } from "./components/AttendancePressurePlate";
import { SpawnRateAnalytics } from "./components/SpawnRateAnalytics";
import { isSoundMuted, toggleMuteSound } from "./utils/audio";

// Initial Mock Command Alerts
const INITIAL_ALERTS: CommandAlert[] = [
  {
    id: "alert-1",
    title: "Grade 10 Math Double-Booked in Room 302!",
    description: "Prof. Oak scheduled in both Grade 10-A and Grade 12-B at Period 1.",
    category: "schedule",
    severity: "critical",
    location: "Block B • Room 302",
    xpReward: 35,
    resolved: false,
    actionPrompt: "Sling Redstone Core to resolve schedule collision",
  },
  {
    id: "alert-2",
    title: "Unprocessed Physical Health Forms Pending!",
    description: "4 physical health waivers submitted on paper awaiting AI Crafting extraction.",
    category: "paperwork",
    severity: "warning",
    location: "Crafting Desk • Main Office",
    xpReward: 25,
    resolved: false,
    actionPrompt: "Craft physical paperwork into verified digital record",
  },
  {
    id: "alert-3",
    title: "Staffing Shortage: Science Department!",
    description: "2 Science teachers absent. High shortage risk predicted for Friday.",
    category: "staffing",
    severity: "warning",
    location: "Science Wing • Ground Floor",
    xpReward: 30,
    resolved: false,
    actionPrompt: "Spawn substitute teachers via Spawn Rate Analytics",
  },
  {
    id: "alert-4",
    title: "Morning Attendance Gate Drop (78%)!",
    description: "Grade 8-B attendance is below threshold. Check-in pressure plates pending.",
    category: "attendance",
    severity: "info",
    location: "Gate 1 • Main Redstone Arch",
    xpReward: 20,
    resolved: false,
    actionPrompt: "Simulate morning gate rush check-ins",
  },
];

// Initial Timetable Grid Data with intentional collisions
const INITIAL_SLOTS: TimetableSlot[] = [
  // Grade 10 Mon
  { id: "slot-1", day: "Mon", period: 1, timeLabel: "08:30", grade: "Grade 10", subject: "Mathematics", teacher: "Prof. Oak", room: "Room 101 (Grass)", isConflict: true, conflictReason: "Teacher Double-Booked: Prof. Oak in Room 101 & Room 201", redstonePower: 12 },
  { id: "slot-2", day: "Mon", period: 2, timeLabel: "09:20", grade: "Grade 10", subject: "Physics Lab", teacher: "Dr. Minecraft", room: "Room 201 (Redstone)", isConflict: false, redstonePower: 15 },
  { id: "slot-3", day: "Mon", period: 3, timeLabel: "10:10", grade: "Grade 10", subject: "Physical Ed", teacher: "Coach Steve", room: "Gym 1 (Slingshot)", isConflict: false, redstonePower: 15 },
  // Grade 12 Mon
  { id: "slot-4", day: "Mon", period: 1, timeLabel: "08:30", grade: "Grade 12", subject: "Advanced Bio", teacher: "Prof. Oak", room: "Room 101 (Grass)", isConflict: true, conflictReason: "Room Collision: Room 101 double booked", redstonePower: 10 },
  // Additional Slots across week
  { id: "slot-5", day: "Tue", period: 1, timeLabel: "08:30", grade: "Grade 10", subject: "Redstone Logic", teacher: "Ms. Redstone", room: "Room 201 (Redstone)", isConflict: false, redstonePower: 15 },
  { id: "slot-6", day: "Wed", period: 2, timeLabel: "09:20", grade: "Grade 10", subject: "Literature", teacher: "Mr. TNT", room: "Room 102 (Cobble)", isConflict: false, redstonePower: 15 },
  { id: "slot-7", day: "Thu", period: 4, timeLabel: "11:15", grade: "Grade 10", subject: "Chemistry", teacher: "Dr. Minecraft", room: "Lab 3 (Obsidian)", isConflict: false, redstonePower: 15 },
  { id: "slot-8", day: "Fri", period: 5, timeLabel: "12:05", grade: "Grade 10", subject: "Art & Crafting", teacher: "Mrs. Craft", room: "Room 202 (Deck)", isConflict: false, redstonePower: 15 },
];

// Initial Student Attendance Database
const INITIAL_STUDENTS: AttendanceStudent[] = [
  { id: "stu-1", name: "Steve Block", avatar: "🧱", grade: "Grade 10-A", status: "PRESENT", checkInTime: "08:12 AM", pressurePlateZone: "Gate 1", hearts: 10, expLevel: 42 },
  { id: "stu-2", name: "Alex Vance", avatar: "🏹", grade: "Grade 10-B", status: "PRESENT", checkInTime: "08:15 AM", pressurePlateZone: "Gate 1", hearts: 10, expLevel: 38 },
  { id: "stu-3", name: "Red Bird", avatar: "🔴", grade: "Grade 9-A", status: "ABSENT", pressurePlateZone: "Gate 2", hearts: 0, expLevel: 15 },
  { id: "stu-4", name: "Chuck Speedster", avatar: "⚡", grade: "Grade 8-B", status: "ABSENT", pressurePlateZone: "Gate 2", hearts: 0, expLevel: 22 },
  { id: "stu-5", name: "Bomb Explosive", avatar: "💣", grade: "Grade 11-A", status: "PRESENT", checkInTime: "08:05 AM", pressurePlateZone: "Gate 1", hearts: 10, expLevel: 55 },
  { id: "stu-6", name: "Ender Student", avatar: "👁️", grade: "Grade 12-A", status: "ABSENT", pressurePlateZone: "Gate 3", hearts: 0, expLevel: 60 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("slingshot");
  const [alerts, setAlerts] = useState<CommandAlert[]>(INITIAL_ALERTS);
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(INITIAL_SLOTS);
  const [students, setStudents] = useState<AttendanceStudent[]>(INITIAL_STUDENTS);
  const [expLevel, setExpLevel] = useState(74);
  const [soundMuted, setSoundMuted] = useState(isSoundMuted());

  const unresolvedAlerts = alerts.filter((a) => !a.resolved);
  const resolvedCount = alerts.filter((a) => a.resolved).length;

  // System Health Hearts calculated based on unresolved alerts
  const systemHealthHearts = Math.max(2, 10 - unresolvedAlerts.length * 2);

  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId ? { ...a, resolved: true, resolvedAt: new Date().toLocaleTimeString() } : a
      )
    );
    setExpLevel((prev) => prev + 15);
  };

  const handleResetAlerts = () => {
    setAlerts(INITIAL_ALERTS.map((a) => ({ ...a, resolved: false })));
  };

  const handleCheckInStudent = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              status: "PRESENT",
              checkInTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              hearts: 10,
              expLevel: s.expLevel + 5,
            }
          : s
      )
    );
    setExpLevel((prev) => prev + 5);
  };

  const handleSimulateBatchCheckIn = () => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        status: "PRESENT",
        checkInTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        hearts: 10,
        expLevel: s.expLevel + 10,
      }))
    );

    // Auto-resolve attendance alert if present
    const attendanceAlert = alerts.find((a) => a.category === "attendance");
    if (attendanceAlert) {
      handleResolveAlert(attendanceAlert.id);
    }
  };

  const handleMuteToggle = () => {
    const isMuted = toggleMuteSound();
    setSoundMuted(isMuted);
  };

  return (
    <div className="min-h-screen bg-[#181410] text-neutral-100 p-2 sm:p-4 font-sans selection:bg-amber-500 selection:text-black">
      <div className="max-w-7xl mx-auto">
        {/* Minecraft Header HUD */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unresolvedAlertCount={unresolvedAlerts.length}
          expLevel={expLevel}
          systemHealthHearts={systemHealthHearts}
          onMuteToggle={handleMuteToggle}
          soundMuted={soundMuted}
        />

        {/* Dynamic View Tab Rendering */}
        <main className="transition-all duration-300">
          {activeTab === "slingshot" && (
            <SlingshotCommandCenter
              alerts={alerts}
              onResolveAlert={handleResolveAlert}
              onResetAlerts={handleResetAlerts}
            />
          )}

          {activeTab === "crafting" && (
            <CraftingTableExtractor
              onFormExtracted={() => {
                setExpLevel((prev) => prev + 25);
                const paperworkAlert = alerts.find((a) => a.category === "paperwork");
                if (paperworkAlert) handleResolveAlert(paperworkAlert.id);
              }}
            />
          )}

          {activeTab === "redstone" && (
            <RedstoneScheduler
              slots={timetableSlots}
              onUpdateSlots={(updated) => {
                setTimetableSlots(updated);
                setExpLevel((prev) => prev + 35);
                const scheduleAlert = alerts.find((a) => a.category === "schedule");
                if (scheduleAlert) handleResolveAlert(scheduleAlert.id);
              }}
            />
          )}

          {activeTab === "attendance" && (
            <AttendancePressurePlate
              students={students}
              onCheckInStudent={handleCheckInStudent}
              onSimulateBatchCheckIn={handleSimulateBatchCheckIn}
            />
          )}

          {activeTab === "analytics" && <SpawnRateAnalytics />}
        </main>

        {/* Sleek Interface Footer Status Bar */}
        <footer className="mt-8 bg-[#2d2d2d] flex flex-wrap items-center px-4 py-2 justify-between border-t-2 border-black text-white text-[11px] font-mono shadow-[0_-2px_0_#000]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#5B8731] shadow-[0_0_6px_#5B8731]" />
              <span className="text-white font-mono uppercase tracking-widest font-bold">Admin: Steve_Super</span>
            </div>
            <div className="w-[1px] h-4 bg-white/20 hidden sm:block" />
            <span className="text-gray-400 font-mono hidden md:inline">DART_ENGINE_3.0_RIVERPOD_STABLE</span>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <div className="px-2 py-0.5 bg-white/10 text-white font-mono text-[10px]">MEM: 124MB</div>
            <div className="px-2 py-0.5 bg-[#5B8731] text-white font-bold text-[10px] uppercase">99.9% TPS</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
