import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface DentalCondition {
  tooth: number;
  severity: "severe" | "mild" | "healthy_marked";
  condition: string;
}

interface DentalChartProps {
  conditions?: DentalCondition[];
  size?: "full" | "mini";
}

const TOOTH_NAMES: Record<number, string> = {
  1: "Upper Right Third Molar", 2: "Upper Right Second Molar", 3: "Upper Right First Molar",
  4: "Upper Right Second Premolar", 5: "Upper Right First Premolar", 6: "Upper Right Canine",
  7: "Upper Right Lateral Incisor", 8: "Upper Right Central Incisor", 9: "Upper Left Central Incisor",
  10: "Upper Left Lateral Incisor", 11: "Upper Left Canine", 12: "Upper Left First Premolar",
  13: "Upper Left Second Premolar", 14: "Upper Left First Molar", 15: "Upper Left Second Molar", 16: "Upper Left Third Molar",
  17: "Lower Left Third Molar", 18: "Lower Left Second Molar", 19: "Lower Left First Molar",
  20: "Lower Left Second Premolar", 21: "Lower Left First Premolar", 22: "Lower Left Canine",
  23: "Lower Left Lateral Incisor", 24: "Lower Left Central Incisor", 25: "Lower Right Central Incisor",
  26: "Lower Right Lateral Incisor", 27: "Lower Right Canine", 28: "Lower Right First Premolar",
  29: "Lower Right Second Premolar", 30: "Lower Right First Molar", 31: "Lower Right Second Molar", 32: "Lower Right Third Molar"
};

const upperRow = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const lowerRow = [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17];

const COLORS = {
  default: { fill: "#F1F5F9", stroke: "#CBD5E1", strokeWidth: 1.5 },
  hover: { fill: "#DBEAFE", stroke: "#93C5FD", strokeWidth: 2 },
  selected: { fill: "#273d58", stroke: "#1e2f44", strokeWidth: 2 },
  severe: { fill: "#FEE2E2", stroke: "#EF4444", strokeWidth: 2 },
  mild: { fill: "#FEF9C3", stroke: "#F59E0B", strokeWidth: 2 },
  healthy_marked: { fill: "#DCFCE7", stroke: "#10B981", strokeWidth: 2 }
};

export default function DentalChart({ conditions = [], size = "full" }: DentalChartProps) {
  const [selectedTeeth, setSelectedTeeth] = useState<Set<number>>(new Set());
  const [hoveredTooth, setHoveredTooth] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const isMini = size === "mini";

  const handleToothClick = (tooth: number) => {
    if (isMini) return;
    if (conditions.some(c => c.tooth === tooth)) return; // Disable selection if it has a condition

    setSelectedTeeth(prev => {
      const next = new Set(prev);
      if (next.has(tooth)) next.delete(tooth);
      else next.add(tooth);
      return next;
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMini || !chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const getToothStyle = (tooth: number) => {
    const condition = conditions.find(c => c.tooth === tooth);
    if (condition) return COLORS[condition.severity];
    if (selectedTeeth.has(tooth)) return COLORS.selected;
    if (hoveredTooth === tooth && !isMini) return COLORS.hover;
    return COLORS.default;
  };

  const renderToothShape = (tooth: number, xCenter: number, yTop: number, isUpper: boolean) => {
    const isIncisor = [7, 8, 9, 10, 23, 24, 25, 26].includes(tooth);
    const isCanine = [6, 11, 22, 27].includes(tooth);
    const isPremolar = [4, 5, 12, 13, 20, 21, 28, 29].includes(tooth);
    const isMolar = [1, 2, 3, 14, 15, 16, 17, 18, 19, 30, 31, 32].includes(tooth);

    const style = getToothStyle(tooth);
    const hasCondition = conditions.some(c => c.tooth === tooth);

    let element;

    if (isIncisor) {
      element = (
        <rect x={xCenter - 14} y={yTop} width={28} height={45} rx={4} />
      );
    } else if (isPremolar) {
      element = (
        <rect x={xCenter - 16} y={yTop} width={32} height={42} rx={3} />
      );
    } else if (isMolar) {
      element = (
        <rect x={xCenter - 19} y={yTop} width={38} height={44} rx={3} />
      );
    } else if (isCanine) {
      const x = xCenter - 15;
      const y = yTop;
      const path = isUpper 
        ? `M${x},${y} L${x+30},${y} L${x+30},${y+30} L${x+15},${y+45} L${x},${y+30} Z`
        : `M${x},${y+45} L${x+30},${y+45} L${x+30},${y+15} L${x+15},${y} L${x},${y+15} Z`;
      element = <path d={path} />;
    }

    return (
      <g 
        key={tooth}
        onClick={() => handleToothClick(tooth)}
        onMouseEnter={() => setHoveredTooth(tooth)}
        onMouseLeave={() => setHoveredTooth(null)}
        style={{ cursor: (!isMini && !hasCondition) ? "pointer" : "default" }}
      >
        <motion.g
          animate={hasCondition ? { opacity: [1, 0.6, 1] } : { opacity: 1 }}
          transition={hasCondition ? { repeat: Infinity, duration: 1.8 } : {}}
          style={style}
        >
          {element}
        </motion.g>
        {!isMini && (
          <text 
            x={xCenter} 
            y={isUpper ? yTop - 12 : yTop + 62} 
            textAnchor="middle" 
            fontSize="12" 
            fill="#64748B"
            fontWeight="500"
            className="select-none pointer-events-none"
          >
            {tooth}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="w-full flex flex-col items-center relative" ref={chartRef} onMouseMove={handleMouseMove}>
      <div 
        className="w-full max-w-[800px] mx-auto overflow-hidden" 
        style={isMini ? { transform: 'scale(0.5)', transformOrigin: 'center center', margin: '-100px 0' } : {}}
      >
        <svg viewBox="0 0 800 400" className="w-full h-auto drop-shadow-sm">
          {!isMini && (
            <text x="400" y="40" textAnchor="middle" fill="#94A3B8" fontSize="14" fontWeight="500" className="uppercase tracking-widest">
              Upper Arch
            </text>
          )}
          
          <g transform="translate(40, 80)">
            {upperRow.map((tooth, index) => {
              // 16 teeth across 720px width -> approx 45px per slot
              const xCenter = index * 45 + 22.5; 
              return renderToothShape(tooth, xCenter, 0, true);
            })}
          </g>

          <g transform="translate(40, 230)">
            {lowerRow.map((tooth, index) => {
              const xCenter = index * 45 + 22.5; 
              return renderToothShape(tooth, xCenter, 0, false);
            })}
          </g>

          {!isMini && (
            <text x="400" y="370" textAnchor="middle" fill="#94A3B8" fontSize="14" fontWeight="500" className="uppercase tracking-widest">
              Lower Arch
            </text>
          )}
        </svg>
      </div>

      {!isMini && (
        <div className="flex flex-wrap items-center justify-center gap-6 mt-4 w-full">
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <div className="w-3 h-3 rounded-sm bg-red-100 border-2 border-red-500"></div>
            Severe
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <div className="w-3 h-3 rounded-sm bg-yellow-100 border-2 border-yellow-500"></div>
            Mild
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <div className="w-3 h-3 rounded-sm bg-green-100 border-2 border-green-500"></div>
            Healthy
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <div className="w-3 h-3 rounded-sm bg-[#273d58] border-2 border-[#1e2f44]"></div>
            Selected
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <div className="w-3 h-3 rounded-sm bg-slate-100 border-2 border-slate-300"></div>
            Not Examined
          </div>
        </div>
      )}

      {/* Tooltip */}
      {!isMini && hoveredTooth && (
        <div 
          className="absolute pointer-events-none z-50 bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xl whitespace-nowrap"
          style={{ 
            left: tooltipPos.x, 
            top: tooltipPos.y - 40,
            transform: 'translateX(-50%)'
          }}
        >
          Tooth #{hoveredTooth} &mdash; {TOOTH_NAMES[hoveredTooth]}
          {conditions.find(c => c.tooth === hoveredTooth) && (
            <div className="text-gray-300 mt-1 font-normal border-t border-gray-700 pt-1">
              Condition: {conditions.find(c => c.tooth === hoveredTooth)?.condition}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
