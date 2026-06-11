import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, Camera, LayoutDashboard, Search, Bell, Settings, Users, LogOut, Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { getProfile } from "../../lib/auth";
import { useEffect, useState } from "react";

const MotionLink = motion.create(Link);

const NAV_ITEMS = [
  { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { name: "Photo Diagnose", path: "/diagnose/photo", icon: Camera },
  { name: "X-Ray Diagnose", path: "/diagnose/xray", icon: Activity },
  { name: "Patients", path: "/patients", icon: Users },
];

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    getProfile().then(setProfile).catch(console.error);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const initials = profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : "DR";

  return (
    <header className="h-16 md:h-24 w-full px-4 md:px-8 flex items-center justify-between shrink-0 bg-transparent relative z-50">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2 md:gap-3 group z-50">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-[#273d58]">
          <img src="/3.png" alt="Dentine Logo" className="w-5 h-5 md:w-6 md:h-6 object-contain group-hover:scale-110 transition-transform" />
        </div>
        <span className="font-bold text-lg md:text-xl tracking-tight text-gray-900">
          Dentine
        </span>
      </Link>

      {/* Navigation Pills (Desktop) */}
      <nav className="hidden md:flex items-center bg-white p-1.5 rounded-full border border-gray-100 shadow-sm absolute left-1/2 -translate-x-1/2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <MotionLink
              key={item.path}
              to={item.path}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "relative flex items-center px-4 lg:px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200",
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
      <div className="flex items-center gap-2 md:gap-4 z-50">
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden w-10 h-10 flex items-center justify-center text-gray-900 bg-white border border-gray-100 rounded-full shadow-sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm transition-colors">
            <Search className="w-[18px] h-[18px]" />
          </button>
        </div>
        
        <div className="hidden sm:flex items-center gap-3 bg-white border border-gray-100 shadow-sm rounded-full py-1.5 px-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-blue-600 text-xs">
            {initials}
          </div>
          <div className="flex flex-col mr-3 justify-center">
            <span className="text-sm font-bold text-gray-900 leading-[1.2]">{profile?.full_name || "Doctor"}</span>
            <span className="text-[10px] text-gray-400 font-medium leading-[1]">{profile?.clinic_name || "Clinic"}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm transition-colors">
            <Bell className="w-[18px] h-[18px]" />
          </button>
          <Link to="/settings" className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm transition-colors">
            <Settings className="w-[18px] h-[18px]" />
          </Link>
          <button onClick={handleSignOut} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-red-500 shadow-sm transition-colors" title="Sign out">
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-4 right-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex flex-col gap-2 md:hidden z-50"
          >
            <div className="flex items-center gap-3 p-2 mb-2 border-b border-gray-100">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-sm">
                {initials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">{profile?.full_name || "Doctor"}</span>
                <span className="text-[10px] text-gray-400 font-medium">{profile?.clinic_name || "Clinic"}</span>
              </div>
            </div>
            
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-[#273d58] text-white" 
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100">
              <Link
                to="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 text-gray-600 font-medium text-sm hover:bg-gray-100"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleSignOut(); }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
