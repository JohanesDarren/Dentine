import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signUp } from '../lib/auth'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Password strength calculation
  const getStrength = (pw: string) => {
    let strength = 0;
    if (pw.length >= 8) strength += 1;
    if (pw.length >= 12) strength += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(pw)) strength += 1;
    if (/[A-Z]/.test(pw)) strength += 1;
    if (/[0-9]/.test(pw)) strength += 1;

    if (pw.length === 0) return { label: '', color: 'bg-gray-200' };
    if (strength <= 2) return { label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { label: 'Medium', color: 'bg-yellow-500' };
    return { label: 'Strong', color: 'bg-green-500' };
  }

  const strength = getStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await signUp(email, password, fullName, clinicName)
      setSuccess('Account created! Check your email to verify.')
      setFullName('')
      setClinicName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      if (err.message === 'User already registered') {
        setError('An account with this email already exists')
      } else {
        setError(err.message || 'Failed to create account')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0EA5E9] text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle SVG illustration */}
        <svg className="absolute -bottom-24 -left-24 w-96 h-96 opacity-10 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.5 1.5C12.5 1.5 11 3 11 5C11 5.55 11.13 6.07 11.36 6.54L10 8L8.64 6.54C8.87 6.07 9 5.55 9 5C9 3 7.5 1.5 5.5 1.5C3.5 1.5 2 3 2 5C2 7.76 4.24 10 7 10H13C15.76 10 18 7.76 18 5C18 3 16.5 1.5 14.5 1.5M7 8C5.34 8 4 6.66 4 5C4 4.17 4.67 3.5 5.5 3.5C6.33 3.5 7 4.17 7 5V8M13 8H11V5C11 4.17 11.67 3.5 12.5 3.5C13.33 3.5 14 4.17 14 5V8Z" transform="scale(1.2)" />
        </svg>

        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white p-1">
              <img src="/3.png" alt="Dentine Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-2xl tracking-tight">Dentine</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">AI-Powered Dental Diagnosis</h1>
          <p className="text-sky-100 text-lg mb-12">Empowering your practice today, enhancing your patients tomorrow.</p>
          
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-sky-50 font-medium">Instant AI diagnosis from photos</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-sky-50 font-medium">Panoramic X-ray analysis</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-sky-50 font-medium">Complete patient records</span>
            </div>
          </div>
        </div>
        
        <div className="text-sky-200 text-sm font-medium relative z-10">
          © 2026 Dentine Analytics
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center p-6 md:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md my-auto pt-8 pb-8">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#0EA5E9] p-1">
              <img src="/3.png" alt="Dentine Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-gray-900">Dentine</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Create your account</h2>
          <p className="text-gray-500 mb-8 font-medium">Start diagnosing smarter today</p>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium flex items-start gap-2 border border-red-100">
               <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm font-medium flex items-start gap-2 border border-green-100">
               <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full name</label>
              <input type="text" required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                placeholder="Dr. John Smith"
                value={fullName} onChange={e => setFullName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Clinic name</label>
              <input type="text" required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                placeholder="Smith Dental Clinic"
                value={clinicName} onChange={e => setClinicName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <input type="email" required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                placeholder="doctor@clinic.com"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required minLength={8}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  )}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex gap-1 flex-1 mr-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.label === 'Weak' ? '33%' : strength.label === 'Medium' ? '66%' : '100%' }} />
                  </div>
                  <span className={`text-xs font-semibold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
              <input type={showPassword ? "text" : "password"} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                placeholder="••••••••"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || password !== confirmPassword || password.length < 8}
              className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all mt-2 flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : "Create account"}
            </button>
          </form>

          <p className="text-center mt-8 text-gray-500 font-medium text-sm">
            Already have an account? <Link to="/login" className="text-sky-500 hover:text-sky-600 font-bold ml-1">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
