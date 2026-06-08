import { supabase } from './supabase';

export async function getDashboardStats() {
  const { data, error } = await supabase
    .from('dashboard_stats')
    .select('*')
    .single()
  if (error) {
    console.error('Dashboard stats error:', error)
    return {
      total_patients: 0,
      total_diagnoses: 0,
      diagnoses_today: 0,
      photo_analyses: 0,
      xray_analyses: 0
    }
  }
  return data
}

export async function getRecentDiagnoses(limit = 5) {
  const { data, error } = await supabase
    .from('recent_diagnoses')
    .select('*')
    .limit(limit)
  if (error) {
    console.error('Recent diagnoses error:', error)
    return []
  }
  return data || []
}

export async function uploadDiagnosisImage(
  file: File,
  diagnosisId: string
): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${diagnosisId}-${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('diagnosis-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) throw error
  
  const { data: urlData } = supabase.storage
    .from('diagnosis-images')
    .getPublicUrl(fileName)
  
  return urlData.publicUrl
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
