import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { indicatorsApi } from '../api/client'
import FilterPanel from '../components/FilterPanel'
import { 
  Bell, 
  RefreshCw, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Settings2, 
  Monitor, 
  Globe, 
  Link2, 
  Hash, 
  Mail, 
  MoreHorizontal 
} from 'lucide-react'

const TYPE_ICONS = {
  ip: Monitor,
  domain: Globe,
  url: Link2,
  hash_md5: Hash,
  hash_sha256: Hash,
  email: Mail,
}

const TLP_COLORS = {
  WHITE: 'bg-gray-200 text-gray-800',
  GREEN: 'bg-green-700 text-green-100',
  AMBER: 'bg-amber-600 text-amber-100',
  RED: 'bg-red-700 text-red-100',
}

const SEVERITY_COLORS = {
  Info: 'bg-blue-900/40 text-blue-300 border-blue-800',
  Low: 'bg-green-900/40 text-green-300 border-green-800',
  Medium: 'bg-yellow-900/40 text-yellow-300 border-yellow-800',
  High: 'bg-orange-900/40 text-orange-300 border-orange-800',
  Critical: 'bg-red-900/40 text-red-300 border-red-800',
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

function getCountryName(cc) {
  try {
    return regionNames.of(cc)
  } catch {
    return cc
  }
}

function toTitleCase(str) {
  if (!str) return ''
  return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
}

const ALL_COLUMNS = [
  { id: 'type', label: 'Type', default: true },
  { id: 'value', label: 'Value', default: true },
  { id: 'severity', label: 'Severity', default: true },
  { id: 'tlp', label: 'TLP', default: true },
  { id: 'confidence', label: 'Confidence', default: true },
  { id: 'countries', label: 'Countries', default: true },
  { id: 'first_seen', label: 'First Seen', default: true },
  { id: 'sectors', label: 'Sectors', default: false },
  { id: 'attack_categories', label: 'Attack Categories', default: false },
  { id: 'status', label: 'Status', default: false },
  { id: 'description', label: 'Description', default: false },
  { id: 'last_seen', label: 'Last Seen', default: false },
  { id: 'created_at', label: 'Created At', default: false },
]

export default function ThreatFeed() {
  const [indicators, setIndicators] = useState([])
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({})
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [loading, setLoading] = useState(false)
  const [liveNotification, setLiveNotification] = useState(null)
  const [visibleColumns, setVisibleColumns] = useState(ALL_COLUMNS.filter(c => c.default).map(c => c.id))
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  const wsRef = useRef(null)
  const selectorRef = useRef(null)

  const fetchIndicators = useCallback(async (currentFilters, currentSearch, page, limit) => {
    setLoading(true)
    try {
      const offset = (page - 1) * limit
      const params = { limit, offset, ...currentFilters, search: currentSearch }
      Object.keys(params).forEach((k) => !params[k] && delete params[k])
      
      const res = await indicatorsApi.list(params)
      setIndicators(res.data.items)
      setTotal(res.data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [filters, search, pageSize])

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchIndicators(filters, search, currentPage, pageSize)
    }, 300)
    return () => clearTimeout(timeout)
  }, [filters, search, currentPage, pageSize, fetchIndicators])

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws/enrichment`)
    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.event === 'enrichment_complete') {
          setLiveNotification(`Indicator ${data.indicator_id.slice(0, 8)}… enriched`)
          setTimeout(() => setLiveNotification(null), 4000)
          setIndicators((prev) =>
            prev.map((ind) =>
              ind.id === data.indicator_id
                ? { ...ind, status: 'enriched', enrichment_data: data.enrichment_data }
                : ind
            )
          )
        }
      } catch (err) {
        console.error('WebSocket message parse error:', err)
      }
    }

    return () => ws.close()
  }, [])

  // Close column selector when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setShowColumnSelector(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleColumn = (columnId) => {
    setVisibleColumns(prev => 
      prev.includes(columnId) 
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    )
  }

  const totalPages = Math.ceil(total / pageSize)
  
  const renderPaginationLinks = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - 2)
    let end = Math.min(totalPages, start + maxVisible - 1)
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-md text-sm transition-colors ${
            currentPage === i 
              ? 'bg-primary text-white' 
              : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
          }`}
        >
          {i}
        </button>
      )
    }
    return pages
  }

  const renderCell = (indicator, columnId) => {
    switch (columnId) {
      case 'type':
        const Icon = TYPE_ICONS[indicator.indicator_type] || Monitor
        return (
          <div className="flex items-center gap-2">
            <Icon size={16} className="text-primary" />
            <span className="text-xs uppercase">{indicator.indicator_type}</span>
          </div>
        )
      case 'value':
        return (
          <Link to={`/indicators/${indicator.id}`} className="text-primary hover:underline font-mono text-xs truncate max-w-[200px] block">
            {indicator.value}
          </Link>
        )
      case 'severity':
        return (
          <span className={`text-xs px-1.5 py-0.5 rounded border ${SEVERITY_COLORS[indicator.severity] || 'border-dark-600'}`}>
            {indicator.severity}
          </span>
        )
      case 'tlp':
        return (
          <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${TLP_COLORS[indicator.tlp] || 'bg-dark-600'}`}>
            {indicator.tlp}
          </span>
        )
      case 'confidence':
        return (
          <div className="flex items-center gap-2 w-24">
            <div className="flex-1 bg-dark-600 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${indicator.confidence >= 70 ? 'bg-red-500' : indicator.confidence >= 40 ? 'bg-amber-500' : 'bg-green-500'}`} 
                style={{ width: `${indicator.confidence}%` }} 
              />
            </div>
            <span className="text-xs text-gray-400">{indicator.confidence}%</span>
          </div>
        )
      case 'countries':
        return (
          <div className="flex flex-wrap gap-1 max-w-[150px]">
            {indicator.country_codes.map(cc => (
              <span key={cc} title={getCountryName(cc)} className="text-xs bg-blue-900/30 text-blue-300 border border-blue-800/50 px-1 py-0 rounded">
                {cc}
              </span>
            ))}
          </div>
        )
      case 'first_seen':
        return <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(indicator.first_seen).toLocaleDateString()}</span>
      case 'last_seen':
        return <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(indicator.last_seen).toLocaleDateString()}</span>
      case 'created_at':
        return <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(indicator.created_at).toLocaleString()}</span>
      case 'status':
        return (
          <span className={`text-xs px-1.5 py-0.5 rounded ${indicator.status === 'enriched' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
            {toTitleCase(indicator.status)}
          </span>
        )
      case 'sectors':
        return (
          <div className="flex flex-wrap gap-1">
            {indicator.sectors.map(s => (
              <span key={s} className="text-xs bg-purple-900/30 text-purple-300 border border-purple-800/50 px-1 py-0 rounded">
                {s}
              </span>
            ))}
          </div>
        )
      case 'attack_categories':
        return (
          <div className="flex flex-wrap gap-1">
            {indicator.attack_categories.map(a => (
              <span key={a} className="text-xs bg-emerald-900/30 text-emerald-300 border border-emerald-800/50 px-1 py-0 rounded">
                {a}
              </span>
            ))}
          </div>
        )
      case 'description':
        return <p className="text-xs text-gray-400 italic line-clamp-1 max-w-[200px]" title={indicator.description}>{indicator.description}</p>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Threat Feed
            {loading && <RefreshCw size={20} className="animate-spin text-primary" />}
          </h1>
          <p className="text-gray-400 mt-1">Live African threat indicators ({total} total)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search indicators..."
              className="bg-dark-800 border border-dark-600 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-primary w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {liveNotification && (
            <div className="bg-green-900/30 border border-green-700 text-green-300 text-sm px-4 py-2 rounded flex items-center gap-2 animate-pulse whitespace-nowrap">
              <Bell size={16} />
              {liveNotification}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-60 flex-shrink-0">
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-center justify-between bg-dark-800 p-3 rounded-lg border border-dark-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Rows per page:</span>
                <select 
                  value={pageSize} 
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-dark-700 border border-dark-600 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-primary"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="relative" ref={selectorRef}>
              <button 
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-md text-xs text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
              >
                <Settings2 size={14} />
                Columns
              </button>
              
              {showColumnSelector && (
                <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-50 p-2 space-y-1">
                  <p className="text-xs text-gray-500 px-2 py-1 font-bold uppercase tracking-wider">Display Columns</p>
                  <div className="max-h-64 overflow-y-auto">
                    {ALL_COLUMNS.map(col => (
                      <label key={col.id} className="flex items-center gap-3 px-2 py-1.5 hover:bg-dark-700 rounded cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={visibleColumns.includes(col.id)}
                          onChange={() => toggleColumn(col.id)}
                          className="rounded border-dark-600 text-primary focus:ring-primary bg-dark-900"
                        />
                        <span className="text-xs text-gray-300 group-hover:text-white">{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-dark-800 border border-dark-600 rounded-lg overflow-hidden flex flex-col">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-dark-700/50 border-b border-dark-600">
                    {ALL_COLUMNS.filter(c => visibleColumns.includes(c.id)).map(col => (
                      <th key={col.id} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {col.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-600/50">
                  {indicators.length === 0 && !loading && (
                    <tr>
                      <td colSpan={visibleColumns.length + 1} className="px-4 py-12 text-center text-gray-500 italic">
                        No indicators found matching your criteria.
                      </td>
                    </tr>
                  )}
                  {indicators.map((ind) => (
                    <tr key={ind.id} className="hover:bg-dark-700/30 transition-colors">
                      {ALL_COLUMNS.filter(c => visibleColumns.includes(c.id)).map(col => (
                        <td key={col.id} className="px-4 py-3 align-middle">
                          {renderCell(ind, col.id)}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right align-middle">
                        <Link 
                          to={`/indicators/${ind.id}`}
                          className="p-1.5 hover:bg-dark-600 rounded-lg text-gray-500 hover:text-white transition-colors inline-block"
                        >
                          <MoreHorizontal size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {loading && (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <RefreshCw size={24} className="animate-spin text-primary" />
                <span className="text-sm text-gray-500">Fetching indicators...</span>
              </div>
            )}

            {/* Pagination footer */}
            <div className="p-4 border-t border-dark-600 flex flex-col sm:flex-row items-center justify-between gap-4 bg-dark-800/50">
              <div className="text-xs text-gray-400">
                Showing <span className="text-gray-200">{(currentPage - 1) * pageSize + 1}</span> to <span className="text-gray-200">{Math.min(currentPage * pageSize, total)}</span> of <span className="text-gray-200">{total}</span> indicators
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                  className="p-2 bg-dark-700 border border-dark-600 rounded-md text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="flex items-center gap-1 mx-2">
                  {renderPaginationLinks()}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || loading}
                  className="p-2 bg-dark-700 border border-dark-600 rounded-md text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
