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

export async function getDiagnosisChartData() {
  const { data, error } = await supabase
    .from('diagnoses')
    .select('created_at, mode')
    .order('created_at', { ascending: true })
  
  if (error || !data) return []
  
  const grouped: Record<string, { 
    date: string, photo: number, xray: number 
  }> = {}
  
  data.forEach(d => {
    const date = new Date(d.created_at)
      .toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric' 
      })
    if (!grouped[date]) {
      grouped[date] = { date, photo: 0, xray: 0 }
    }
    if (d.mode === 'photo') grouped[date].photo++
    else grouped[date].xray++
  })
  
  return Object.values(grouped).slice(-30)
}

export async function getConditionBreakdown() {
  const { data, error } = await supabase
    .from('conditions')
    .select('condition')
  
  if (error || !data) return []
  
  const counts: Record<string, number> = {}
  data.forEach(c => {
    counts[c.condition] = (counts[c.condition] || 0) + 1
  })
  
  const colors: Record<string, string> = {
    'Caries': '#0EA5E9',
    'Deep Caries': '#8B5CF6',
    'Impacted': '#F59E0B',
    'Periapical Lesion': '#EF4444',
    'Healthy': '#10B981',
    'Filling': '#06B6D4',
    'Crown': '#84CC16'
  }
  
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    color: colors[name] || '#94A3B8'
  }))
}
