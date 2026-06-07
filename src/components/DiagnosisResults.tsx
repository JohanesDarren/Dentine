import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCw, Trash2 } from 'lucide-react';

export interface ScanResult {
  id: string;
  condition: string;
  severity: "Healthy" | "Mild" | "Severe";
  confidence: number;
  teeth?: string;
  description: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
}

interface DiagnosisResultsProps {
  image: string; // URL
  results: ScanResult[];
  mode: "photo" | "xray";
  onReset?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}

export default function DiagnosisResults({ image, results, mode, onReset, onSave, isSaving }: DiagnosisResultsProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 1));
  const handleRotate = () => setRotation(prev => prev + 90);

  const getColor = (severity: string) => {
    switch (severity) {
      case "Severe": return "#EF4444";
      case "Mild": return "#F59E0B";
      case "Healthy": return "#10B981";
      default: return "#94A3B8";
    }
  };

  const getBadgeColors = (severity: string) => {
    switch (severity) {
      case "Severe": return "bg-red-100 text-red-700";
      case "Mild": return "bg-yellow-100 text-yellow-700";
      case "Healthy": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  // Severity Gauge Math
  let maxSeverityScore = 0;
  if (results.some(r => r.severity === "Severe")) maxSeverityScore = 90;
  else if (results.some(r => r.severity === "Mild")) maxSeverityScore = 50;
  else if (results.some(r => r.severity === "Healthy")) maxSeverityScore = 15;
  
  const gaugeTargetAngle = -90 + (maxSeverityScore * 1.8);

  const r = 80;
  const c = 2 * Math.PI * r;
  const thirdC = (c / 2) / 3;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full lg:grid-cols-[55%_45%] h-full min-h-[500px]">
      
      <style>{`
        @keyframes dashDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes sonarPulse {
          0% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.8); }
        }
      `}</style>
      
      {/* LEFT COLUMN — Image Viewer */}
      <div className="flex flex-col gap-4 w-full h-full">
        <div className="bg-white px-4 py-2 rounded-full shadow-sm flex justify-center items-center gap-4 border border-gray-200 w-fit mx-auto z-10">
          <motion.button whileHover={{ scale: 1.1 }} onClick={handleZoomIn} className="text-gray-500 hover:text-gray-900"><ZoomIn size={20} /></motion.button>
          <motion.button whileHover={{ scale: 1.1 }} onClick={handleZoomOut} className="text-gray-500 hover:text-gray-900"><ZoomOut size={20} /></motion.button>
          <motion.button whileHover={{ scale: 1.1 }} onClick={handleRotate} className="text-gray-500 hover:text-gray-900"><RotateCw size={20} /></motion.button>
          {onReset && (
            <>
              <div className="w-px h-4 bg-gray-200"></div>
              <motion.button whileHover={{ scale: 1.1 }} onClick={onReset} className="text-red-500 hover:text-red-700"><Trash2 size={20} /></motion.button>
            </>
          )}
        </div>
        
        <div 
          className="w-full bg-[#0F172A] rounded-2xl overflow-hidden relative border border-gray-200 flex items-center justify-center cursor-move flex-1"
          onWheel={(e) => {
            e.preventDefault();
            if (e.deltaY < 0) handleZoomIn();
            else handleZoomOut();
          }}
        >
          <motion.div
            drag={scale > 1}
            dragConstraints={{ left: -100 * scale, right: 100 * scale, top: -100 * scale, bottom: 100 * scale }}
            animate={{ scale, rotate: rotation }}
            className="w-full h-full relative"
          >
            <img src={image} className="w-full h-full object-contain pointer-events-none select-none" alt="Medical scan" />
            
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10, overflow: 'visible' }}>
              {mode === "xray" && results.map((item, i) => (
                <g key={item.id} className="pointer-events-auto">
                  <rect
                    x={`${item.x}%`}
                    y={`${item.y}%`}
                    width={`${item.w || 20}%`}
                    height={`${item.h || 20}%`}
                    fill="transparent"
                    stroke={getColor(item.severity)}
                    strokeWidth={hoveredId === item.id ? 3 : 2}
                    pathLength="1"
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      strokeDasharray: 1,
                      strokeDashoffset: 1,
                      animation: `dashDraw 0.6s ease forwards ${i * 0.15}s`,
                      filter: hoveredId === item.id ? `drop-shadow(0 0 4px ${getColor(item.severity)})` : 'none',
                      transition: 'stroke-width 0.2s, filter 0.2s',
                      cursor: 'pointer'
                    }}
                  />
                  <foreignObject x={`${item.x}%`} y={`calc(${item.y}% - 28px)`} width="150" height="24">
                    <div 
                      className="bg-white px-2 py-0.5 rounded shadow text-[10px] whitespace-nowrap inline-flex items-center justify-center text-gray-800 font-bold border border-gray-100 opacity-0"
                      style={{ animation: `dashDraw 0.1s ease forwards ${i * 0.15 + 0.6}s` }}
                    >
                      {item.condition}
                    </div>
                  </foreignObject>
                </g>
              ))}

              {mode === "photo" && results.map((item, i) => (
                <g key={item.id} className="pointer-events-auto">
                  <circle
                    cx={`${item.x}%`}
                    cy={`${item.y}%`}
                    r="16"
                    fill="transparent"
                    stroke={getColor(item.severity)}
                    strokeWidth={hoveredId === item.id ? 3 : 2}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      filter: hoveredId === item.id ? `drop-shadow(0 0 4px ${getColor(item.severity)})` : 'none',
                      transition: 'stroke-width 0.2s, filter 0.2s',
                      cursor: 'pointer'
                    }}
                  />
                  <circle
                    cx={`${item.x}%`}
                    cy={`${item.y}%`}
                    r="16"
                    fill="transparent"
                    stroke={getColor(item.severity)}
                    strokeWidth="2"
                    style={{
                      transformOrigin: `${item.x}% ${item.y}%`,
                      animation: 'sonarPulse 2s infinite pointer-events-none'
                    }}
                  />
                   <foreignObject x={`calc(${item.x}% - 40px)`} y={`calc(${item.y}% - 40px)`} width="150" height="24">
                    <div 
                      className="bg-white px-2 py-0.5 rounded shadow text-[10px] whitespace-nowrap inline-flex items-center justify-center text-gray-800 font-bold border border-gray-100 opacity-0"
                      style={{ animation: `dashDraw 0.1s ease forwards ${i * 0.15 + 0.3}s` }}
                    >
                      {item.condition}
                    </div>
                  </foreignObject>
                </g>
              ))}
            </svg>
          </motion.div>
        </div>
      </div>

      {/* RIGHT COLUMN — Results Panel */}
      <div className="flex flex-col gap-6 w-full h-full">
        
        {/* TOP: Severity Gauge */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col items-center justify-center shrink-0">
          <div className="relative w-48 h-24 overflow-hidden mb-2">
            <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
              <g transform="rotate(180 100 100)">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#10B981" strokeWidth="16" strokeDasharray={`${thirdC} ${c}`} strokeDashoffset="0" />
                <circle cx="100" cy="100" r="80" fill="none" stroke="#F59E0B" strokeWidth="16" strokeDasharray={`${thirdC} ${c}`} strokeDashoffset={-thirdC} />
                <circle cx="100" cy="100" r="80" fill="none" stroke="#EF4444" strokeWidth="16" strokeDasharray={`${thirdC} ${c}`} strokeDashoffset={-(thirdC * 2)} />
              </g>
              <motion.g
                initial={{ rotate: -90 }}
                animate={{ rotate: gaugeTargetAngle }}
                transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                style={{ transformOrigin: '100px 100px' }}
              >
                <circle cx="100" cy="100" r="8" fill="#0F172A" />
                <path d="M 96 100 L 104 100 L 100 20 Z" fill="#0F172A" />
              </motion.g>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight" style={{ color: getColor(maxSeverityScore > 66 ? "Severe" : maxSeverityScore > 33 ? "Mild" : "Healthy") }}>
            {maxSeverityScore > 66 ? "SEVERE" : maxSeverityScore > 33 ? "MILD" : "HEALTHY"}
          </h2>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mt-1">Overall Assessment</p>
        </div>

        {/* MIDDLE: Condition Cards List */}
        <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto pr-2 pb-2">
          {results.map((res, i) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
              onMouseEnter={() => setHoveredId(res.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 border-l-4 transition-colors ${hoveredId === res.id ? 'ring-2 ring-[#273d58] bg-[#273d58]/10' : ''}`}
              style={{ borderLeftColor: getColor(res.severity) }}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-gray-900">{res.condition} {res.teeth && <span className="text-gray-400 font-normal ml-1">({res.teeth})</span>}</h4>
                <span className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase ${getBadgeColors(res.severity)}`}>{res.severity}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 36 36" className="w-12 h-12 transform -rotate-90">
                    <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    <motion.path 
                      style={{ stroke: getColor(res.severity) }}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray="100, 100" 
                      initial={{ strokeDashoffset: 100 }}
                      animate={{ strokeDashoffset: 100 - res.confidence }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    />
                  </svg>
                  <span className="absolute text-[11px] font-bold text-gray-700">{res.confidence}%</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">{res.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* BOTTOM: Action buttons row */}
        <div className="flex gap-4 shrink-0">
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: "#f8fafc" }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            disabled={isSaving}
            className="flex-1 bg-white border border-gray-200 text-gray-700 rounded-xl py-3 font-semibold text-sm shadow-sm disabled:opacity-50"
          >
            New Diagnosis
          </motion.button>
          <motion.button
            whileHover={!isSaving ? { scale: 1.02, backgroundColor: "#1e2f44" } : {}}
            whileTap={!isSaving ? { scale: 0.98 } : {}}
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 bg-[#273d58] text-white rounded-xl py-3 font-semibold text-sm shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : "Save to Patient Record"}
          </motion.button>
        </div>

      </div>
    </div>
  );
}
