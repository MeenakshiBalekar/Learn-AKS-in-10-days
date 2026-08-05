import React, { useState, useRef } from 'react'
import { Globe, Zap, AlertCircle } from 'lucide-react'
import { runScan } from '../api/scanApi'
import ScanResults from './ScanResults'

const SCAN_STEPS = [
  { at: 0,  msg: 'Connecting to target...',               color: 'text-green-400' },
  { at: 15, msg: 'Fetching HTTP headers...',              color: 'text-green-400' },
  { at: 30, msg: 'Running OWASP checks...',               color: 'text-yellow-400' },
  { at: 45, msg: 'Checking HTTP methods (TRACE/DAV)...',  color: 'text-orange-400' },
  { at: 55, msg: 'Scanning sensitive files...',           color: 'text-orange-400' },
  { at: 65, msg: 'Mapping OWASP categories...',           color: 'text-red-400' },
  { at: 78, msg: 'Calculating security score...',         color: 'text-blue-400' },
  { at: 88, msg: 'Generating report...',                  color: 'text-blue-400' },
]

export default function Scanner() {
  const [url, setUrl]           = useState('')
  const [deepScan, setDeepScan] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults]   = useState(null)
  const [error, setError]       = useState(null)
  const resultsRef              = useRef(null)

  const activeSteps = SCAN_STEPS.filter(s => s.at <= progress)

  const handleScan = async (e) => {
    e.preventDefault()
    if (!url || loading) return

    setLoading(true)
    setError(null)
    setResults(null)
    setProgress(0)

    // Animate progress while the real API call runs
    let current = 0
    const tick = setInterval(() => {
      current = Math.min(current + Math.random() * 8, 88)
      setProgress(Math.round(current))
    }, 600)

    try {
      const data = await runScan(url, deepScan)
      clearInterval(tick)
      setProgress(100)
      await new Promise(r => setTimeout(r, 400))
      setResults(data)
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    } catch (err) {
      clearInterval(tick)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="scanner" className="py-20 md:py-28 bg-navy-950 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="section-tag text-crimson-400">Live Scanner</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Scan Your Website Right Now
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Enter any URL to check for OWASP Top 10 vulnerabilities, header misconfigurations,
            dangerous HTTP methods, and more — powered by real scanning logic.
          </p>
        </div>

        {/* Scan Form */}
        <form onSubmit={handleScan} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                disabled={loading}
                className="w-full bg-white/5 border border-white/15 text-white placeholder-gray-600
                           pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-crimson-500
                           transition-all text-sm disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url}
              className="flex items-center justify-center gap-2 bg-crimson-500 hover:bg-crimson-600
                         disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold
                         px-8 py-4 rounded-xl transition-all text-sm shrink-0"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Scan Now
                </>
              )}
            </button>
          </div>

          <label className="flex items-center gap-2 w-fit cursor-pointer text-sm text-gray-500 hover:text-gray-300 transition-colors select-none">
            <input
              type="checkbox"
              checked={deepScan}
              onChange={e => setDeepScan(e.target.checked)}
              className="w-4 h-4 accent-crimson-500"
            />
            Deep Network Scan — includes port scanning (slower)
          </label>
        </form>

        {/* Loading */}
        {loading && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span className="animate-pulse">
                {activeSteps[activeSteps.length - 1]?.msg ?? 'Initialising...'}
              </span>
              <span className="text-white font-bold tabular-nums">{progress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-gradient-to-r from-crimson-500 via-orange-500 to-yellow-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="font-mono text-xs space-y-1.5">
              {activeSteps.map((s, i) => (
                <div key={i} className={`flex items-center gap-2 ${s.color}`}>
                  <span>►</span>
                  <span>{s.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold text-sm">Scan Failed</p>
              <p className="text-red-300/70 text-sm mt-1">{error}</p>
              <p className="text-gray-500 text-xs mt-2">
                Make sure your backend is running at{' '}
                <code className="text-gray-400">{import.meta.env.VITE_API_URL || 'http://localhost:5000'}</code>
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div ref={resultsRef}>
            <ScanResults data={results} onRescan={() => { setResults(null); window.scrollTo({ top: document.getElementById('scanner').offsetTop, behavior: 'smooth' }) }} />
          </div>
        )}
      </div>
    </section>
  )
}
