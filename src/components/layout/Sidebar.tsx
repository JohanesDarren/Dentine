import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Activity, Camera, Home, LayoutDashboard, Stethoscope, Users } from "lucide-react";
import { cn } from "../../lib/utils";

const MotionLink = motion.create(Link);

const NAV_ITEMS = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Photo Diagnosis", path: "/diagnose/photo", icon: Camera },
  { name: "X-Ray Diagnosis", path: "/diagnose/xray", icon: Activity },
  { name: "Patients", path: "/patients", icon: Users },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-16 md:w-64 h-screen bg-surface border-r border-border-app flex flex-col transition-all duration-300 z-10 shrink-0 hidden sm:flex">
      {/* Brand */}
      <div className="h-16 flex items-center px-4 md:px-6 border-b border-border-app shrink-0">
        <Link to="/" className="flex items-center gap-3 w-full group">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-semibold text-lg tracking-tight hidden md:block text-text-primary">
            Dentine
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <MotionLink
              key={item.path}
              to={item.path}
              whileHover={{ x: 4, backgroundColor: "#EFF6FF" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={cn(
                "relative flex items-center px-6 py-3 border-l-4 text-sm transition-colors",
                isActive 
                  ? "border-primary bg-primary/10 text-primary font-medium" 
                  : "border-transparent text-text-muted font-medium"
              )}
            >
              <div className="relative z-10 flex items-center gap-3 w-full">
                <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-primary" : "text-text-muted")} />
                <span className="hidden md:block truncate">{item.name}</span>
              </div>
            </MotionLink>
          );
        })}
      </nav>

      {/* Footer area inside sidebar */}
      <div className="p-6 border-t border-border-app space-y-4 shrink-0 hidden md:block">
        <div className="bg-slate-50 p-4 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">AI Model v2.4</span>
            <span className="text-xs font-bold text-success">Live</span>
          </div>
          <div className="h-1.5 w-full bg-border-app rounded-full">
            <div className="h-1.5 bg-success rounded-full" style={{ width: '98%' }}></div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent-purple rounded-full flex items-center justify-center text-white font-bold shrink-0">JD</div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate text-text-primary">Dr. Jonathan Doe</p>
            <p className="text-xs text-text-muted truncate">Senior Dental Surgeon</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
