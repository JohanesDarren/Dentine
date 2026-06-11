import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector } from "recharts";
import { Activity, Users, FileWarning, Camera } from "lucide-react";
import DentalScene, { mockConditions } from "../components/DentalScene";
import { getDashboardStats, getRecentDiagnoses, getDiagnosisChartData, getConditionBreakdown } from '../lib/db';

// SECTION 1: Pills Data
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TODAY = "Thu";
const DAYS_WITH_ACTIVITY = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// SECTION 2: Stats Data
const statsData = [
  { label: "Analyses Completed", value: "1,284", change: "+12.5%", isPositive: true, sparkline: [4, 6, 8, 7, 10, 14, 18], icon: Activity },
  { label: "New Patients", value: "84", change: "+4.1%", isPositive: true, sparkline: [2, 3, 2, 5, 4, 7, 8], icon: Users },
  { label: "Anomalies Found", value: "312", change: "-2.4%", isPositive: false, sparkline: [10, 8, 12, 10, 8, 6, 4], icon: FileWarning },
  { label: "Scans Processed", value: "1,490", change: "+15.2%", isPositive: true, sparkline: [20, 30, 25, 40, 50, 45, 60], icon: Camera },
];



const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8} // increases to 108 from 100
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

// SECTION 4: Activity Table Data
const activityData = [
  { id: 1, patient: "Sarah Jenkins", type: "X-Ray", condition: "Cavity (U7)", severity: "Mild", date: "10:42 AM", day: "Thu" },
  { id: 2, patient: "Marcus Thorne", type: "Photo", condition: "Plaque Buildup", severity: "Healthy", date: "09:15 AM", day: "Thu" },
  { id: 3, patient: "Elena Rodriguez", type: "X-Ray", condition: "Periapical Abscess", severity: "Severe", date: "08:30 AM", day: "Thu" },
  { id: 4, patient: "James Robertson", type: "Photo", condition: "Gingivitis", severity: "Mild", date: "02:15 PM", day: "Wed" },
  { id: 5, patient: "Olivia Davis", type: "X-Ray", condition: "Bone Loss", severity: "Severe", date: "11:20 AM", day: "Wed" },
  { id: 6, patient: "John Smith", type: "Photo", condition: "Healthy", severity: "Healthy", date: "10:05 AM", day: "Tue" },
];

export default function Dashboard() {
  const [selectedDay, setSelectedDay] = useState(TODAY);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [stats, setStats] = useState<any[]>(statsData);
  const [recentActivity, setRecentActivity] = useState<any[]>(activityData);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        const [statsDataResult, recent, chart, pie] = await Promise.all([
          getDashboardStats(),
          getRecentDiagnoses(5),
          getDiagnosisChartData(),
          getConditionBreakdown()
        ])
        setChartData(chart || []);
        setPieData(pie || []);
        
        if (statsDataResult) {
          setStats([
            { label: "Total Patients", value: (statsDataResult.total_patients || 0).toString(), change: "", isPositive: true, sparkline: [2, 3, 2, 5, 4, 7, 8], icon: Users },
            { label: "Diagnoses Today", value: (statsDataResult.diagnoses_today || 0).toString(), change: "", isPositive: true, sparkline: [4, 6, 8, 7, 10, 14, 18], icon: Activity },
            { label: "Photo Analyses", value: (statsDataResult.photo_analyses || 0).toString(), change: "", isPositive: true, sparkline: [10, 8, 12, 10, 8, 6, 4], icon: Camera },
            { label: "X-Ray Analyses", value: (statsDataResult.xray_analyses || 0).toString(), change: "", isPositive: true, sparkline: [20, 30, 25, 40, 50, 45, 60], icon: Camera },
          ])
        }
        
        if (recent) {
          const formattedRecent = recent.map((r: any) => ({
            id: r.id,
            patient: r.patient_name || 'Unknown Patient',
            type: r.mode === 'photo' ? 'Photo' : 'X-Ray',
            condition: r.conditions_detected ? `${r.conditions_detected} conditions` : 'Healthy',
            severity: r.overall_severity || 'Unknown',
            date: new Date(r.created_at).toLocaleDateString(),
            day: TODAY, // Force show in current filter
            raw: r
          }))
          setRecentActivity(formattedRecent)
        }
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  const filteredActivity = recentActivity.filter(item => item.day === selectedDay);
  const totalConditions = pieData.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-gray-500">{entry.name}:</span>
              <span className="font-medium text-gray-900">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const TypedPie = Pie as any;

  return (
    <div className="flex flex-col gap-8 pb-12 w-full max-w-full">
      {/* DASHBOARD HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 pt-2">
        <h1 className="text-3xl font-medium text-gray-900 tracking-tight">Diagnostic Monitoring</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm cursor-pointer hover:bg-gray-800 transition-colors">
            22-12-2025
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm inline-flex items-center gap-1">
            <span className="text-gray-400 text-lg leading-none">+</span> New Reports
          </button>
        </div>
      </div>

      {/* SECTION 2 — Stat Cards Row (4 cards, full width) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-2">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
            className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex justify-between items-start w-full">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <div className="text-gray-300 tracking-widest text-lg cursor-pointer hover:text-gray-500 pb-2">...</div>
            </div>
            
            <div className="flex justify-between items-end mt-2 mb-4">
              <p className="text-3xl font-semibold text-gray-900 tracking-tight">{stat.value}</p>
              {stat.change && (
                <div className={`px-2 py-0.5 rounded-full text-xs font-bold mb-1 ${
                  stat.isPositive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {stat.change}
                </div>
              )}
            </div>
            
            <div className="h-[40px] w-full mt-auto">
              {/* Replace sparklines with simulated bar charts / stylized charts to match reference */}
              <div className="flex items-end h-full gap-1.5 w-full">
                 {stat.sparkline.map((val, idx) => {
                   const maxVal = Math.max(...stat.sparkline);
                   const heightPct = (val / maxVal) * 100;
                   return (
                     <div 
                       key={idx} 
                       className={`flex-1 rounded-t-sm transition-all duration-300 ${
                         idx === stat.sparkline.length - 1 ? 'bg-[#405c7d]' : 'bg-gray-100'
                       }`}
                       style={{ height: `${heightPct}%` }}
                     />
                   );
                 })}
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* SECTION 3 — Two column charts */}
      <section className="grid grid-cols-1 lg:grid-cols-10 gap-6 w-full">
        {/* Left column (60%) => col-span-6 */}
        <div className="lg:col-span-6 bg-white rounded-[24px] border border-gray-100 p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Diagnosis Overview</h3>
            <div className="text-sm text-gray-500 flex items-center gap-1 cursor-pointer hover:text-gray-900">
              Weekly
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="h-[280px] w-full ml-[-20px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} minTickGap={30} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="photo" stroke="#273d58" strokeWidth={2} fillOpacity={0.15} fill="#273d58" />
                <Area type="monotone" dataKey="xray" stroke="#8B5CF6" strokeWidth={2} fillOpacity={0.15} fill="#8B5CF6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right column (40%) => col-span-4 */}
        <div className="lg:col-span-4 bg-white rounded-[24px] border border-gray-100 p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2 w-full text-left">Condition Breakdown</h3>
          <div className="flex-1 w-full relative flex items-center justify-center min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <TypedPie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  dataKey="value"
                  activeIndex={activeIndex as any}
                  activeShape={renderActiveShape as any}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(-1)}
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </TypedPie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-bold text-gray-900">{totalConditions}</span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Total</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 mt-2 w-full">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — Recent Activity Table */}
      <section className="bg-white rounded-[24px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col w-full">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto w-full px-2 pb-4">
          <table className="w-full text-left bg-white">
            <thead className="bg-white text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Thumbnail</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Condition</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredActivity.length > 0 ? (
                filteredActivity.map((row, index) => {
                  let badgeClasses = "";
                  let dotClasses = "";
                  
                  if (row.severity === "Severe") {
                    badgeClasses = "bg-red-100 text-red-700";
                    dotClasses = "bg-red-500 animate-pulse";
                  } else if (row.severity === "Mild") {
                    badgeClasses = "bg-yellow-100 text-yellow-700";
                    dotClasses = "bg-yellow-500";
                  } else {
                    badgeClasses = "bg-green-100 text-green-700";
                    dotClasses = "bg-green-500";
                  }

                  return (
                    <motion.tr 
                      key={`${row.id}-${selectedDay}`} // key changes when selectedDay changes to trigger animation
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.3 }}
                      className="hover:bg-[#EFF6FF] transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-[#273d58] transition-colors">
                          {row.type === "X-Ray" ? <Activity className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {row.patient}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md">
                          {row.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {row.condition}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${badgeClasses}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dotClasses}`} />
                          {row.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                        {row.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="text-sm font-semibold text-[#273d58] hover:underline">
                          View Results
                        </button>
                      </td>
                    </motion.tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-medium">
                    No activity recorded for {selectedDay}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 5 - Latest Patient Overview */}
      <section className="bg-white rounded-[24px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col w-full">
        <div className="p-8 border-b border-gray-100 bg-white">
          <h3 className="text-lg font-bold text-gray-900">Latest Patient Overview</h3>
          <p className="text-sm text-gray-500 mt-1">Most recent diagnosis — Sarah Johnson</p>
        </div>
        <div className="p-8 bg-gray-50/30 flex flex-col items-center">
          <DentalScene
            conditions={mockConditions}
            onToothClick={null}
            size="mini"
          />
          <p className="text-xs text-gray-400 mt-4">
            Tap the results page to see full details
          </p>
        </div>
      </section>
    </div>
  );
}
