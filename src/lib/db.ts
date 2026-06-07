import { supabase } from './supabase';

export async function getDashboardStats() {
  const { data, error } = await supabase
    .from('dashboard_stats')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching dashboard stats:', error);
    // Fallback to default stats if table doesn't exist
    return [
      { label: "Analyses Completed", value: "0", change: "0%", isPositive: true, sparkline: [0, 0, 0, 0, 0, 0, 0] },
      { label: "New Patients", value: "0", change: "0%", isPositive: true, sparkline: [0, 0, 0, 0, 0, 0, 0] },
      { label: "Anomalies Found", value: "0", change: "0%", isPositive: false, sparkline: [0, 0, 0, 0, 0, 0, 0] },
      { label: "Scans Processed", value: "0", change: "0%", isPositive: true, sparkline: [0, 0, 0, 0, 0, 0, 0] },
    ];
  }
  return data?.stats || [];
}

export async function getRecentDiagnoses(limit = 5) {
  const { data, error } = await supabase
    .from('recent_diagnoses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent diagnoses:', error);
    return [];
  }
  return data || [];
}

export async function uploadDiagnosisImage(file: File, filename: string): Promise<string> {
  const { error } = await supabase.storage
    .from('diagnosis-images')
    .upload(`public/${filename}`, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('diagnosis-images')
    .getPublicUrl(`public/${filename}`);

  return publicUrl;
}

export async function createPatient(patient: {
  name: string
  age?: number
  gender?: string
  notes?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('patients')
    .insert([{ ...patient, user_id: user.id }])
    .select()
    .single()
  if (error) throw error
  return data
}
