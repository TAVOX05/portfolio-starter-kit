// Baja el pronóstico por hora de Open-Meteo para las ciudades del viaje y arma el
// documento weather/now que lee la app. Lo usa la tarea programada del viaje.
//   node japon/clima.js salida.json   (descarga con curl, que usa el proxy del entorno)
const CITIES = { TK: [35.712, 139.794], FJ: [35.497, 138.756], KY: [34.998, 135.778], OS: [34.669, 135.501], KB: [34.69, 135.196], KZ: [36.561, 136.656], HD: [36.146, 137.252] }
const keys = Object.keys(CITIES)
const url = 'https://api.open-meteo.com/v1/forecast?' + new URLSearchParams({
  latitude: keys.map((k) => CITIES[k][0]).join(','),
  longitude: keys.map((k) => CITIES[k][1]).join(','),
  hourly: 'temperature_2m,weather_code,precipitation_probability',
  daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
  timezone: 'Asia/Tokyo',
  forecast_days: '10',
})

const round = (v) => (v == null ? null : Math.round(v))

function toDoc(json, now = new Date()) {
  const locs = Array.isArray(json) ? json : [json]
  if (locs.length !== keys.length) throw new Error(`se esperaban ${keys.length} ciudades y llegaron ${locs.length}`)
  const doc = { updatedAt: now.toISOString(), source: 'open-meteo.com', start: locs[0].hourly.time[0], cities: {} }
  locs.forEach((loc, i) => {
    const h = loc.hourly, d = loc.daily
    if (h.time[0] !== doc.start) throw new Error('las ciudades no empiezan a la misma hora')
    doc.cities[keys[i]] = {
      t: h.temperature_2m.map(round),
      c: h.weather_code.map((v) => v ?? 0),
      p: h.precipitation_probability.map((v) => v ?? 0),
      d: d.time
        .map((date, k) => ({ date, hi: round(d.temperature_2m_max[k]), lo: round(d.temperature_2m_min[k]), c: d.weather_code[k] ?? 0, p: d.precipitation_probability_max[k] ?? 0 }))
        .filter((x) => x.hi != null && x.lo != null),
    }
  })
  return doc
}

if (require.main === module) {
  try {
    const body = require('child_process').execFileSync('curl', ['-sS', '--fail-with-body', '-m', '40', url], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    const doc = toDoc(JSON.parse(body))
    require('fs').writeFileSync(process.argv[2] || 'weather-now.json', JSON.stringify(doc))
    console.log(`ok: ${keys.length} ciudades, ${doc.cities.TK.t.length} horas desde ${doc.start}`)
  } catch (e) {
    console.error('ERROR', String(e.stderr || e.message).trim().slice(0, 300))
    process.exit(1)
  }
}

module.exports = { toDoc, url, CITIES }
