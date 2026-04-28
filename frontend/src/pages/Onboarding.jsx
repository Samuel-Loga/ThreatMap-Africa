import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

const STEPS = [
  { id: 'org', title: 'Organization', description: 'Institutional context', required: true },
  { id: 'role', title: 'Role & Expertise', description: 'Your role & areas of interest', required: true },
  { id: 'notifs', title: 'Notifications', description: 'Alert preferences (Optional)', required: false },
  { id: 'identity', title: 'Identity', description: 'Profile name (Optional)', required: false },
  { id: 'security', title: 'Security', description: 'Account safety (Recommended)', required: false },
  { id: 'location', title: 'Location', description: 'Regional context (Optional)', required: false },
]

export default function Onboarding() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [stepErrors, setStepErrors] = useState({})
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

  const validateStep = (stepId) => {
    const errors = {}
    if (stepId === 'org') {
      if (!formData.organization.trim()) errors.organization = 'Organization name is required.'
      if (!formData.org_type) errors.org_type = 'Organization type is required.'
    }
    if (stepId === 'role') {
      if (!formData.experience_level) errors.experience_level = 'Please select your primary role.'
      if (formData.interests.length === 0) errors.interests = 'Please select at least one area of interest.'
    }
    return errors
  }

  const handleNext = async () => {
    const errors = validateStep(step.id)
    if (Object.keys(errors).length > 0) {
      setStepErrors(errors)
      return
    }
    setStepErrors({})
    setLoading(true)
    try {
      // Save progress
      const isLastStep = currentStep === STEPS.length - 1
      
      // Ensure we only send fields that are in the UserUpdate schema
      const updateData = {
        organization: formData.organization,
        org_type: formData.org_type,
        department: formData.department,
        experience_level: formData.experience_level,
        interests: formData.interests,
        phone_number: formData.phone_number,
        email_notif: formData.email_notif,
        sms_notif: formData.sms_notif,
        push_notif: formData.push_notif,
        update_frequency: formData.update_frequency,
        full_name: formData.full_name,
        pgp_key: formData.pgp_key,
        two_factor_enabled: formData.two_factor_enabled,
        region_state: formData.region_state,
        city: formData.city,
        data_sharing_consent: formData.data_sharing_consent,
      }

      if (isLastStep) {
        updateData.onboarding_completed = true
      }
      
      const res = await authApi.updateMe(updateData)
      // Update local user context if needed (mostly for onboarding_completed flag)
      if (isLastStep) {
        const updatedUser = { ...user, onboarding_completed: true }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        navigate('/dashboard')
      } else {
        // Update user context with latest profile data from server
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
    if (step.required) return // cannot skip mandatory steps
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleNext() // Complete on last step skip
    }
  }

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (stepErrors[field]) {
      setStepErrors(prev => { const e = { ...prev }; delete e[field]; return e })
    }
  }

  const toggleInterest = (interest) => {
    setFormData(prev => {
      const next = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
      if (next.length > 0 && stepErrors.interests) {
        setStepErrors(e => { const n = { ...e }; delete n.interests; return n })
      }
      return { ...prev, interests: next }
    })
  }

  const step = STEPS[currentStep]

  const inputClass = "w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-primary transition-colors"
  const labelClass = "block text-sm font-medium text-gray-400 mb-1.5"

  return (
    <div className="max-w-2xl mx-auto py-12">
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

      <div className="bg-dark-800 border border-dark-600 rounded-xl p-8 shadow-xl">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {step.title}
            {step.required && (
              <span className="text-xs font-medium bg-primary/10 text-primary border border-primary/30 rounded px-2 py-0.5">Required</span>
            )}
          </h2>
          <p className="text-gray-400 text-sm">{step.description}</p>
        </div>

        {step.id === 'org' && (
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Organization Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className={`${inputClass} ${stepErrors.organization ? 'border-red-500' : ''}`}
                value={formData.organization}
                onChange={(e) => updateField('organization', e.target.value)}
                placeholder="e.g. National Cyber Security Centre"
              />
              {stepErrors.organization && <p className="text-red-400 text-xs mt-1">{stepErrors.organization}</p>}
            </div>
            <div>
              <label className={labelClass}>Organization Type <span className="text-red-500">*</span></label>
              <select 
                className={`${inputClass} ${stepErrors.org_type ? 'border-red-500' : ''}`}
                value={formData.org_type}
                onChange={(e) => updateField('org_type', e.target.value)}
              >
                <option value="">Select type...</option>
                <option value="Government">Government</option>
                <option value="Private Sector">Private Sector</option>
                <option value="ISP">ISP / Telco</option>
                <option value="University">University / Research</option>
                <option value="NGO">NGO</option>
                <option value="Other">Other</option>
              </select>
              {stepErrors.org_type && <p className="text-red-400 text-xs mt-1">{stepErrors.org_type}</p>}
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <input 
                type="text" 
                className={inputClass} 
                value={formData.department}
                onChange={(e) => updateField('department', e.target.value)}
                placeholder="e.g. SOC, Threat Intel Team"
              />
            </div>
          </div>
        )}

        {step.id === 'role' && (
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Primary Role <span className="text-red-500">*</span></label>
              <select 
                className={`${inputClass} ${stepErrors.experience_level ? 'border-red-500' : ''}`}
                value={formData.experience_level}
                onChange={(e) => updateField('experience_level', e.target.value)}
              >
                <option value="">Select role...</option>
                <option value="Analyst">Security Analyst</option>
                <option value="Engineer">Security Engineer</option>
                <option value="Researcher">Researcher</option>
                <option value="Student">Student</option>
                <option value="Manager">Manager / CISO</option>
                <option value="Other">Other</option>
              </select>
              {stepErrors.experience_level && <p className="text-red-400 text-xs mt-1">{stepErrors.experience_level}</p>}
            </div>
            <div>
              <label className={labelClass}>Areas of Interest <span className="text-red-500">*</span> <span className="text-gray-500 font-normal">(select at least one)</span></label>
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
              {stepErrors.interests && <p className="text-red-400 text-xs mt-2">{stepErrors.interests}</p>}
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
                <input 
                  type="tel" 
                  className={inputClass} 
                  value={formData.phone_number}
                  onChange={(e) => updateField('phone_number', e.target.value)}
                  placeholder="+254 700 000000"
                />
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
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
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
            </div>
            <div className="bg-dark-900/50 border border-dark-700 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={formData.data_sharing_consent}
                  onChange={(e) => updateField('data_sharing_consent', e.target.checked)}
                  className="w-4 h-4 mt-1 rounded border-dark-600 bg-dark-700 text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-gray-200 group-hover:text-white transition-colors font-medium">Data Sharing Consent</span>
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
                <label className={labelClass}>Region / State</label>
                <input 
                  type="text" 
                  className={inputClass} 
                  value={formData.region_state}
                  onChange={(e) => updateField('region_state', e.target.value)}
                  placeholder="e.g. Nairobi County"
                />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input 
                  type="text" 
                  className={inputClass} 
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="e.g. Nairobi"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 flex items-center justify-between gap-4">
          {step.required ? (
            <span className="text-xs text-gray-600 italic">All fields marked <span className="text-red-500">*</span> are required</span>
          ) : (
            <button
              onClick={handleSkip}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors"
            >
              {currentStep === STEPS.length - 1 ? 'Finish Later' : 'Skip Step'}
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={loading}
            className="px-8 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20"
          >
            {loading ? 'Saving...' : currentStep === STEPS.length - 1 ? 'Complete Onboarding' : 'Save & Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
