import React, { useState } from 'react';
import { User, Calendar, FileText } from 'lucide-react';

export default function PatientBiodataForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: 'unspecified',
    patientId: '',
    notes: ''
  });

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    
    onSubmit({
      ...formData,
      patientId: formData.patientId || `PAT-${Math.floor(Math.random() * 90000) + 10000}`
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden w-full max-w-2xl mx-auto my-8">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-900">Patient Information</h3>
        <p className="text-sm text-gray-500 mt-1">Please enter patient details before initiating the scan.</p>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Full Name *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#273d58] focus:border-[#273d58] outline-none transition-all"
                placeholder="e.g. Sarah Johnson"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Patient ID (Optional)</label>
            <input
              type="text"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#273d58] focus:border-[#273d58] outline-none transition-all"
              placeholder="Leave blank to auto-generate"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Date of Birth</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#273d58] focus:border-[#273d58] outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#273d58] focus:border-[#273d58] outline-none transition-all bg-white"
            >
              <option value="unspecified">Select gender...</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Clinical Notes (Optional)</label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#273d58] focus:border-[#273d58] outline-none transition-all resize-none"
              placeholder="Any relevant patient history or specific symptoms..."
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="bg-[#273d58] hover:bg-[#1e2f44] text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm"
          >
            Continue to Upload
          </button>
        </div>
      </form>
    </div>
  );
}

export function PatientSummaryCard({ patient, onClear }) {
  if (!patient) return null;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 shrink-0 bg-blue-100 text-[#273d58] rounded-full flex items-center justify-center font-bold">
          {patient.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-gray-900">{patient.name}</h4>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{patient.patientId}</span>
          </div>
          <div className="text-sm text-gray-500 flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
            {patient.dob && <span>DOB: {patient.dob}</span>}
            {patient.gender !== 'unspecified' && <span className="capitalize">{patient.gender}</span>}
          </div>
        </div>
      </div>
      <button 
        onClick={onClear}
        className="text-sm font-medium text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-200 rounded-lg transition-colors whitespace-nowrap self-stretch sm:self-auto"
      >
        Change Patient
      </button>
    </div>
  );
}
