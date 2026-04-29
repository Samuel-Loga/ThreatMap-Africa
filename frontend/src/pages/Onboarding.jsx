import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

const STEPS = [
  { id: 'org', title: 'Organization', description: 'Institutional context' },
  { id: 'role', title: 'Role & Expertise', description: 'Personal expertise' },
  { id: 'notifs', title: 'Notifications', description: 'Alert preferences' },
  { id: 'identity', title: 'Identity', description: 'Profile enrichment (Optional)' },
  { id: 'security', title: 'Security', description: 'Account safety' },
  { id: 'location', title: 'Location', description: 'Regional context' },
]

export default function Onboarding() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [twoFactorStep, setTwoFactorStep] = useState('idle') // idle, setup, verified
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [tfCode, setTfCode] = useState('')
  const [tfError, setTfError] = useState('')
  const [formData, setFormData] = useState({
    organization: '',
    org_type: '',
    department: '',
    experience_level: '',
    interests: [],
    phone_number: '',
    email_notif: true,
    sms_notif: false,
    push_notif: false,
    update_frequency: 'daily',
    full_name: '',
    pgp_key: '',
    two_factor_enabled: false,
    region_state: '',
    city: '',
    data_sharing_consent: false,
  })

  useEffect(() => {
    // Load existing data if any
    async function loadProfile() {
      try {
        const res = await authApi.me()
        const data = res.data
        setFormData(prev => ({
          ...prev,
          organization: data.organization || '',
          org_type: data.org_type || '',
          department: data.department || '',
          experience_level: data.experience_level || '',
          interests: data.interests || [],
          phone_number: data.phone_number || '',
          email_notif: data.email_notif ?? true,
          sms_notif: data.sms_notif ?? false,
          push_notif: data.push_notif ?? false,
          update_frequency: data.update_frequency || 'daily',
          full_name: data.full_name || '',
          pgp_key: data.pgp_key || '',
          two_factor_enabled: data.two_factor_enabled ?? false,
          region_state: data.region_state || '',
          city: data.city || '',
          data_sharing_consent: data.data_sharing_consent ?? false,
        }))
      } catch (err) {
        console.error('Failed to load profile for onboarding', err)
      }
    }
    loadProfile()
  }, [])

  const handleBack = () => {
    if (currentStep > 0) {
      if (STEPS[currentStep].id === 'security') {
        setTwoFactorStep('idle')
        setTfCode('')
        setTfError('')
      }
      setCurrentStep(prev => prev - 1)
    }
  }

  const isStepValid = () => {
    const s = STEPS[currentStep]
    if (s.id === 'org') {
      return formData.organization.trim().length >= 2 && formData.org_type !== '' && formData.department.trim().length >= 2
    }
    if (s.id === 'role') {
      return formData.experience_level !== '' && formData.interests.length > 0
    }
    if (s.id === 'notifs') {
      if (formData.sms_notif && !formData.phone_number.trim()) return false
      return true
    }
    if (s.id === 'security') {
      if (!formData.data_sharing_consent) return false
      if (formData.two_factor_enabled && twoFactorStep !== 'verified') return false
      return true
    }
    if (s.id === 'location') {
      return formData.region_state.trim() !== '' && formData.city.trim() !== ''
    }
    return true
  }

  const handleNext = async () => {
    if (!isStepValid()) return

    setLoading(true)
    try {
      // Save progress
      const isLastStep = currentStep === STEPS.length - 1
      
      const updateData = { ...formData }

      if (isLastStep) {
        updateData.onboarding_completed = true
      }
      
      const res = await authApi.updateMe(updateData)
      if (isLastStep) {
        const updatedUser = { ...user, onboarding_completed: true }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        navigate('/dashboard')
      } else {
        const updatedUser = { ...user, ...res.data }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        setCurrentStep(prev => prev + 1)
      }
    } catch (err) {
      console.error('Failed to save onboarding progress', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleNext()
    }
  }

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'two_factor_enabled') {
      if (value) {
        start2faSetup()
      } else {
        setTwoFactorStep('idle')
        setQrCode('')
        setSecret('')
        setTfCode('')
        setTfError('')
      }
    }
  }

  const start2faSetup = async () => {
    setLoading(true)
    setTfError('')
    try {
      const res = await authApi.setup2fa()
      setQrCode(res.data.qr_code)
      setSecret(res.data.secret)
      setTwoFactorStep('setup')
    } catch (err) {
      setTfError('Failed to initialize 2FA setup. Please try again.')
      setFormData(prev => ({ ...prev, two_factor_enabled: false }))
    } finally {
      setLoading(false)
    }
  }

  const verify2fa = async () => {
    if (tfCode.length !== 6) return
    setLoading(true)
    setTfError('')
    try {
      await authApi.verifySetup2fa(tfCode)
      setTwoFactorStep('verified')
    } catch (err) {
      setTfError(err.response?.data?.detail || 'Invalid verification code.')
    } finally {
      setLoading(false)
    }
  }

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const step = STEPS[currentStep]
  const isMandatory = ['org', 'role', 'security', 'location'].includes(step.id)

  const inputClass = "w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
  const labelClass = "block text-sm font-medium text-gray-400 mb-1.5"

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
          <span className="text-sm text-gray-500 font-mono">Step {currentStep + 1} of {STEPS.length}</span>
        </div>
        <div className="w-full bg-dark-700 h-2 rounded-full overflow-hidden flex">
          {STEPS.map((_, idx) => (
            <div 
              key={idx} 
              className={`flex-1 h-full border-r border-dark-900 last:border-0 transition-colors ${idx <= currentStep ? 'bg-primary' : 'bg-transparent'}`}
            />
          ))}
        </div>
        <p className="text-gray-400 mt-4 italic text-sm">"Complete your profile to improve threat accuracy and platform insights."</p>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 md:p-8 shadow-xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white">{step.title}</h2>
            {isMandatory && <span className="text-[10px] bg-red-900/30 text-red-400 border border-red-800/50 px-1.5 py-0.5 rounded uppercase font-bold">Required</span>}
          </div>
          <p className="text-gray-400 text-sm">{step.description}</p>
        </div>

        {step.id === 'org' && (
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Organization Name *</label>
              <input 
                type="text" 
                className={inputClass} 
                value={formData.organization}
                onChange={(e) => updateField('organization', e.target.value)}
                placeholder="e.g. National Cyber Security Centre"
                required
                minLength={2}
              />
            </div>
            <div>
              <label className={labelClass}>Organization Type *</label>
              <select 
                className={inputClass}
                value={formData.org_type}
                onChange={(e) => updateField('org_type', e.target.value)}
                required
              >
                <option value="">Select type...</option>
                <option value="Government">Government</option>
                <option value="Private Sector">Private Sector</option>
                <option value="ISP">ISP / Telco</option>
                <option value="University">University / Research</option>
                <option value="NGO">NGO</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Department *</label>
              <input 
                type="text" 
                className={inputClass} 
                value={formData.department}
                onChange={(e) => updateField('department', e.target.value)}
                placeholder="e.g. SOC, Threat Intel Team"
                required
                minLength={2}
              />
            </div>
          </div>
        )}

        {step.id === 'role' && (
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Primary Role *</label>
              <select 
                className={inputClass}
                value={formData.experience_level}
                onChange={(e) => updateField('experience_level', e.target.value)}
                required
              >
                <option value="">Select role...</option>
                <option value="Analyst">Security Analyst</option>
                <option value="Engineer">Security Engineer</option>
                <option value="Researcher">Researcher</option>
                <option value="Student">Student</option>
                <option value="Manager">Manager / CISO</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-400">Areas of Interest *</label>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold">Required</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">Your threat feed will be personalized based on these selections.</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Phishing', 'Malware', 'DDoS', 'Ransomware', 'Social Engineering', 'APT', 'Cloud Security'].map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      formData.interests.includes(interest)
                        ? 'bg-primary border-primary text-white'
                        : 'bg-dark-700 border-dark-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step.id === 'notifs' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={formData.email_notif}
                  onChange={(e) => updateField('email_notif', e.target.checked)}
                  className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary focus:ring-primary"
                />
                <span className="text-gray-200 group-hover:text-white transition-colors">Email Notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={formData.sms_notif}
                  onChange={(e) => updateField('sms_notif', e.target.checked)}
                  className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary focus:ring-primary"
                />
                <span className="text-gray-200 group-hover:text-white transition-colors">SMS Alerts (requires phone)</span>
              </label>
              {formData.sms_notif && (
                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <input 
                    type="tel" 
                    className={inputClass} 
                    value={formData.phone_number}
                    onChange={(e) => updateField('phone_number', e.target.value)}
                    placeholder="+254 700 000000"
                    required
                  />
                </div>
              )}
            </div>
            <div>
              <label className={labelClass}>Update Frequency</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['instant', 'daily', 'weekly', 'none'].map(freq => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => updateField('update_frequency', freq)}
                    className={`px-3 py-2 rounded border text-xs font-bold uppercase transition-colors ${
                      formData.update_frequency === freq
                        ? 'bg-primary border-primary text-white'
                        : 'bg-dark-700 border-dark-600 text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step.id === 'identity' && (
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Full Name (Optional)</label>
              <input 
                type="text" 
                className={inputClass} 
                value={formData.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className={labelClass}>PGP Public Key (Optional)</label>
              <textarea 
                className={`${inputClass} font-mono text-[10px]`}
                rows={5}
                value={formData.pgp_key}
                onChange={(e) => updateField('pgp_key', e.target.value)}
                placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----..."
              />
            </div>
          </div>
        )}

        {step.id === 'security' && (
          <div className="space-y-6">
            <div className={`bg-primary/5 border rounded-lg p-4 transition-colors ${formData.two_factor_enabled ? 'border-primary' : 'border-primary/20'}`}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={formData.two_factor_enabled}
                  onChange={(e) => updateField('two_factor_enabled', e.target.checked)}
                  className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-white font-medium block">Enable Two-Factor Authentication</span>
                  <span className="text-gray-400 text-xs">Secure your account using TOTP (Google Authenticator, etc.)</span>
                </div>
              </label>

              {formData.two_factor_enabled && twoFactorStep === 'setup' && (
                <div className="mt-6 pt-6 border-t border-primary/20 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-white p-2 rounded-lg">
                      <img src={qrCode} alt="2FA QR Code" className="w-32 h-32" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">Scan this QR code with your authenticator app</p>
                      <p className="text-[10px] text-gray-500 font-mono select-all">Secret: {secret}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase">Verification Code</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        inputMode="numeric"
                        maxLength={6}
                        className={`${inputClass} text-center font-mono text-xl tracking-widest`}
                        placeholder="000000"
                        value={tfCode}
                        onChange={(e) => setTfCode(e.target.value.replace(/\D/g, ''))}
                      />
                      <button 
                        onClick={verify2fa}
                        disabled={loading || tfCode.length !== 6}
                        className="px-6 bg-primary text-white font-bold rounded-lg disabled:opacity-50 whitespace-nowrap"
                      >
                        Verify
                      </button>
                    </div>
                    {tfError && <p className="text-red-400 text-[10px] mt-1 font-medium">{tfError}</p>}
                  </div>
                </div>
              )}

              {formData.two_factor_enabled && twoFactorStep === 'verified' && (
                <div className="mt-4 pt-4 border-t border-primary/20 flex items-center gap-3 text-green-400">
                  <div className="w-5 h-5 rounded-full bg-green-900/40 border border-green-800 flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-tight">2FA Verified & Active</span>
                </div>
              )}
            </div>

            <div className={`bg-dark-900/50 border rounded-lg p-4 transition-colors ${formData.data_sharing_consent ? 'border-primary/40' : 'border-red-900/30'}`}>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={formData.data_sharing_consent}
                  onChange={(e) => updateField('data_sharing_consent', e.target.checked)}
                  className="w-4 h-4 mt-1 rounded border-dark-600 bg-dark-700 text-primary focus:ring-primary"
                  required
                />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-gray-200 group-hover:text-white transition-colors font-medium">Data Sharing Consent *</span>
                    <span className="text-[10px] bg-red-900/30 text-red-400 border border-red-800/50 px-1.5 py-0.5 rounded uppercase font-bold">Required</span>
                  </div>
                  <span className="text-gray-500 text-xs block mt-1">
                    I agree to share anonymized threat intelligence data with the community for better collective defense.
                  </span>
                </div>
              </label>
            </div>
          </div>
        )}

        {step.id === 'location' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Region / State *</label>
                <input 
                  type="text" 
                  className={inputClass} 
                  value={formData.region_state}
                  onChange={(e) => updateField('region_state', e.target.value)}
                  placeholder="e.g. Nairobi County"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>City *</label>
                <input 
                  type="text" 
                  className={inputClass} 
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="e.g. Nairobi"
                  required
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-medium text-gray-400 hover:text-white border border-dark-600 rounded-lg transition-colors flex-1 sm:flex-none"
              >
                Previous
              </button>
            )}
            {!isMandatory && (
              <button
                onClick={handleSkip}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors flex-1 sm:flex-none"
              >
                {currentStep === STEPS.length - 1 ? 'Finish Later' : 'Skip'}
              </button>
            )}
          </div>
          <button
            onClick={handleNext}
            disabled={loading || !isStepValid()}
            className="w-full sm:w-auto px-10 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20"
          >
            {loading ? 'Saving...' : currentStep === STEPS.length - 1 ? 'Complete' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
