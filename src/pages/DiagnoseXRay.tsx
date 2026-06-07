import { useState } from "react";
import DiagnosisResults, { ScanResult } from "../components/DiagnosisResults";
import SmartUploadZone from "../components/SmartUploadZone";
import DentalScene, { mockConditions } from "../components/DentalScene";
import PatientBiodataForm, { PatientSummaryCard } from "../components/PatientBiodataForm";

const MOCK_XRAY_RESULTS: ScanResult[] = [
  { id: "1", condition: "Class II Cavity", severity: "Severe", confidence: 94, teeth: "U7", description: "Deep decay reaching the dentin layer. Immediate restoration recommended.", x: 25, y: 30, w: 15, h: 20 },
  { id: "2", condition: "Bone Loss", severity: "Mild", confidence: 82, teeth: "L4", description: "Slight marginal bone loss observed.", x: 60, y: 70, w: 18, h: 10 },
  { id: "3", condition: "Healthy Crown", severity: "Healthy", confidence: 99, teeth: "U2", description: "No structural anomalies detected.", x: 45, y: 15, w: 12, h: 15 },
];

export default function DiagnoseXRay() {
  const [analyzedImage, setAnalyzedImage] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<any>(null);

  // In a real app, this would be fetched from API and set to state
  const diagnosisResults = null;

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
          <PatientBiodataForm onSubmit={setPatientData} />
        ) : (
          <>
            <PatientSummaryCard patient={patientData} onClear={() => { setPatientData(null); setAnalyzedImage(null); }} />
            {analyzedImage ? (
              <div>
                <DiagnosisResults 
                  image={analyzedImage} 
                  results={MOCK_XRAY_RESULTS} 
                  mode="xray" 
                  onReset={() => setAnalyzedImage(null)} 
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
              <SmartUploadZone onAnalyze={(url) => setAnalyzedImage(url)} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
