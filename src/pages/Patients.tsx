import { Card, AnimatedList, AnimatedListItem } from "../components/ui";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import DentalChart from "../components/DentalChart";

export default function Patients() {
  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Patient Records</h1>
          <p className="text-text-muted mt-1">Manage patient history, previous scans, and treatment plans.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              className="pl-9 pr-4 py-2 bg-surface border border-border-app rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64"
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.96 }}
            className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm hover:shadow transition-shadow"
          >
            <Plus className="w-4 h-4" />
            New Patient
          </motion.button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead className="bg-background-app text-xs font-semibold text-text-muted uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-semibold">Patient Details</th>
                <th className="px-6 py-3 font-semibold">Last Visit</th>
                <th className="px-6 py-3 font-semibold">Age & Gender</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <motion.tbody
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
              className="divide-y divide-border-app"
            >
              {[
                { name: "Sarah Jenkins", id: "PT-8291", lastVisit: "Oct 24, 2026", age: 34, gender: "F", status: "Active" },
                { name: "Michael Chen", id: "PT-8290", lastVisit: "Oct 22, 2026", age: 45, gender: "M", status: "Requires Follow-up" },
                { name: "Emma Wilson", id: "PT-8289", lastVisit: "Oct 20, 2026", age: 28, gender: "F", status: "Active" },
                { name: "James Robertson", id: "PT-8288", lastVisit: "Oct 15, 2026", age: 62, gender: "M", status: "Treatment Ongoing" },
                { name: "Olivia Davis", id: "PT-8287", lastVisit: "Oct 12, 2026", age: 19, gender: "F", status: "Active" },
              ].map((patient) => (
                <motion.tr
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  key={patient.id}
                  className="group hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-text-primary">{patient.name}</div>
                    <div className="text-xs text-text-muted mt-0.5">{patient.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {patient.lastVisit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                    {patient.age} y/o • {patient.gender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      patient.status === "Active" && "bg-success/10 text-success",
                      patient.status === "Requires Follow-up" && "bg-warning/10 text-warning",
                      patient.status === "Treatment Ongoing" && "bg-primary/10 text-primary"
                    )}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-md hover:bg-border-app">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

// Helper to use cn directly if imported globally, or we can just redefine here for simplicity.
// For now, I'll inline the cn call or just use standard react.
function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}
