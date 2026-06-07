import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FolderOpen, ZoomIn, ZoomOut, RotateCw, Trash2 } from 'lucide-react';

export default function SmartUploadZone({ onAnalyze }: { onAnalyze?: (fileUrl: string) => void }) {
  const [state, setState] = useState<'IDLE' | 'DRAG_OVER' | 'UPLOADING' | 'UPLOADED'>('IDLE');
  const [progress, setProgress] = useState(0);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  
  // Image manipulation state
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Drag Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (state !== 'UPLOADING' && state !== 'UPLOADED') {
      setState('DRAG_OVER');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (state === 'DRAG_OVER') {
      setState('IDLE');
    }
  };

  const processFile = (file: File) => {
    setState('UPLOADING');
    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
    
    // Simulate upload progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          const url = URL.createObjectURL(file);
          setFileUrl(url);
          setState('UPLOADED');
          setProgress(0);
        }, 300);
      }
      setProgress(currentProgress);
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (state === 'UPLOADING' || state === 'UPLOADED') return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Image controls
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 1));
  const handleRotate = () => setRotation(prev => prev + 90);
  const handleReset = () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(null);
    setFileName('');
    setFileSize('');
    setScale(1);
    setRotation(0);
    setState('IDLE');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const variantProps = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.15 } // 0.15s for exit, we can make enter slightly longer via variants if needed but this is a good average
  };

  return (
    <div className="w-full flex-1 flex flex-col" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .scanning-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: #273d58;
          box-shadow: 0 0 10px #273d58;
          animation: scan 2s linear infinite;
        }
        .circular-progress {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: conic-gradient(#273d58 calc(var(--progress) * 1%), #E2E8F0 0);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .circular-progress::before {
          content: "";
          position: absolute;
          inset: 4px;
          border-radius: 50%;
          background: #fff;
        }
      `}</style>

      <div className="relative w-full flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          
          {(state === 'IDLE' || state === 'DRAG_OVER') && (
            <motion.div
              key="idle-drag"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: state === 'DRAG_OVER' ? 1.02 : 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                duration: 0.2,
                scale: { type: "spring", stiffness: 300, damping: 25 }
              }}
              className={`relative overflow-hidden w-full min-h-[280px] h-full rounded-2xl flex flex-col items-center justify-center transition-colors duration-200
                ${state === 'DRAG_OVER' 
                  ? 'border-2 border-solid border-[#273d58] bg-[#F1F5F9]' 
                  : 'border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC]'
                }`}
            >
              {state === 'DRAG_OVER' && <div className="scanning-line" />}
              
              {state === 'IDLE' ? (
                <>
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  >
                    <UploadCloud className="w-12 h-12 text-[#94A3B8] mb-4" />
                  </motion.div>
                  <p className="text-[#475569] text-lg font-medium mb-1">Drop your image here</p>
                  <p className="text-[#94A3B8] text-sm mb-2">or</p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#273d58] font-medium hover:underline mb-6 bg-transparent outline-none border-none cursor-pointer"
                  >
                    Browse files
                  </button>
                  <p className="text-[#94A3B8] text-sm">Accepts JPG, PNG • Max 10MB</p>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FolderOpen className="w-12 h-12 text-[#273d58] mb-4" />
                  </motion.div>
                  <p className="text-[#273d58] text-lg font-semibold cursor-default">Release to upload</p>
                </>
              )}
            </motion.div>
          )}

          {state === 'UPLOADING' && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full min-h-[280px] h-full rounded-2xl border-2 border-solid border-[#E2E8F0] bg-white flex flex-col items-center justify-center shadow-sm"
            >
              <div 
                className="circular-progress mb-4" 
                style={{ '--progress': progress } as React.CSSProperties}
              >
                <span className="relative z-10 font-bold text-[#0F172A]">{progress}%</span>
              </div>
              <p className="text-[#64748B] font-medium">Processing image...</p>
            </motion.div>
          )}

          {state === 'UPLOADED' && (
            <motion.div
              key="uploaded"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex flex-col gap-4"
            >
              <div className="flex justify-center -mb-7 z-10 relative">
                <div className="bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-4 border border-[#E2E8F0]">
                  <motion.button whileHover={{ scale: 1.1 }} onClick={handleZoomIn} className="text-[#64748B] hover:text-[#0F172A]"><ZoomIn size={20} /></motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} onClick={handleZoomOut} className="text-[#64748B] hover:text-[#0F172A]"><ZoomOut size={20} /></motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} onClick={handleRotate} className="text-[#64748B] hover:text-[#0F172A]"><RotateCw size={20} /></motion.button>
                  <div className="w-px h-4 bg-[#E2E8F0]"></div>
                  <motion.button whileHover={{ scale: 1.1 }} onClick={handleReset} className="text-[#EF4444] hover:text-[#B91C1C]"><Trash2 size={20} /></motion.button>
                </div>
              </div>
              
              <div 
                className="w-full bg-[#f1f5f9] min-h-[280px] h-full rounded-2xl border border-[#E2E8F0] overflow-hidden relative"
                onWheel={(e) => {
                  if (e.deltaY < 0) handleZoomIn();
                  else handleZoomOut();
                }}
              >
                <motion.div
                  drag={scale > 1}
                  dragConstraints={{ left: -100 * scale, right: 100 * scale, top: -100 * scale, bottom: 100 * scale }}
                  className="w-full h-full flex items-center justify-center cursor-move"
                >
                  <motion.img 
                    src={fileUrl!} 
                    alt="Uploaded preview" 
                    animate={{ scale, rotate: rotation }}
                    className="max-w-full max-h-full object-contain pointer-events-none"
                    style={{ position: 'absolute' }}
                  />
                </motion.div>
              </div>

              <div className="flex justify-between items-center px-2">
                <p className="text-[#475569] font-medium">{fileName}</p>
                <p className="text-[#94A3B8] text-sm">{fileSize}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.01, backgroundColor: "#1e2f44" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAnalyze && fileUrl && onAnalyze(fileUrl)}
                className="w-full bg-[#273d58] text-white rounded-xl h-[52px] font-semibold text-base shadow-sm flex items-center justify-center"
              >
                Analyze Image
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
