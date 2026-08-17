import React from "react";
import { DepartmentStaffing } from "../types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";
import { LineChart as ChartIcon, AlertTriangle, Users, Sparkles, TrendingUp } from "lucide-react";

const STAFFING_DATA: DepartmentStaffing[] = [
  {
    department: "Science & Biology",
    iconName: "🔬",
    activeTeachers: 6,
    requiredTeachers: 9,
    shortageProbability: 75,
    peakDays: ["Friday", "Monday"],
    suggestedSubs: ["Dr. Minecraft", "Prof. Pig"],
  },
  {
    department: "Mathematics",
    iconName: "📐",
    activeTeachers: 8,
    requiredTeachers: 8,
    shortageProbability: 15,
    peakDays: ["Wednesday"],
    suggestedSubs: ["Ms. Redstone"],
  },
  {
    department: "Physical Education",
    iconName: "🏹",
    activeTeachers: 4,
    requiredTeachers: 6,
    shortageProbability: 60,
    peakDays: ["Thursday", "Friday"],
    suggestedSubs: ["Coach Steve"],
  },
  {
    department: "Arts & Crafting",
    iconName: "🎨",
    activeTeachers: 5,
    requiredTeachers: 5,
    shortageProbability: 10,
    peakDays: ["Tuesday"],
    suggestedSubs: ["Mrs. Craft"],
  },
];

const WEEKLY_DEMAND_FORECAST = [
  { day: "Mon", demandScore: 82, supplyScore: 70 },
  { day: "Tue", demandScore: 65, supplyScore: 80 },
  { day: "Wed", demandScore: 75, supplyScore: 75 },
  { day: "Thu", demandScore: 88, supplyScore: 65 },
  { day: "Fri", demandScore: 95, supplyScore: 55 },
];

export const SpawnRateAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="mc-panel-wood p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-800 border-2 border-black flex items-center justify-center text-3xl shadow-[2px_2px_0_#000]">
            📈
          </div>
          <div>
            <h2 className="font-mono text-xl font-bold text-amber-200 uppercase tracking-wide">
              Spawn Rate Analytics (Staffing Shortage Predictor)
            </h2>
            <p className="text-xs text-amber-100/80 font-mono">
              Predictive AI models forecast teacher demand spikes & auto-suggest substitute spawns before shortages hit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/40 p-2 border border-black font-mono text-xs text-amber-300">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>Predictive AI Engine Active</span>
        </div>
      </div>

      {/* Sleek Interface Spawn Rate Bar Banner */}
      <div className="bg-[#8b8b8b] border-4 border-white shadow-[4px_4px_0_#4a4a4a] p-4 text-white">
        <h2 className="text-white font-bold text-xs uppercase mb-2 tracking-wider">
          Spawn Rate Analytics • Corridor & Substitute Demand Peak
        </h2>
        <div className="h-20 flex items-end justify-between gap-2 bg-[#1a1a1a] p-2 border-2 border-[#4a4a4a]">
          <div className="w-full bg-[#E61010] h-[40%] flex items-center justify-center text-[9px] font-black">Mon</div>
          <div className="w-full bg-[#FF5500] h-[60%] flex items-center justify-center text-[9px] font-black">Tue</div>
          <div className="w-full bg-[#5B8731] h-[90%] flex items-center justify-center text-[9px] font-black">Wed</div>
          <div className="w-full bg-[#5B8731] h-[85%] flex items-center justify-center text-[9px] font-black">Thu</div>
          <div className="w-full bg-[#FF5500] h-[50%] flex items-center justify-center text-[9px] font-black">Fri</div>
          <div className="w-full bg-[#E61010] h-[30%] flex items-center justify-center text-[9px] font-black">Sat</div>
        </div>
        <p className="text-white text-[10px] font-bold mt-2 uppercase tracking-wide">
          Predicting peak corridor demand and substitute teacher shortage risk at 3:15 PM
        </p>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Active vs Needed Teachers per Dept */}
        <div className="mc-panel p-4">
          <h3 className="font-mono text-xs font-bold text-amber-400 uppercase mb-3 border-b border-neutral-700 pb-2">
            Teacher Supply vs Departmental Demand
          </h3>
          <div className="h-64 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STAFFING_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="department" stroke="#ccc" tick={{ fontSize: 10 }} />
                <YAxis stroke="#ccc" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e1e1e", borderColor: "#000", fontFamily: "monospace" }}
                />
                <Bar dataKey="activeTeachers" fill="#5b8731" name="Active Teachers" />
                <Bar dataKey="requiredTeachers" fill="#ff5500" name="Required Teachers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Weekly Demand Forecast Curve */}
        <div className="mc-panel p-4">
          <h3 className="font-mono text-xs font-bold text-amber-400 uppercase mb-3 border-b border-neutral-700 pb-2">
            Weekly Staffing Shortage Risk Forecast
          </h3>
          <div className="h-64 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_DEMAND_FORECAST} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e1e1e", borderColor: "#000", fontFamily: "monospace" }}
                />
                <Area type="monotone" dataKey="demandScore" stroke="#e61010" fill="#e61010" fillOpacity={0.3} name="Demand Load" />
                <Area type="monotone" dataKey="supplyScore" stroke="#5b8731" fill="#5b8731" fillOpacity={0.3} name="Supply Capacity" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Shortage Risk Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAFFING_DATA.map((dept) => (
          <div key={dept.department} className="mc-panel p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{dept.iconName}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 border border-black ${
                    dept.shortageProbability > 50 ? "bg-red-600 text-white animate-pulse" : "bg-emerald-700 text-white"
                  }`}
                >
                  {dept.shortageProbability}% SHORTAGE RISK
                </span>
              </div>
              <h4 className="font-mono text-xs font-bold text-white mb-1">{dept.department}</h4>
              <p className="text-[11px] font-mono text-neutral-300">
                Staffing: {dept.activeTeachers} / {dept.requiredTeachers}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-neutral-800 text-[10px] font-mono">
              <span className="text-amber-400 font-bold block mb-0.5">Peak Risk: {dept.peakDays.join(", ")}</span>
              <span className="text-neutral-400">Suggested Subs: {dept.suggestedSubs.join(", ")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
