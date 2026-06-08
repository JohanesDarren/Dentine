import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Users, Loader2 } from 'lucide-react';
import { getPatientsAPI } from '../lib/api';
import { getCurrentUser } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

export default function PatientSelector({ onSelect }: { onSelect: (patient: any) => void }) {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPatients() {
      try {
        const user = await getCurrentUser();
        if (user) {
          const data = await getPatientsAPI(user.id);
          setPatients(data || []);
        }
      } catch (error) {
        console.error('Failed to load patients:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPatients();
  }, []);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.id && p.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden w-full max-w-3xl mx-auto my-8">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#273d58]" />
            Select Patient
          </h3>
          <p className="text-sm text-gray-500 mt-1">Please select an existing patient to attach the diagnosis to.</p>
        </div>
        <button 
          onClick={() => navigate('/patients')}
          className="flex items-center gap-2 px-4 py-2 bg-[#273d58] text-white rounded-lg text-sm font-medium hover:bg-[#1e2f44] transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add New Patient
        </button>
      </div>
      
      <div className="p-6">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#273d58] focus:border-[#273d58] outline-none transition-all shadow-sm"
            placeholder="Search patients by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#273d58]" />
            <p>Loading patients...</p>
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
            {filteredPatients.map(patient => (
              <div 
                key={patient.id} 
                onClick={() => onSelect(patient)}
                className="border border-gray-200 rounded-xl p-4 hover:border-[#273d58] hover:shadow-md transition-all cursor-pointer bg-white group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-50 text-[#273d58] rounded-full flex items-center justify-center font-bold text-lg group-hover:bg-[#273d58] group-hover:text-white transition-colors">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-[#273d58] transition-colors">{patient.name}</h4>
                    <div className="flex gap-2 text-xs text-gray-500 mt-1">
                      {patient.age && <span>{patient.age} yrs</span>}
                      {patient.gender && <span className="capitalize border-l border-gray-300 pl-2">{patient.gender}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Users className="w-12 h-12 text-gray-400 mb-3" />
            <p className="font-medium text-gray-900">No patients found</p>
            <p className="text-sm mt-1 mb-4 text-center max-w-sm">We couldn't find any patients matching your search, or your list is empty.</p>
            <button 
              onClick={() => navigate('/patients')}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Go to Patient Directory
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
