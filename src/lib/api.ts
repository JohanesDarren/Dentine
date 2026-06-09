import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL 
  || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000
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
  const response = await api.post('/save-diagnosis', data)
  return response.data
}

export async function createPatientAPI(data: {
  user_id?: string
  name: string
  age?: number
  gender?: string
  notes?: string
}) {
  const response = await api.post('/patients', data)
  return response.data
}

export async function getPatientsAPI(userId: string) {
  const response = await api.get(`/patients?user_id=${userId}`)
  return response.data.patients
}