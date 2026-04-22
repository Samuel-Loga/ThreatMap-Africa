import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'

const COUNTRY_COORDS = {
  NG: [9.082, 8.6753], KE: [-0.0236, 37.9062], ZA: [-30.5595, 22.9375],
  GH: [7.9465, -1.0232], ET: [9.145, 40.4897], TZ: [-6.369, 34.8888],
  EG: [26.8206, 30.8025], MA: [31.7917, -7.0926], SN: [14.4974, -14.4524],
  RW: [-1.9403, 29.8739], CM: [3.848, 11.5021], UG: [1.3733, 32.2903],
  ZM: [-13.1339, 27.8493], CI: [7.54, -5.5471], DZ: [28.0339, 1.6596],
  AO: [-11.2027, 17.8739], BF: [12.3641, -1.5196], BI: [-3.3731, 29.9189],
  BJ: [9.3077, 2.3158], BW: [-22.3285, 24.6849], CD: [-4.0383, 21.7587],
  CF: [6.6111, 20.9394], CG: [-0.228, 15.8277], CV: [16.5388, -23.0418],
  DJ: [11.8251, 42.5903], ER: [15.1794, 39.7823], GA: [-0.8037, 11.6094],
  GM: [13.4432, -15.3101], GN: [9.9456, -11.3247], GQ: [1.6508, 10.2679],
  GW: [11.8037, -15.1804], KM: [-11.6455, 43.3333], LR: [6.4281, -9.4295],
  LS: [-29.61, 28.2336], LY: [26.3351, 17.2283], MG: [-18.7669, 46.8691],
  ML: [17.5707, -3.9962], MR: [21.0079, -10.9408], MU: [-20.348, 57.5522],
  MW: [-13.2543, 34.3015], MZ: [-18.6657, 35.5296], NA: [-22.9576, 18.4904],
  NE: [17.6078, 8.0817], SC: [-4.6796, 55.492], SD: [12.8628, 30.2176],
  SL: [8.4606, -11.7799], SO: [5.1521, 46.1996], SS: [6.877, 31.307],
  ST: [0.1864, 6.6131], SZ: [-26.5225, 31.4659], TD: [15.4542, 18.7322],
  TG: [8.6195, 0.8248], TN: [33.8869, 9.5375], ZW: [-19.0154, 29.1549],
}

export default function AfricaMap({ indicators = [] }) {
  const countryCounts = {}
  indicators.forEach((ind) => {
    (ind.country_codes || []).forEach((cc) => {
      countryCounts[cc] = (countryCounts[cc] || 0) + 1
    })
  })

  const maxCount = Math.max(...Object.values(countryCounts), 1)

  return (
    <MapContainer
      center={[2, 20]}
      zoom={3}
      style={{ height: '400px', width: '100%', borderRadius: '8px' }}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      {Object.entries(COUNTRY_COORDS).map(([cc, coords]) => {
        const count = countryCounts[cc] || 0
        if (!count) return null
        const ratio = count / maxCount
        const radius = 6 + ratio * 24
        const color = ratio > 0.66 ? '#ef4444' : ratio > 0.33 ? '#f97316' : '#10b981'
        return (
          <CircleMarker
            key={cc}
            center={coords}
            radius={radius}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.6, weight: 1 }}
          >
            <Tooltip>
              <strong>{cc}</strong>: {count} indicator{count !== 1 ? 's' : ''}
            </Tooltip>
          </CircleMarker>
        )
      })}
      {Object.entries(COUNTRY_COORDS).map(([cc, coords]) => {
        if (countryCounts[cc]) return null
        return (
          <CircleMarker
            key={cc}
            center={coords}
            radius={4}
            pathOptions={{ color: '#334155', fillColor: '#334155', fillOpacity: 0.4, weight: 1 }}
          >
            <Tooltip>{cc}: no data</Tooltip>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
