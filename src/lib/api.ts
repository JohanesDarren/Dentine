import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL 
  || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000
})

export interface DiagnosisResult {
  mode: string
  overall_severity: string
  total_detected: number
  conditions: Array<{
    tooth: number
    condition: string
    severity: string
    confidence: number
    bbox: number[]
  }>
}

import { supabase } from './supabase'

export async function diagnosePhoto(
  imageFile: File
): Promise<DiagnosisResult> {
  const formData = new FormData()
  formData.append('image_file', imageFile)
  const response = await api.post('/diagnose/photo', formData)
  return response.data
}

export async function diagnoseXray(
  imageFile: File
): Promise<DiagnosisResult> {
  const formData = new FormData()
  formData.append('image_file', imageFile)
  const response = await api.post('/diagnose/xray', formData)
  return response.data
}

export async function saveDiagnosis(data: {
  user_id: string
  patient_id: string
  mode: string
  overall_severity: string
  image_url?: string
  conditions: any[]
  total_detected: number
}) {
  // Save diagnosis to Supabase directly from frontend to pass RLS
  const { data: diagnosis, error: diagError } = await supabase.from("diagnoses").insert({
    user_id: data.user_id,
    patient_id: data.patient_id,
    mode: data.mode,
    overall_severity: data.overall_severity,
    image_url: data.image_url,
    conditions: data.conditions,
    total_detected: data.total_detected
  }).select().single()

  if (diagError) throw diagError

  const diagnosis_id = diagnosis.id
  
  const rows = data.conditions.map(c => ({
    diagnosis_id,
    tooth: c.tooth,
    condition: c.condition,
    severity: c.severity,
    confidence: c.confidence,
    bbox: c.bbox
  }))
  
  if (rows.length > 0) {
    const { error: condError } = await supabase.from("conditions").insert(rows)
    if (condError) throw condError
  }

  return { success: true, diagnosis_id }
}

export async function createPatientAPI(data: {
  user_id?: string
  name: string
  age?: number
  gender?: string
  notes?: string
}) {
  const { data: patient, error } = await supabase.from("patients").insert({
    user_id: data.user_id,
    name: data.name,
    age: data.age,
    gender: data.gender,
    notes: data.notes
  }).select().single()
  
  if (error) throw error
  return patient
}

export async function getPatientsAPI(userId?: string) {
  let query = supabase.from("patients").select("*, diagnoses(count)").order("created_at", { ascending: false })
  if (userId) {
    query = query.eq("user_id", userId)
  }
  const { data, error } = await query
  if (error) throw error
  return data
}