import { useState, useEffect } from "react";
import { Card } from "../components/ui";
import { Search, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { getPatientsAPI, createPatientAPI } from "../lib/api";
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase';
import DentalScene from '../components/DentalScene';
import { useNavigate } from "react-router-dom";

export default function Patients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', age: '', gender: '', notes: '' });

  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientDiagnoses, setPatientDiagnoses] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'history'|'notes'>('history');
  const [patientNotes, setPatientNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  
  const navigate = useNavigate();

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      const data = await getPatientsAPI(user?.id || '');
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

  const handleSelectPatient = async (patient: any) => {
    setSelectedPatient(patient);
    setLoadingDetail(true);
    setPatientNotes(patient.notes || '');
    setActiveTab('history');
    
    try {
      const { data } = await supabase
        .from('diagnoses')
        .select('*, conditions(*)')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false });
      
      setPatientDiagnoses(data || []);
    } catch (error) {
      console.error("Error fetching diagnoses:", error);
      setPatientDiagnoses([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreatePatient = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const user = await getCurrentUser();
      await createPatientAPI({
        name: form.name,
        age: form.age ? parseInt(form.age) : undefined,
        gender: form.gender || undefined,
        notes: form.notes || undefined,
        user_id: user?.id
      });
      
      setCreating(false);
      setShowNewPatient(false);
      setForm({ name: '', age: '', gender: '', notes: '' });
      
      const updated = await getPatientsAPI();
      setPatients(updated);
      
      alert("Patient added successfully");
    } catch (error) {
      console.error("Error creating patient:", error);
      alert("Failed to create patient");
      setCreating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedPatient) return;
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from('patients')
        .update({ notes: patientNotes })
        .eq('id', selectedPatient.id);
        
      if (error) throw error;
      
      const updatedPatient = { ...selectedPatient, notes: patientNotes };
      setSelectedPatient(updatedPatient);
      setPatients(patients.map(p => p.id === selectedPatient.id ? updatedPatient : p));
      alert("Notes saved");
    } catch (error) {
      console.error("Error saving notes:", error);
      alert("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getRiskColor = (patient: any) => {
    if (patient.status === 'Requires Follow-up') return 'bg-red-100 text-red-600';
    if (patient.status === 'Treatment Ongoing') return 'bg-amber-100 text-amber-600';
    return 'bg-green-100 text-green-600';
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Patient Records</h1>
          <p className="text-gray-500 mt-1">Manage patient history, previous scans, and treatment plans.</p>
        </div>
      </div>

      <div className="flex gap-6 w-full max-w-full">
        {/* Left panel (45%) */}
        <div className={selectedPatient ? "w-[45%]" : "w-full"}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="flex items-center gap-3 w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search patients..." 
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
              <button 
                onClick={() => setShowNewPatient(true)}
                className="bg-sky-500 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm hover:bg-sky-600 transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                New Patient
              </button>
            </div>
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1 hide-scrollbar">
              {['All', 'High Risk', 'Recent', 'Healthy'].map(filter => (
                <button key={filter} className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full whitespace-nowrap transition-colors">
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {isLoading ? (
               <div className="text-center py-10 text-gray-400">Loading patients...</div>
            ) : patients.length === 0 ? (
               <div className="text-center py-10 bg-white rounded-xl border border-gray-100 text-gray-400 shadow-sm">No patients found.</div>
            ) : (
               patients.map(patient => (
                 <div 
                   key={patient.id} 
                   onClick={() => handleSelectPatient(patient)}
                   className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedPatient?.id === patient.id ? 'bg-sky-50 border-sky-200 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'}`}
                 >
                   <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${getRiskColor(patient)}`}>
                       {getInitials(patient.name)}
                     </div>
                     <div className="flex-1 min-w-0">
                       <h3 className="font-semibold text-gray-900 truncate">{patient.name}</h3>
                       <p className="text-xs text-gray-500">{patient.age ? `${patient.age} y/o` : 'Unknown age'} • {patient.gender || 'Unknown gender'}</p>
                     </div>
                     <div className="text-right">
                       <div className="text-xs text-gray-400 mb-1">{patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : 'New'}</div>
                       <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${patient.status === 'Requires Follow-up' ? 'bg-red-100 text-red-700' : patient.status === 'Treatment Ongoing' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                         {patient.status || 'Healthy'}
                       </span>
                     </div>
                   </div>
                 </div>
               ))
            )}
          </div>
        </div>

        {/* Right panel (55%) */}
        {selectedPatient && (
          <div className="w-[55%] bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-140px)] sticky top-6">
            <div className="p-6 border-b border-gray-100 flex gap-5 items-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl ${getRiskColor(selectedPatient)}`}>
                {getInitials(selectedPatient.name)}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{selectedPatient.name}</h2>
                <p className="text-sm text-gray-500 mb-2">{selectedPatient.age ? `${selectedPatient.age} y/o` : ''} {selectedPatient.gender ? `• ${selectedPatient.gender}` : ''}</p>
                <div className="flex gap-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    Total visits: {patientDiagnoses.length}
                  </span>
                  {patientDiagnoses.length > 0 && (
                    <span className="text-xs text-gray-400 flex items-center">
                      Last visit: {new Date(patientDiagnoses[0].created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex px-6 border-b border-gray-100">
              <button 
                onClick={() => setActiveTab('history')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Diagnosis History
              </button>
              <button 
                onClick={() => setActiveTab('notes')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'notes' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Notes
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {activeTab === 'history' ? (
                loadingDetail ? (
                  <div className="flex justify-center items-center h-40 text-gray-400">Loading diagnoses...</div>
                ) : patientDiagnoses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No diagnoses yet</h3>
                    <p className="text-sm text-gray-500 mb-6">This patient has no recorded diagnoses in the system.</p>
                    <div className="flex gap-3">
                      <button onClick={() => navigate('/diagnose/photo', { state: { patient: selectedPatient } })} className="px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg text-sm hover:bg-blue-100 transition-colors">
                        New Photo Diagnosis
                      </button>
                      <button onClick={() => navigate('/diagnose/xray', { state: { patient: selectedPatient } })} className="px-4 py-2 bg-purple-50 text-purple-600 font-medium rounded-lg text-sm hover:bg-purple-100 transition-colors">
                        New X-Ray Analysis
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-4">
                    {patientDiagnoses.map((diag, i) => (
                      <div key={diag.id} className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-white border-2 border-sky-500 rounded-full -left-[7px] top-1.5"></div>
                        
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                                {new Date(diag.created_at).toLocaleDateString()}
                              </span>
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${diag.mode === 'photo' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                {diag.mode === 'photo' ? 'Photo' : 'X-Ray'}
                              </span>
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${diag.overall_severity === 'Severe' ? 'bg-red-100 text-red-700' : diag.overall_severity === 'Mild' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                {diag.overall_severity}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">{diag.conditions?.length || 0} conditions</span>
                          </div>
                          
                          {diag.conditions && diag.conditions.length > 0 && (
                            <div className="mb-4 bg-gray-50 rounded-lg p-4 flex justify-center border border-gray-100">
                              <DentalScene conditions={diag.conditions} onToothClick={() => {}} size="mini" />
                            </div>
                          )}
                          
                          <button 
                            onClick={() => navigate(`/results/${diag.id}`)}
                            className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors border border-gray-200"
                          >
                            View Full Results
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="flex flex-col h-full">
                  <textarea 
                    className="flex-1 w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
                    placeholder="Add notes for this patient..."
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                  ></textarea>
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                      {savingNotes ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Patient Modal */}
      {showNewPatient && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-[480px] p-8 relative"
            style={{ zIndex: 51 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Patient</h2>
              <button onClick={() => setShowNewPatient(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full px-[14px] py-[10px] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input 
                    type="number" 
                    className="w-full px-[14px] py-[10px] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
                    value={form.age}
                    onChange={(e) => setForm({...form, age: e.target.value})}
                    placeholder="e.g. 35"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select 
                    className="w-full px-[14px] py-[10px] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow bg-white"
                    value={form.gender}
                    onChange={(e) => setForm({...form, gender: e.target.value})}
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
                  className="w-full px-[14px] py-[10px] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow resize-none"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  placeholder="Any relevant medical history..."
                ></textarea>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => setShowNewPatient(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors"
                disabled={creating}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreatePatient}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                disabled={creating || !form.name.trim()}
              >
                {creating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Creating...
                  </>
                ) : "Create Patient"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
