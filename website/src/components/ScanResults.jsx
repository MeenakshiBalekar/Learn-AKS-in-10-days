import React, { useState } from 'react'
import {
  Shield, Server, Wifi, AlertTriangle, ChevronDown, ChevronUp,
  Activity, RotateCcw, CheckCircle2, XCircle, Info,
} from 'lucide-react'

// ─── Config maps ──────────────────────────────────────────────────────────────

const SEV = {
  Critical: { ring: '#ef4444', badge: 'bg-red-500/15 text-red-400 border-red-500/30',    dot: 'bg-red-500',    row: 'border-red-500/20 bg-red-500/5'    },
  High:     { ring: '#f97316', badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30', dot: 'bg-orange-500', row: 'border-orange-500/20 bg-orange-500/5' },
  Medium:   { ring: '#eab308', badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400', row: 'border-yellow-500/20 bg-yellow-500/5' },
  Low:      { ring: '#3b82f6', badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',   dot: 'bg-blue-400',   row: 'border-blue-500/20 bg-blue-500/5'   },
  Info:     { ring: '#6b7280', badge: 'bg-gray-500/15 text-gray-400 border-gray-500/30',   dot: 'bg-gray-500',   row: 'border-gray-500/20 bg-gray-500/5'   },
}

const GRADE = {
  'A+': 'text-green-400 bg-green-400/15',
  'A':  'text-green-400 bg-green-400/15',
  'B':  'text-blue-400  bg-blue-400/15',
  'C':  'text-yellow-400 bg-yellow-400/15',
  'D':  'text-orange-400 bg-orange-400/15',
  'F':  'text-red-400   bg-red-400/15',
}

const SEV_ORDER = ['Critical', 'High', 'Medium', 'Low', 'Info']

// ─── Score Gauge ──────────────────────────────────────────────────────────────

function ScoreGauge({ score }) {
  const r    = 52
  const circ = 2 * Math.PI * r
  const off  = circ - (score / 100) * circ
  const col  = score >= 80 ? '#22c55e' : score >= 60 ? '#3b82f6' : score >= 40 ? '#eab308' : '#ef4444'
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="136" height="136" className="-rotate-90">
        <circle cx="68" cy="68" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
        <circle
          cx="68" cy="68" r={r} fill="none"
          stroke={col} strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.4s ease' }}
        />
      </svg>
      <div className="absolute text-center pointer-events-none">
        <div className="text-3xl font-extrabold text-white leading-none">{score}</div>
        <div className="text-[10px] text-gray-500 mt-0.5">/ 100</div>
      </div>
    </div>
  )
}

// ─── Single Finding Row ───────────────────────────────────────────────────────

function FindingRow({ result }) {
  const [open, setOpen] = useState(false)
  const cfg = SEV[result.severity] || SEV.Info

  return (
    <div className={`border ${cfg.row} rounded-xl overflow-hidden`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
        <span className="flex-1 min-w-0">
          <span className="text-white text-sm font-medium">{result.checkName}</span>
          {result.owaspCategory && (
            <span className="text-gray-600 text-xs ml-2 hidden sm:inline">{result.owaspCategory}</span>
          )}
        </span>
        <span className={`text-[11px] font-bold border px-2 py-0.5 rounded-full shrink-0 ${cfg.badge}`}>
          {result.severity}
        </span>
        <span className="text-gray-600 text-xs shrink-0 hidden sm:block">Risk {result.riskScore}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-600 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-600 shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-3">
          {result.recommendation && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Fix</p>
              <p className="text-sm text-gray-300 leading-relaxed">{result.recommendation}</p>
            </div>
          )}
          {result.evidence && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Evidence</p>
              <code className="block text-xs text-yellow-300/80 bg-black/30 rounded-lg px-3 py-2 break-all">
                {result.evidence}
              </code>
            </div>
          )}
          {result.technicalDetails && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Technical</p>
              <p className="text-sm text-gray-400 leading-relaxed">{result.technicalDetails}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 text-[11px] text-gray-600 pt-1">
            {result.category && <span>Category: <span className="text-gray-400">{result.category}</span></span>}
            {result.complianceReference && <span>Compliance: <span className="text-gray-400">{result.complianceReference}</span></span>}
            {result.scope && <span>Scope: <span className="text-gray-400">{result.scope}</span></span>}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main ScanResults ─────────────────────────────────────────────────────────

export default function ScanResults({ data, onRescan }) {
  const [filter, setFilter] = useState('Failed')

  const sorted = [...(data.results ?? [])].sort(
    (a, b) => SEV_ORDER.indexOf(a.severity) - SEV_ORDER.indexOf(b.severity)
  )

  const filtered =
    filter === 'All'    ? sorted :
    filter === 'Passed' ? sorted.filter(r => r.status === 'Passed') :
    filter === 'Failed' ? sorted.filter(r => r.status === 'Failed') :
    sorted.filter(r => r.severity === filter)

  const critCount = sorted.filter(r => r.severity === 'Critical').length
  const highCount = sorted.filter(r => r.severity === 'High').length
  const gradeClass = GRADE[data.securityGrade] ?? GRADE['F']

  // OWASP groups from failed results
  const owaspGroups = sorted
    .filter(r => r.status === 'Failed')
    .reduce((acc, r) => {
      const cat = r.owaspCategory || 'Other'
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {})

  return (
    <div className="space-y-5 mt-6">

      {/* ── Top bar: score + grade + stats ── */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center">

          {/* Score gauge */}
          <div className="text-center shrink-0">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Security Score</p>
            <ScoreGauge score={data.securityScore} />
          </div>

          <div className="flex-1 w-full space-y-4">
            {/* Grade + URL */}
            <div className="flex items-start gap-4 flex-wrap">
              <span className={`text-4xl font-extrabold w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${gradeClass}`}>
                {data.securityGrade}
              </span>
              <div className="min-w-0">
                <p className="text-white font-bold text-base truncate">{data.targetUrl}</p>
                <p className="text-gray-500 text-sm">
                  {data.hostingPlatform !== 'Unknown' ? `Hosted on ${data.hostingPlatform}` : 'Security scan complete'}
                  {data.rawServerHeader && data.rawServerHeader !== 'Unknown' && (
                    <> &mdash; <span className="font-mono text-gray-400">{data.rawServerHeader}</span></>
                  )}
                </p>
                {data.alertTriggered && (
                  <span className="inline-flex items-center gap-1.5 mt-1.5 text-[11px] font-bold
                                   text-red-400 bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3" /> Critical alert — email sent
                  </span>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Checks', val: data.totalChecks,   color: 'text-white'        },
                { label: 'Passed',       val: data.passedChecks,   color: 'text-green-400'    },
                { label: 'Failed',       val: data.failedChecks,   color: 'text-red-400'      },
                { label: 'HTTP Status',  val: data.httpStatus,     color: 'text-blue-400'     },
              ].map(s => (
                <div key={s.label} className="bg-black/20 rounded-xl p-3 text-center">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
                  <div className="text-[11px] text-gray-600 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onRescan}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> New Scan
          </button>
        </div>
      </div>

      {/* ── Server info ── */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Server className="w-3.5 h-3.5" /> Server Information
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {[
            { label: 'Platform',      val: data.hostingPlatform },
            { label: 'Server Header', val: data.rawServerHeader },
            { label: 'Edge / CDN',    val: data.edgePlatform    },
            { label: 'Scan Mode',     val: data.scanMode        },
          ].map(item => (
            <div key={item.label}>
              <p className="text-[11px] text-gray-600 mb-0.5">{item.label}</p>
              <p className="text-white font-mono truncate">{item.val || '—'}</p>
            </div>
          ))}
        </div>
        {data.connection && (
          <div className="mt-4 pt-4 border-t border-white/10 grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { label: 'Remote IP', val: data.connection.remoteAddress },
              { label: 'Hostname',  val: data.connection.host          },
              { label: 'DNS',       val: data.connection.dnsAddresses?.join(', ') },
            ].map(item => (
              <div key={item.label}>
                <p className="text-[11px] text-gray-600 mb-0.5">{item.label}</p>
                <p className="text-white font-mono truncate text-xs">{item.val || '—'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Open Ports ── */}
      {data.openPorts?.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5" /> Open Ports ({data.openPorts.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {data.openPorts.map((p, i) => (
              <span key={i}
                className="text-xs font-mono bg-orange-500/10 border border-orange-500/30 text-orange-400 px-3 py-1 rounded-full">
                {typeof p === 'object' ? `${p.port}${p.service ? ` (${p.service})` : ''}` : p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── OWASP Heatmap ── */}
      {Object.keys(owaspGroups).length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" /> OWASP Category Breakdown
          </p>
          <div className="space-y-2">
            {Object.entries(owaspGroups)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => {
                const max = Math.max(...Object.values(owaspGroups))
                const pct = Math.round((count / max) * 100)
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{cat}</span>
                      <span className="text-red-400 font-bold">{count} issue{count > 1 ? 's' : ''}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-crimson-500 to-orange-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* ── Findings ── */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            Findings ({sorted.length})
            {critCount > 0 && <span className="text-red-400 normal-case font-bold">{critCount} Critical</span>}
            {highCount > 0 && <span className="text-orange-400 normal-case font-bold">{highCount} High</span>}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {['Failed', 'All', 'Critical', 'High', 'Medium', 'Low', 'Passed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[11px] px-3 py-1 rounded-full transition-all font-medium ${
                  filter === f
                    ? 'bg-crimson-500 text-white'
                    : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-600 text-sm flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-green-500/40" />
              No findings match this filter
            </div>
          ) : (
            filtered.map((r, i) => <FindingRow key={i} result={r} />)
          )}
        </div>
      </div>

      {/* ── AI Summary ── */}
      {data.aiSummary && (
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-5">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" /> AI Security Summary
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">{data.aiSummary}</p>
        </div>
      )}

      {/* ── Redirects ── */}
      {data.redirects?.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Info className="w-3.5 h-3.5" /> Redirect Chain ({data.redirects.length})
          </p>
          <div className="space-y-1 font-mono text-xs text-gray-400">
            {data.redirects.map((hop, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-yellow-500">[{hop.statusCode}]</span>
                <span className="truncate">{hop.fromUrl}</span>
                <span className="text-gray-600">→</span>
                <span className="truncate text-blue-400">{hop.toUrl}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
