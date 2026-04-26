import { useState, useEffect, useRef, useCallback } from 'react'
import { indicatorsApi } from '../api/client'
import ThreatCard from '../components/ThreatCard'
import FilterPanel from '../components/FilterPanel'
import { Bell, RefreshCw, Search } from 'lucide-react'

const PAGE_SIZE = 20

export default function ThreatFeed() {
  const [indicators, setIndicators] = useState([])
  const [filters, setFilters] = useState({})
  const [search, setSearch] = useState('')
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [liveNotification, setLiveNotification] = useState(null)
  const wsRef = useRef(null)

  const fetchIndicators = useCallback(async (currentFilters, currentSearch, newOffset) => {
    setLoading(true)
    try {
      const params = { limit: PAGE_SIZE, offset: newOffset, ...currentFilters, search: currentSearch }
      Object.keys(params).forEach((k) => !params[k] && delete params[k])
      const res = await indicatorsApi.list(params)
      const data = res.data
      if (newOffset === 0) {
        setIndicators(data)
      } else {
        setIndicators((prev) => [...prev, ...data])
      }
      setHasMore(data.length === PAGE_SIZE)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setOffset(0)
    const timeout = setTimeout(() => {
      fetchIndicators(filters, search, 0)
    }, 300)
    return () => clearTimeout(timeout)
  }, [filters, search, fetchIndicators])

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

  const loadMore = () => {
    const newOffset = offset + PAGE_SIZE
    setOffset(newOffset)
    fetchIndicators(filters, search, newOffset)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Threat Feed
            {loading && <RefreshCw size={20} className="animate-spin text-primary" />}
          </h1>
          <p className="text-gray-400 mt-1">Live African threat indicators</p>
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

        <div className="flex-1 space-y-3">
          {indicators.length === 0 && !loading && (
            <div className="text-center text-gray-400 py-16">
              No indicators found. Try adjusting your filters.
            </div>
          )}
          {indicators.map((ind) => (
            <ThreatCard key={ind.id} indicator={ind} />
          ))}
          {loading && (
            <div className="text-center text-gray-400 py-8 animate-pulse">Loading…</div>
          )}
          {!loading && hasMore && indicators.length > 0 && (
            <button
              onClick={loadMore}
              className="w-full py-3 text-sm text-gray-400 hover:text-white border border-dark-600 hover:border-gray-500 rounded-lg transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
