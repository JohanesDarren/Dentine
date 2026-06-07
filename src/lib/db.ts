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
