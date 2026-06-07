import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Activity, Camera, LayoutDashboard, Search, Bell, Settings, Users } from "lucide-react";
import { cn } from "../../lib/utils";

const MotionLink = motion.create(Link);

const NAV_ITEMS = [
  { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { name: "Photo Diagnose", path: "/diagnose/photo", icon: Camera },
  { name: "X-Ray Diagnose", path: "/diagnose/xray", icon: Activity },
  { name: "Patients", path: "/patients", icon: Users },
];

export function TopNav() {
  const location = useLocation();

  return (
    <header className="h-24 w-full px-8 flex items-center justify-between shrink-0 bg-transparent">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-3 w-48 group">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-[#273d58]">
          <img src="/3.png" alt="Dentine Logo" className="w-6 h-6 object-contain group-hover:scale-110 transition-transform" />
        </div>
        <span className="font-bold text-xl tracking-tight text-gray-900">
          Dentine
        </span>
      </Link>

      {/* Navigation Pills */}
      <nav className="hidden md:flex items-center bg-white p-1.5 rounded-full border border-gray-100 shadow-sm">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <MotionLink
              key={item.path}
              to={item.path}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "relative flex items-center px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200",
                isActive 
                  ? "bg-[#273d58] text-white shadow-sm" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
              )}
            >
              <div className="relative z-10 flex items-center gap-2">
                {isActive && <item.icon className="w-4 h-4" />}
                <span>{item.name}</span>
              </div>
            </MotionLink>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm transition-colors">
            <Search className="w-[18px] h-[18px]" />
          </button>
        </div>
        
        <div className="flex items-center gap-3 bg-white border border-gray-100 shadow-sm rounded-full py-1.5 px-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full overflow-hidden flex-shrink-0">
            <img src="https://i.pravatar.cc/100?img=11" alt="Dr. Jackson" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col mr-3 justify-center">
            <span className="text-[10px] text-gray-400 font-medium leading-[1]">Welcome</span>
            <span className="text-sm font-bold text-gray-900 leading-[1.2]">Jackson</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 items-center justify-center sm:flex-row sm:gap-2">
          <button className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm transition-colors">
            <Bell className="w-[18px] h-[18px]" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm transition-colors">
            <Settings className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
