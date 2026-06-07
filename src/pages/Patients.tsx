import { Card } from "../components/ui";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { getPatientsAPI, createPatientAPI } from "../lib/api";

export default function Patients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: "", age: "", gender: "", notes: "" });

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const data = await getPatientsAPI();
      setPatients(data || []);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleCreatePatient = async () => {
    if (!formData.name.trim()) return;
    setIsCreating(true);
    try {
      await createPatientAPI({
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || undefined,
        notes: formData.notes || undefined
      });
      setIsModalOpen(false);
      setFormData({ name: "", age: "", gender: "", notes: "" });
      alert("Patient created successfully!");
      await fetchPatients();
    } catch (error) {
      console.error("Error creating patient:", error);
      alert("Failed to create patient");
    } finally {
      setIsCreating(false);
    }
  };

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
            onClick={() => setIsModalOpen(true)}
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
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse border-b border-border-app last:border-0">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div><div className="h-3 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-24"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-6 w-6 bg-gray-200 rounded inline-block"></div></td>
                  </tr>
                ))
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No patients yet.
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
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
                      <div className="text-xs text-text-muted mt-0.5">{patient.id ? patient.id.substring(0, 8) : "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {patient.last_visit || (patient.created_at ? new Date(patient.created_at).toLocaleDateString() : "Unknown")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                      {patient.age || "N/A"} y/o • {patient.gender || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium",
                        patient.status === "Requires Follow-up" ? "bg-warning/10 text-warning" : 
                        patient.status === "Treatment Ongoing" ? "bg-primary/10 text-primary" :
                        "bg-success/10 text-success"
                      )}>
                        {patient.status || "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-md hover:bg-border-app">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">New Patient</h2>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      placeholder="e.g. 35"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Any relevant medical history..."
                  ></textarea>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreatePatient}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-[#1e2f44] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  disabled={isCreating || !formData.name.trim()}
                >
                  {isCreating ? "Creating..." : "Create Patient"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Helper to use cn directly if imported globally, or we can just redefine here for simplicity.
// For now, I'll inline the cn call or just use standard react.
function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}
