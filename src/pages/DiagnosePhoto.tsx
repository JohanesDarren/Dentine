import { useState } from "react";
import DiagnosisResults, { ScanResult } from "../components/DiagnosisResults";
import SmartUploadZone from "../components/SmartUploadZone";
import DentalScene, { mockConditions } from "../components/DentalScene";
import PatientBiodataForm, { PatientSummaryCard } from "../components/PatientBiodataForm";

const MOCK_PHOTO_RESULTS: ScanResult[] = [
  { id: "1", condition: "Plaque Buildup", severity: "Mild", confidence: 88, teeth: "L2-L4", description: "Noticeable plaque accumulation along the gumline.", x: 45, y: 75 },
  { id: "2", condition: "Gingivitis", severity: "Severe", confidence: 92, teeth: "U5", description: "Severe inflammation and redness indicative of gingivitis.", x: 70, y: 35 },
  { id: "3", condition: "Healthy Tissue", severity: "Healthy", confidence: 97, teeth: "U1", description: "Gums appear healthy with normal stippling.", x: 50, y: 25 },
];

export default function DiagnosePhoto() {
  const [analyzedImage, setAnalyzedImage] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<any>(null);

  // In a real app, this would be fetched from API and set to state
  const diagnosisResults = null;

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Intraoral Photo Diagnosis</h1>
          <p className="text-gray-500 mt-1">Upload photos to detect plaque, gingivitis, and soft tissue anomalies.</p>
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
                  results={MOCK_PHOTO_RESULTS} 
                  mode="photo" 
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

