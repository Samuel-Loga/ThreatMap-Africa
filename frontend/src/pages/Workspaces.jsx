import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { communityApi, indicatorsApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000)
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

function WorkspaceDetail({ ws, onBack, currentUser }) {
  const [members, setMembers] = useState(ws.members || [])
  const [indicators, setIndicators] = useState([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [indicatorSearch, setIndicatorSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [tab, setTab] = useState('indicators')
  const [loading, setLoading] = useState(false)
  const isOwner = ws.owner_id === currentUser?.id

  useEffect(() => { loadIndicators() }, [ws.id])

  async function loadIndicators() {
    const res = await communityApi.listWsIndicators(ws.id)
    setIndicators(res.data)
  }

  async function invite() {
    if (!inviteEmail.trim()) return
    try {
      const res = await communityApi.addMember(ws.id, inviteEmail)
      setMembers(prev => [...prev, res.data])
      setInviteEmail('')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to invite member')
    }
  }

  async function removeMember(userId) {
    await communityApi.removeMember(ws.id, userId)
    setMembers(prev => prev.filter(m => m.user_id !== userId))
  }

  async function searchIndicators(q) {
    setIndicatorSearch(q)
    if (q.length < 2) { setSearchResults([]); return }
    setLoading(true)
    try {
      const res = await indicatorsApi.list({ search: q, limit: 10 })
      setSearchResults(res.data)
    } finally { setLoading(false) }
  }

  async function addIndicator(indicatorId) {
    try {
      await communityApi.addWsIndicator(ws.id, indicatorId)
      setSearchResults([])
      setIndicatorSearch('')
      loadIndicators()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add indicator')
    }
  }

  async function removeIndicator(indicatorId) {
    await communityApi.removeWsIndicator(ws.id, indicatorId)
    loadIndicators()
  }

  const inputClass = "w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-primary"

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-white">← All Workspaces</button>

      <div className="bg-dark-800 border border-amber-800/50 rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] bg-amber-900/40 text-amber-300 border border-amber-800/50 px-2 py-0.5 rounded font-bold">TLP:AMBER</span>
              <span className="text-[10px] text-gray-500">Private Workspace</span>
            </div>
            <h2 className="text-xl font-bold text-white">{ws.name}</h2>
            {ws.description && <p className="text-sm text-gray-400 mt-1">{ws.description}</p>}
          </div>
          <span className="text-xs text-gray-500">{members.length} member{members.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800 border border-dark-600 rounded-lg p-1 w-fit">
        {['indicators', 'members'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>{t}</button>
        ))}
      </div>

      {tab === 'indicators' && (
        <div className="space-y-3">
          {/* Search to add */}
          <div className="relative">
            <input value={indicatorSearch} onChange={e => searchIndicators(e.target.value)} placeholder="Search indicators to add…" className={inputClass} />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 bg-dark-800 border border-dark-600 rounded-lg mt-1 shadow-xl max-h-48 overflow-y-auto">
                {searchResults.map(ind => (
                  <button key={ind.id} onClick={() => addIndicator(ind.id)} className="w-full text-left px-4 py-2 hover:bg-dark-700 flex items-center justify-between gap-3">
                    <span className="text-sm font-mono text-gray-200 truncate">{ind.value}</span>
                    <span className="text-[10px] text-gray-500 flex-shrink-0">{ind.indicator_type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {indicators.length === 0 && <p className="text-gray-500 text-sm italic py-6 text-center">No indicators in this workspace yet.</p>}
          {indicators.map(wi => (
            <div key={wi.id} className="bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
              <Link to={`/indicators/${wi.indicator_id}`} className="text-sm font-mono text-primary hover:underline truncate">{wi.indicator_id}</Link>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] text-gray-500">{timeAgo(wi.added_at)}</span>
                <button onClick={() => removeIndicator(wi.indicator_id)} className="text-[10px] text-red-400 hover:text-red-300">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'members' && (
        <div className="space-y-3">
          {isOwner && (
            <div className="flex gap-2">
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Invite by email address…" className={`${inputClass} flex-1`} onKeyDown={e => e.key === 'Enter' && invite()} />
              <button onClick={invite} disabled={!inviteEmail.trim()} className="px-4 py-2 bg-primary rounded text-white text-sm font-semibold disabled:opacity-50">Invite</button>
            </div>
          )}
          {members.map(m => (
            <div key={m.id} className="bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {m.role === 'owner' ? '👑' : '👤'}
                </div>
                <div>
                  <span className="text-sm text-gray-200">{m.user_id}</span>
                  <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${m.role === 'owner' ? 'bg-primary/20 text-primary' : 'bg-dark-700 text-gray-400'}`}>{m.role}</span>
                </div>
              </div>
              {isOwner && m.role !== 'owner' && (
                <button onClick={() => removeMember(m.user_id)} className="text-[10px] text-red-400 hover:text-red-300">Remove</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Workspaces() {
  const { user } = useAuth()
  const [workspaces, setWorkspaces] = useState([])
  const [selected, setSelected] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { const res = await communityApi.listWorkspaces(); setWorkspaces(res.data) } finally { setLoading(false) }
  }

  async function create() {
    const res = await communityApi.createWorkspace(form)
    setWorkspaces(prev => [res.data, ...prev])
    setForm({ name: '', description: '' })
    setShowCreate(false)
  }

  const inputClass = "w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-primary"

  if (selected) return (
    <div className="max-w-3xl mx-auto">
      <WorkspaceDetail ws={selected} onBack={() => { setSelected(null); load() }} currentUser={user} />
    </div>
  )

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organization Workspaces</h1>
          <p className="text-gray-400 text-sm mt-1">Private collections with TLP:AMBER sharing for org-level collaboration</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-primary rounded text-white text-sm font-semibold hover:bg-primary/90">+ New Workspace</button>
      </div>

      <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg px-4 py-3 flex items-start gap-3">
        <span className="text-amber-400 text-lg flex-shrink-0">⚠️</span>
        <p className="text-sm text-amber-200">Workspaces operate under <span className="font-bold">TLP:AMBER</span> — indicators shared here are restricted to workspace members only and must not be shared publicly.</p>
      </div>

      {showCreate && (
        <div className="bg-dark-800 border border-primary/50 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-300">Create Workspace</h3>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Workspace name" className={inputClass} />
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description (optional)" rows={2} className={`${inputClass} resize-none`} />
          <div className="flex gap-2">
            <button onClick={() => setShowCreate(false)} className="flex-1 py-1.5 text-sm border border-dark-600 rounded text-gray-400 hover:bg-dark-700">Cancel</button>
            <button onClick={create} disabled={!form.name} className="flex-1 py-1.5 text-sm bg-primary rounded text-white disabled:opacity-50">Create</button>
          </div>
        </div>
      )}

      {loading && <p className="text-gray-400 animate-pulse py-8 text-center">Loading workspaces…</p>}

      {!loading && workspaces.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🔒</p>
          <p>No workspaces yet. Create one to start collaborating privately.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workspaces.map(ws => (
          <button key={ws.id} onClick={() => setSelected(ws)} className="text-left bg-dark-800 border border-dark-600 rounded-xl p-5 hover:border-amber-700/50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <span className="text-[10px] bg-amber-900/40 text-amber-300 border border-amber-800/50 px-2 py-0.5 rounded font-bold">TLP:AMBER</span>
              <span className="text-[10px] text-gray-500">{ws.members?.length || 0} members</span>
            </div>
            <h3 className="font-semibold text-white">{ws.name}</h3>
            {ws.description && <p className="text-sm text-gray-400 mt-1 line-clamp-2">{ws.description}</p>}
            <p className="text-[10px] text-gray-500 mt-3">{ws.owner_id === user?.id ? '👑 Owner' : '👤 Member'} · {timeAgo(ws.created_at)}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
