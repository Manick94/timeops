import type { Location } from './types'

let _id = 1
const id = () => String(_id++)

export interface CityWithCoords extends Location {
  lat: number
  lng: number
}

export const PRESET_CITIES: CityWithCoords[] = [
  { id: id(), city: 'New York',      country: 'United States',  countryCode: 'US', timezone: 'America/New_York',      workStart: 9, workEnd: 18, lat:  40.71, lng:  -74.00 },
  { id: id(), city: 'London',        country: 'United Kingdom', countryCode: 'GB', timezone: 'Europe/London',          workStart: 9, workEnd: 18, lat:  51.51, lng:   -0.13 },
  { id: id(), city: 'Paris',         country: 'France',         countryCode: 'FR', timezone: 'Europe/Paris',           workStart: 9, workEnd: 18, lat:  48.86, lng:    2.35 },
  { id: id(), city: 'Berlin',        country: 'Germany',        countryCode: 'DE', timezone: 'Europe/Berlin',          workStart: 9, workEnd: 18, lat:  52.52, lng:   13.41 },
  { id: id(), city: 'Dubai',         country: 'UAE',            countryCode: 'AE', timezone: 'Asia/Dubai',             workStart: 9, workEnd: 18, lat:  25.20, lng:   55.27 },
  { id: id(), city: 'Mumbai',        country: 'India',          countryCode: 'IN', timezone: 'Asia/Kolkata',           workStart: 9, workEnd: 18, lat:  19.08, lng:   72.88 },
  { id: id(), city: 'Singapore',     country: 'Singapore',      countryCode: 'SG', timezone: 'Asia/Singapore',         workStart: 9, workEnd: 18, lat:   1.35, lng:  103.82 },
  { id: id(), city: 'Tokyo',         country: 'Japan',          countryCode: 'JP', timezone: 'Asia/Tokyo',             workStart: 9, workEnd: 18, lat:  35.68, lng:  139.69 },
  { id: id(), city: 'Sydney',        country: 'Australia',      countryCode: 'AU', timezone: 'Australia/Sydney',       workStart: 9, workEnd: 18, lat: -33.87, lng:  151.21 },
  { id: id(), city: 'Los Angeles',   country: 'United States',  countryCode: 'US', timezone: 'America/Los_Angeles',    workStart: 9, workEnd: 18, lat:  34.05, lng: -118.24 },
  { id: id(), city: 'Chicago',       country: 'United States',  countryCode: 'US', timezone: 'America/Chicago',        workStart: 9, workEnd: 18, lat:  41.88, lng:  -87.63 },
  { id: id(), city: 'São Paulo',     country: 'Brazil',         countryCode: 'BR', timezone: 'America/Sao_Paulo',      workStart: 9, workEnd: 18, lat: -23.55, lng:  -46.63 },
  { id: id(), city: 'Mexico City',   country: 'Mexico',         countryCode: 'MX', timezone: 'America/Mexico_City',    workStart: 9, workEnd: 18, lat:  19.43, lng:  -99.13 },
  { id: id(), city: 'Toronto',       country: 'Canada',         countryCode: 'CA', timezone: 'America/Toronto',        workStart: 9, workEnd: 18, lat:  43.65, lng:  -79.38 },
  { id: id(), city: 'Amsterdam',     country: 'Netherlands',    countryCode: 'NL', timezone: 'Europe/Amsterdam',       workStart: 9, workEnd: 18, lat:  52.37, lng:    4.90 },
  { id: id(), city: 'Moscow',        country: 'Russia',         countryCode: 'RU', timezone: 'Europe/Moscow',          workStart: 9, workEnd: 18, lat:  55.75, lng:   37.62 },
  { id: id(), city: 'Istanbul',      country: 'Turkey',         countryCode: 'TR', timezone: 'Europe/Istanbul',        workStart: 9, workEnd: 18, lat:  41.01, lng:   28.95 },
  { id: id(), city: 'Seoul',         country: 'South Korea',    countryCode: 'KR', timezone: 'Asia/Seoul',             workStart: 9, workEnd: 18, lat:  37.57, lng:  126.98 },
  { id: id(), city: 'Shanghai',      country: 'China',          countryCode: 'CN', timezone: 'Asia/Shanghai',          workStart: 9, workEnd: 18, lat:  31.23, lng:  121.47 },
  { id: id(), city: 'Hong Kong',     country: 'Hong Kong',      countryCode: 'HK', timezone: 'Asia/Hong_Kong',         workStart: 9, workEnd: 18, lat:  22.32, lng:  114.17 },
  { id: id(), city: 'Bangkok',       country: 'Thailand',       countryCode: 'TH', timezone: 'Asia/Bangkok',           workStart: 9, workEnd: 18, lat:  13.75, lng:  100.52 },
  { id: id(), city: 'Jakarta',       country: 'Indonesia',      countryCode: 'ID', timezone: 'Asia/Jakarta',           workStart: 9, workEnd: 18, lat:  -6.21, lng:  106.85 },
  { id: id(), city: 'Nairobi',       country: 'Kenya',          countryCode: 'KE', timezone: 'Africa/Nairobi',         workStart: 9, workEnd: 18, lat:  -1.29, lng:   36.82 },
  { id: id(), city: 'Lagos',         country: 'Nigeria',        countryCode: 'NG', timezone: 'Africa/Lagos',           workStart: 9, workEnd: 18, lat:   6.52, lng:    3.38 },
  { id: id(), city: 'Cairo',         country: 'Egypt',          countryCode: 'EG', timezone: 'Africa/Cairo',           workStart: 9, workEnd: 18, lat:  30.04, lng:   31.24 },
  { id: id(), city: 'Johannesburg',  country: 'South Africa',   countryCode: 'ZA', timezone: 'Africa/Johannesburg',    workStart: 9, workEnd: 18, lat: -26.20, lng:   28.04 },
  { id: id(), city: 'Auckland',      country: 'New Zealand',    countryCode: 'NZ', timezone: 'Pacific/Auckland',       workStart: 9, workEnd: 18, lat: -36.86, lng:  174.77 },
  { id: id(), city: 'Denver',        country: 'United States',  countryCode: 'US', timezone: 'America/Denver',         workStart: 9, workEnd: 18, lat:  39.74, lng: -104.98 },
  { id: id(), city: 'Riyadh',        country: 'Saudi Arabia',   countryCode: 'SA', timezone: 'Asia/Riyadh',            workStart: 9, workEnd: 18, lat:  24.69, lng:   46.72 },
  { id: id(), city: 'Karachi',       country: 'Pakistan',       countryCode: 'PK', timezone: 'Asia/Karachi',           workStart: 9, workEnd: 18, lat:  24.86, lng:   67.01 },
]

export function flagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0)))
    .join('')
}

// Equirectangular projection: convert lat/lng to [x%, y%] on a 0-100 scale
export function latlngToPercent(lat: number, lng: number): [number, number] {
  const x = (lng + 180) / 360 * 100
  const y = (90 - lat) / 180 * 100
  return [x, y]
}
