import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import DentalScene from "../components/DentalScene";

export default function Results() {
  const { diagnosisId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResult() {
      if (!diagnosisId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('diagnoses')
        .select('*, conditions(*), patients(name, age, gender)')
        .eq('id', diagnosisId)
        .single();
      
      if (!error && data) {
        setData(data);
      }
      setLoading(false);
    }
    fetchResult();
  }, [diagnosisId]);

  if (loading) return <div className="p-8 text-gray-500">Loading results...</div>;
  if (!data) return <div className="p-8 text-gray-500">Diagnosis not found.</div>;

  const patient = data.patients || {};

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          >
            &larr; Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Diagnosis Results</h1>
            <p className="text-gray-500 text-sm">
              {new Date(data.created_at).toLocaleDateString()} • {patient.name}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${data.mode === 'photo' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
          {data.mode === 'photo' ? 'Photo Analysis' : 'X-Ray Analysis'}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          {data.image_url ? (
            <img src={data.image_url} alt="Scan" className="w-full rounded-xl object-cover border border-gray-200" />
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">No Image</div>
          )}
        </div>
        <div className="w-full md:w-2/3">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Summary</h3>
          <div className="flex gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-xl flex-1 border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Overall Severity</p>
              <p className={`text-xl font-bold ${data.overall_severity === 'Severe' ? 'text-red-600' : data.overall_severity === 'Mild' ? 'text-amber-600' : 'text-green-600'}`}>
                {data.overall_severity}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl flex-1 border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Anomalies Detected</p>
              <p className="text-xl font-bold text-gray-900">{data.total_detected}</p>
            </div>
          </div>
          <h3 className="text-md font-bold text-gray-900 mb-2">Conditions Found</h3>
          <div className="max-h-60 overflow-y-auto">
            <ul className="divide-y divide-gray-100">
              {data.conditions?.map((c: any) => (
                <li key={c.id || c.tooth} className="py-2 flex justify-between items-center">
                  <span className="font-medium text-gray-800">Tooth {c.tooth}: {c.condition}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${c.severity === 'severe' || c.severity === 'Severe' ? 'bg-red-100 text-red-700' : c.severity === 'mild' || c.severity === 'Mild' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {c.severity}
                  </span>
                </li>
              ))}
              {(!data.conditions || data.conditions.length === 0) && (
                <li className="py-2 text-gray-500">No conditions detected.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex justify-center">
        <DentalScene 
          conditions={data.conditions || []} 
          onToothClick={() => {}} 
          size="full" 
        />
      </div>
    </div>
  );
}
