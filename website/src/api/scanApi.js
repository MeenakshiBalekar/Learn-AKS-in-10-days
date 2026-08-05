const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export async function runScan(url, deepNetworkScan = false) {
  const res = await fetch(`${API_BASE}/api/scan/headers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, mode: 'Auto', deepNetworkScan }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Scan failed (${res.status})`)
  }
  return res.json()
}

export async function getRemediation(checkName) {
  const res = await fetch(
    `${API_BASE}/api/scan/remediation?checkName=${encodeURIComponent(checkName)}`
  )
  if (!res.ok) return null
  return res.json()
}

export async function getScanHistory() {
  const res = await fetch(`${API_BASE}/api/scan/history`)
  if (!res.ok) return []
  return res.json()
}

export async function getTotalScans() {
  const res = await fetch(`${API_BASE}/api/scan/stats/total-scans`)
  if (!res.ok) return 0
  return res.json()
}
