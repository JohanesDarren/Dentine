import React, { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, Html, PerspectiveCamera } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'

const TOOTH_NAMES = {
  1:"Upper Right Third Molar",
  2:"Upper Right Second Molar",
  3:"Upper Right First Molar",
  4:"Upper Right Second Premolar",
  5:"Upper Right First Premolar",
  6:"Upper Right Canine",
  7:"Upper Right Lateral Incisor",
  8:"Upper Right Central Incisor",
  9:"Upper Left Central Incisor",
  10:"Upper Left Lateral Incisor",
  11:"Upper Left Canine",
  12:"Upper Left First Premolar",
  13:"Upper Left Second Premolar",
  14:"Upper Left First Molar",
  15:"Upper Left Second Molar",
  16:"Upper Left Third Molar",
  17:"Lower Left Third Molar",
  18:"Lower Left Second Molar",
  19:"Lower Left First Molar",
  20:"Lower Left Second Premolar",
  21:"Lower Left First Premolar",
  22:"Lower Left Canine",
  23:"Lower Left Lateral Incisor",
  24:"Lower Left Central Incisor",
  25:"Lower Right Central Incisor",
  26:"Lower Right Lateral Incisor",
  27:"Lower Right Canine",
  28:"Lower Right First Premolar",
  29:"Lower Right Second Premolar",
  30:"Lower Right First Molar",
  31:"Lower Right Second Molar",
  32:"Lower Right Third Molar"
}

const RECOMMENDATIONS = {
  "Caries": "Early stage cavity. Schedule a filling within 4–6 weeks to prevent spread.",
  "Deep Caries": "Advanced decay detected. Immediate treatment required — filling or root canal within 2 weeks.",
  "Impacted": "Tooth is impacted. Consult for surgical extraction assessment.",
  "Periapical Lesion": "Infection at root tip. Root canal treatment strongly recommended."
}

function ToothMesh({ 
  position, rotation, toothNumber, width, height,
  severity, condition, onClick, entranceDelay, index, size, selectedTooth
}) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const selected = selectedTooth === toothNumber

  let fillColor = "#F8FAFC"
  let emissiveColor = "#000000"
  let emissiveIntensity = 0

  if (severity === "healthy" || severity === "healthy_marked") {
    fillColor = "#ECFDF5"
    emissiveColor = "#10B981"
    emissiveIntensity = 0.05
  } else if (severity === "mild") {
    fillColor = "#FFFBEB"
    emissiveColor = "#F59E0B"
    emissiveIntensity = 0.12
  } else if (severity === "severe") {
    fillColor = "#FFF1F2"
    emissiveColor = "#EF4444"
    emissiveIntensity = 0.18
  }

  const { posY, sc } = useSpring({
    from: { posY: position[1] + 5, sc: 0.3 },
    to: { posY: position[1], sc: 1 },
    config: { tension: 160, friction: 14 },
    delay: entranceDelay
  })

  const { hoverScale, hoverZ } = useSpring({
    hoverScale: hovered ? 1.22 : 1.0,
    hoverZ: hovered ? 0.6 : 0.0,
    config: { tension: 320, friction: 10 }
  })

  const { selScale } = useSpring({
    selScale: selected ? 1.12 : 1.0,
    config: { tension: 280, friction: 12 }
  })

  useFrame(({ clock }) => {
    if (severity && meshRef.current) {
      meshRef.current.position.y = Math.sin(clock.elapsedTime * 1.8 + index * 0.5) * 0.06
    }
  })

  return (
    <animated.group position-x={position[0]} position-y={posY} position-z={hoverZ} rotation={rotation}>
      <animated.group scale={sc}>
        <animated.group scale-x={hoverScale} scale-y={hoverScale}>
          <animated.group scale-x={selScale} scale-y={selScale}>
            <group ref={meshRef}>
              <RoundedBox
                args={[width, height, 0.42]}
                radius={0.13}
                smoothness={6}
                onClick={(e) => {
                  e.stopPropagation()
                  if (onClick && size === "full") onClick(toothNumber)
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  if (size === "full") {
                    setHovered(true)
                    document.body.style.cursor = 'pointer'
                  }
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  if (size === "full") {
                    setHovered(false)
                    document.body.style.cursor = 'default'
                  }
                }}
              >
                <meshStandardMaterial
                  color={fillColor}
                  emissive={emissiveColor}
                  emissiveIntensity={emissiveIntensity}
                  roughness={0.12}
                  metalness={0.08}
                />
              </RoundedBox>

              <mesh position={[-width*0.2, -height*0.62, 0]}>
                <cylinderGeometry args={[0.06, 0.03, height*0.5, 8]} />
                <meshStandardMaterial color="#F1F5F9" roughness={0.4} />
              </mesh>

              <mesh position={[width*0.2, -height*0.62, 0]}>
                <cylinderGeometry args={[0.06, 0.03, height*0.5, 8]} />
                <meshStandardMaterial color="#F1F5F9" roughness={0.4} />
              </mesh>

              {hovered && size === "full" && (
                <RoundedBox
                  args={[width+0.1, height+0.1, 0.1]}
                  position={[0, 0, -0.2]}
                  radius={0.15}
                  smoothness={6}
                >
                  <meshBasicMaterial color={fillColor} opacity={0.25} transparent />
                </RoundedBox>
              )}

              {selected && size === "full" && (
                <RoundedBox
                  args={[width+0.08, height+0.08, 0.08]}
                  position={[0, 0, -0.15]}
                  radius={0.14}
                  smoothness={6}
                >
                  <meshBasicMaterial color="#273d58" opacity={0.5} transparent />
                </RoundedBox>
              )}

              {hovered && size === "full" && (
                <Html center distanceFactor={9} position={[0, height*0.62, 0.3]}>
                  <div style={{
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '2px 6px',
                    fontSize: '10px',
                    fontWeight: '600',
                    color: '#273d58',
                    fontFamily: 'Inter, sans-serif',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    pointerEvents: 'none'
                  }}>
                    #{toothNumber}
                  </div>
                </Html>
              )}
            </group>
          </animated.group>
        </animated.group>
      </animated.group>
    </animated.group>
  )
}

function buildArch() {
  const teeth = []
  
  const getSize = (num) => {
    if ([1,2,3,14,15,16,17,18,19,30,31,32].includes(num))
      return { w: 0.60, h: 0.82 }
    if ([4,5,12,13,20,21,28,29].includes(num))
      return { w: 0.52, h: 0.78 }
    if ([6,11,22,27].includes(num))
      return { w: 0.45, h: 0.88 }
    return { w: 0.40, h: 0.72 }
  }

  for (let i = 0; i < 16; i++) {
    const t = i / 15
    const angle = t * Math.PI
    const x = (t - 0.5) * 9.2
    const archY = Math.sin(angle) * 0.55
    const rotY = (t - 0.5) * -0.35
    const { w, h } = getSize(i + 1)
    teeth.push({
      number: i + 1,
      position: [x, 2.0 + archY, 0],
      rotation: [0, rotY, 0],
      width: w, height: h
    })
  }

  for (let i = 0; i < 16; i++) {
    const t = i / 15
    const angle = t * Math.PI
    const x = (t - 0.5) * 9.2
    const archY = Math.sin(angle) * 0.55
    const rotY = (t - 0.5) * 0.35
    const { w, h } = getSize(i + 17)
    teeth.push({
      number: i + 17,
      position: [x, -2.0 - archY, 0],
      rotation: [0, rotY, 0],
      width: w, height: h
    })
  }

  return teeth
}

function GumArch() {
  return (
    <group>
      <mesh position={[0, 1.3, -0.22]} scale={[10, 0.9, 1]}>
        <planeGeometry />
        <meshStandardMaterial color="#FDA4AF" roughness={0.9} />
      </mesh>
      <mesh position={[0, -1.3, -0.22]} scale={[10, 0.9, 1]}>
        <planeGeometry />
        <meshStandardMaterial color="#FDA4AF" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.75, -0.21]} scale={[10, 0.12, 1]}>
        <planeGeometry />
        <meshStandardMaterial color="#FB7185" roughness={0.9} />
      </mesh>
      <mesh position={[0, -1.75, -0.21]} scale={[10, 0.12, 1]}>
        <planeGeometry />
        <meshStandardMaterial color="#FB7185" roughness={0.9} />
      </mesh>
    </group>
  )
}

function ConfidenceArc({ confidence, colorStr }) {
  const radius = 28;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const [prog, setProg] = useState(0);

  useEffect(() => {
    setProg(0);
    const t = setTimeout(() => {
      setProg(confidence);
    }, 50);
    return () => clearTimeout(t);
  }, [confidence]);

  const strokeDashoffset = circumference - (prog * circumference);

  return (
    <div style={{ position: 'relative', width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
      <svg width={66} height={66} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={33} cy={33} r={radius} stroke="#F1F5F9" strokeWidth={strokeWidth} fill="none" />
        <circle 
          cx={33} cy={33} r={radius} 
          stroke={colorStr} strokeWidth={strokeWidth} fill="none" 
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)', strokeLinecap: 'round' }}
        />
      </svg>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-sm font-bold text-gray-900 leading-none">{Math.round(prog * 100)}%</div>
        <div className="text-[10px] text-gray-400 mt-0.5">confidence</div>
      </div>
    </div>
  )
}

export default function DentalScene({ conditions = [], onToothClick = null, size = "full" }) {
  const [selectedTooth, setSelectedTooth] = useState(null)
  const layout = useMemo(() => buildArch(), [])
  
  const conditionMap = useMemo(() => {
    const map = {}
    conditions.forEach(c => { map[c.tooth] = c })
    return map
  }, [conditions])

  const condData = selectedTooth ? conditionMap[selectedTooth] : null

  let sevColors = { text: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", hex: "#94A3B8" }
  if (condData?.severity === "healthy" || condData?.severity === "healthy_marked") {
    sevColors = { text: "text-green-600", bg: "bg-green-50", border: "border-green-200", hex: "#10B981" }
  } else if (condData?.severity === "mild") {
    sevColors = { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", hex: "#F59E0B" }
  } else if (condData?.severity === "severe") {
    sevColors = { text: "text-red-600", bg: "bg-red-50", border: "border-red-200", hex: "#EF4444" }
  }

  return (
    <div className="w-full relative flex flex-col">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div 
        style={{
          position: 'relative', width: '100%', height: size === "full" ? '500px' : '240px',
          background: 'linear-gradient(160deg, #F0F9FF 0%, #F8FAFC 50%, #FFF1F2 100%)',
          borderRadius: '20px', overflow: 'hidden', boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.04)'
        }}
      >
        <Canvas onPointerMissed={() => setSelectedTooth(null)}>
          <PerspectiveCamera makeDefault position={[0, 0, 13]} fov={36} />
          
          <ambientLight intensity={0.85} color="#FFF8F0" />
          <directionalLight position={[2, 8, 6]} intensity={1.5} />
          <directionalLight position={[-4, 2, 3]} intensity={0.5} color="#E0F2FE" />
          <pointLight position={[0, -3, 5]} intensity={0.3} color="#FDE68A" />

          <GumArch />

          {layout.map((tooth, index) => (
            <ToothMesh
              key={tooth.number}
              position={tooth.position}
              rotation={tooth.rotation}
              toothNumber={tooth.number}
              width={tooth.width}
              height={tooth.height}
              severity={conditionMap[tooth.number]?.severity || null}
              condition={conditionMap[tooth.number]?.condition}
              entranceDelay={index * 28}
              index={index}
              size={size}
              selectedTooth={selectedTooth}
              onClick={(num) => {
                 setSelectedTooth(selectedTooth === num ? null : num)
                 if (onToothClick) onToothClick(num)
              }}
            />
          ))}
        </Canvas>
      </div>

      {selectedTooth && size === "full" && (
        !condData ? (
          <div 
             className="mt-4 bg-white rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.08)] border-l-4 border-gray-200 animate-[slideUp_0.3s_ease_forwards]"
          >
             <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-400">Tooth #{selectedTooth} • <span className="font-semibold text-gray-800">{TOOTH_NAMES[selectedTooth]}</span></span>
                <span className="text-xl font-bold text-gray-800">No issues detected</span>
                <span className="text-sm text-gray-600">This tooth appears healthy.</span>
             </div>
          </div>
        ) : (
          <div 
             className="mt-4 bg-white rounded-2xl py-5 px-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)] animate-[slideUp_0.3s_ease_forwards]"
             style={{ borderLeft: `4px solid ${sevColors.hex}` }}
          >
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 flex flex-col">
                <div className="text-sm text-gray-400 mb-1">Tooth #{selectedTooth} • <span className="font-semibold text-gray-800">{TOOTH_NAMES[selectedTooth]}</span></div>
                <div className={`text-xl font-bold mb-2 ${sevColors.text}`}>{condData?.condition}</div>
                <div className="text-sm text-gray-600 leading-[1.6]">
                  {RECOMMENDATIONS[condData?.condition] || "Clinical evaluation needed to assess condition and map appropriate care plan."}
                </div>
              </div>
              <div className="w-full md:w-[40%] flex flex-col items-center gap-3">
                <div className={`px-4 py-1.5 rounded-full border text-sm font-bold uppercase tracking-wider ${sevColors.bg} ${sevColors.text} ${sevColors.border}`}>
                  {condData?.severity}
                </div>
                <ConfidenceArc confidence={condData?.confidence || 0} colorStr={sevColors.hex} />
              </div>
            </div>
            <div className="w-full flex gap-3 mt-6">
               <button className="flex-1 py-1.5 px-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Mark as Reviewed
               </button>
               <button className="flex-1 py-1.5 px-3 bg-[#273d58] text-white rounded-lg text-sm font-medium hover:bg-[#1e2f44] transition-colors">
                  Add to Report
               </button>
            </div>
          </div>
        )
      )}

      {size === "full" && (
        <div className="flex flex-wrap justify-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2.5 h-2.5 rounded-[3px] bg-[#F8FAFC] border border-gray-200" />
            Not examined
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2.5 h-2.5 rounded-[3px] bg-red-100 border border-red-200" />
            Severe condition
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2.5 h-2.5 rounded-[3px] bg-amber-100 border border-amber-200" />
            Mild condition
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2.5 h-2.5 rounded-[3px] bg-green-100 border border-green-200" />
            Healthy / Resolved
          </div>
        </div>
      )}
    </div>
  )
}

export const mockConditions = [
  { tooth: 3, condition: "Deep Caries", severity: "severe", confidence: 0.94 },
  { tooth: 7, condition: "Caries", severity: "mild", confidence: 0.78 },
  { tooth: 14, condition: "Impacted", severity: "severe", confidence: 0.89 },
  { tooth: 19, condition: "Periapical Lesion", severity: "severe", confidence: 0.71 },
  { tooth: 24, condition: "Caries", severity: "mild", confidence: 0.82 },
]
