import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Activity, Camera, ChevronDown } from "lucide-react";

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#E8EDF2] via-[#E8EDF2] to-[#273d58]/20 font-sans pb-12">
      {/* Hero Section Group */}
      <div className="relative w-full">
        {/* Navbar area */}
        <nav className="absolute top-0 left-0 right-0 z-50 flex h-24 items-center justify-between px-6 md:px-12 bg-white/20 backdrop-blur-lg border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-sm p-1">
              <img src="/3.png" alt="Dentine Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-[#273d58]">Dentine</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/20">
            <Link to="/" className="text-sm font-medium bg-[#273d58] text-white px-5 py-2 rounded-full shadow-sm">Home</Link>
            <Link to="/dashboard" className="text-sm font-medium text-white/90 hover:text-white px-5 py-2 transition-colors">Dashboard</Link>
            <Link to="/diagnose/photo" className="text-sm font-medium text-white/90 hover:text-white px-5 py-2 transition-colors">Photo Diagnose</Link>
            <Link to="/diagnose/xray" className="text-sm font-medium text-white/90 hover:text-white px-5 py-2 transition-colors">X-Ray Diagnose</Link>
            <Link to="/patients" className="text-sm font-medium text-white/90 hover:text-white px-5 py-2 transition-colors">Patients</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-[#273d58] text-sm font-bold hover:text-[#1e2f44] transition-colors px-2"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="bg-[#273d58] text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-sm hover:bg-[#1e2f44] transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </nav>

        {/* Hero Banner */}
        <div className="relative h-[600px] md:h-[650px] w-full bg-gray-900 rounded-b-[40px] mx-auto overflow-hidden shadow-sm">
          {/* Background image for dental */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2670&auto=format&fit=crop" 
              alt="Dental Clinic background" 
              className="w-full h-full object-cover opacity-80"
            />
            {/* Gradient overlay similar to reference to make top nav and text readable */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#E8EDF2] via-transparent to-black/60 opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          </div>
          
          <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 max-w-[1400px] mx-auto w-full pt-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between w-full h-full pb-20">
              <div className="max-w-2xl">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl md:text-[56px] leading-[1.1] font-bold text-white mb-6 tracking-tight drop-shadow-md"
                >
                  Find the Best<br />Dental Insights,<br />Just a Scan Away.
                </motion.h1>
              </div>
              
              <div className="max-w-sm text-left md:text-right mt-8 md:mt-0">
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/90 text-base font-medium leading-relaxed drop-shadow-sm"
                >
                  Discover anomalous findings with AI. Empowering Your Practice Today, Enhancing Your Patients Tomorrow.
                </motion.p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Overlaid Action Card */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 w-full max-w-[1300px] px-4 md:px-8 z-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[32px] shadow-[0_12px_40px_rgb(0,0,0,0.12)] p-6 md:p-8 border border-gray-100"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 px-1">
              <h2 className="text-[22px] font-bold text-gray-900">Core Capabilities</h2>
              <Link to="/login" className="w-full md:w-auto bg-[#273d58] text-white text-sm font-bold px-8 py-3.5 rounded-2xl shadow-md hover:bg-[#1e2f44] transition-all text-center">
                Launch Workspace
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { icon: Activity, title: "Precision Analytics", desc: "AI-driven mapping highlights caries early and detects periapical lucencies with over 98% accuracy." },
                 { icon: Camera, title: "Diagnostic Vision", desc: "Transform any standard intraoral photo into a heatmap of soft tissue inflammation and clear plaque indexing." },
                 { icon: ShieldCheck, title: "Compliant & Secure", desc: "Every scan is processed in zero-retention environment built strictly to GDPR and HIPAA clinical standards." },
               ].map((feat, i) => (
                 <div key={i} className="bg-white rounded-[24px] p-6 lg:p-8 border border-gray-100 shadow-sm flex flex-col items-start hover:shadow-md transition-all">
                   <div className="text-[#273d58] mb-5 bg-[#F8FAFC] p-3 rounded-xl shadow-sm border border-gray-100">
                     <feat.icon className="w-6 h-6" />
                   </div>
                   <h3 className="text-lg font-bold text-gray-900 mb-3">{feat.title}</h3>
                   <p className="text-gray-500 text-sm leading-relaxed font-medium">{feat.desc}</p>
                 </div>
               ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* spacer to accommodate the overlaid card */}
      <div className="h-48 md:h-64" />

      {/* Middle Banner Component */}
      <div className="w-full max-w-[1300px] mx-auto px-4 md:px-8 mb-12 relative z-0">
        <div className="relative w-full h-[160px] rounded-[32px] overflow-hidden flex items-center justify-center bg-gray-900 shadow-md">
             <div className="absolute inset-0">
               <img 
                 src="https://images.unsplash.com/photo-1598256989800-fea5ce5146f5?q=80&w=2670&auto=format&fit=crop" 
                 alt="Microscope abstract" 
                 className="w-full h-full object-cover opacity-40 mix-blend-overlay"
               />
               <div className="absolute inset-0 bg-[#162231]/80" />
             </div>
             <p className="relative z-10 text-[22px] md:text-[28px] leading-tight font-semibold text-white max-w-3xl text-center px-6">
               It's time to upgrade your practice — start with<br />quality dental diagnostics made for every case.
             </p>
        </div>
      </div>

      {/* Footer Typography */}
      <footer className="w-full text-center pb-4 mt-auto">
        <p className="text-[6px] text-[#273d58]/30 font-medium tracking-widest uppercase">
          made by darren @2026 - blessed with the best
        </p>
      </footer>
    </div>
  );
}
