import { useState } from "react";
import DiagnosisResults, { ScanResult } from "../components/DiagnosisResults";
import SmartUploadZone from "../components/SmartUploadZone";
import DentalScene, { mockConditions } from "../components/DentalScene";
import PatientSelector from "../components/PatientSelector";
import { PatientSummaryCard } from "../components/PatientBiodataForm";
import { diagnoseXray, saveDiagnosis } from '../lib/api';
import { uploadDiagnosisImage } from '../lib/db';
import { getCurrentUser } from '../lib/auth';

import { useLocation } from "react-router-dom";

export default function DiagnoseXRay() {
  const location = useLocation();
  const [analyzedImage, setAnalyzedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [patientData, setPatientData] = useState<any>(location.state?.patient || null);
  const [diagnosisResults, setDiagnosisResults] = useState<any>(null);
  const [overallSeverity, setOverallSeverity] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAnalyze = async (url: string, file: File) => {
    setIsAnalyzing(true);
    try {
      const result = await diagnoseXray(file);
      setDiagnosisResults(result.conditions);
      setOverallSeverity(result.overall_severity);
      setAnalyzedImage(url);
      setImageFile(file);
    } catch (error: any) {
      console.error(error);
      const backendMsg = error.response?.data?.detail || error.message;
      alert(`Failed to analyze image: ${backendMsg}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!imageFile || !diagnosisResults) return;
    setIsSaving(true);
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error("Not authenticated");

      const filename = `${crypto.randomUUID()}-${imageFile.name}`;
      const imageUrl = await uploadDiagnosisImage(imageFile, filename);
      await saveDiagnosis({
        user_id: user.id,
        patient_id: patientData.id,
        mode: "xray",
        overall_severity: overallSeverity,
        image_url: imageUrl,
        conditions: diagnosisResults,
        total_detected: diagnosisResults.length
      });
      alert("Diagnosis saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save diagnosis");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">X-Ray Diagnosis</h1>
          <p className="text-gray-500 mt-1">Upload panoramic or bitewing X-rays for deep cavity and bone analysis.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-[500px]">
        {!patientData ? (
          <PatientSelector onSelect={setPatientData} />
        ) : (
          <>
            <PatientSummaryCard patient={patientData} onClear={() => { setPatientData(null); setAnalyzedImage(null); }} />
            {analyzedImage && diagnosisResults ? (
              <div>
                <DiagnosisResults 
                  image={analyzedImage} 
                  results={diagnosisResults} 
                  mode="xray" 
                  patient={patientData}
                  onReset={() => { setAnalyzedImage(null); setDiagnosisResults(null); setImageFile(null); }} 
                  onSave={handleSave}
                  isSaving={isSaving}
                />
                <div style={{ position: 'relative', marginTop: '32px' }}>
                  <h3 className="text-xl font-semibold tracking-tight text-gray-900 mb-1">
                    Affected Teeth Map
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Click any highlighted tooth for details
                  </p>
                  <DentalScene
                    conditions={diagnosisResults || mockConditions}
                    onToothClick={(toothNumber) => {
                      console.log("Clicked tooth:", toothNumber)
                    }}
                    size="full"
                  />
                </div>
              </div>
            ) : (
              <div className="relative">
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-2xl backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                      <svg className="animate-spin h-8 w-8 text-[#273d58] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-[#273d58] font-medium">Analyzing X-Ray with AI...</p>
                    </div>
                  </div>
                )}
                <SmartUploadZone onAnalyze={handleAnalyze} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
