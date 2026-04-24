import type { Location } from './types'

let _id = 1
const id = () => String(_id++)

export interface CityWithCoords extends Location {
  lat: number
  lng: number
}

export const PRESET_CITIES: CityWithCoords[] = [
  // ── Core 30 (IDs 1–30, preserved for localStorage compat) ──────────────
  { id: id(), city: 'New York',       country: 'United States',   countryCode: 'US', timezone: 'America/New_York',              workStart: 9, workEnd: 18, lat:  40.71, lng:  -74.00 },
  { id: id(), city: 'London',         country: 'United Kingdom',  countryCode: 'GB', timezone: 'Europe/London',                 workStart: 9, workEnd: 18, lat:  51.51, lng:   -0.13 },
  { id: id(), city: 'Paris',          country: 'France',          countryCode: 'FR', timezone: 'Europe/Paris',                  workStart: 9, workEnd: 18, lat:  48.86, lng:    2.35 },
  { id: id(), city: 'Berlin',         country: 'Germany',         countryCode: 'DE', timezone: 'Europe/Berlin',                 workStart: 9, workEnd: 18, lat:  52.52, lng:   13.41 },
  { id: id(), city: 'Dubai',          country: 'UAE',             countryCode: 'AE', timezone: 'Asia/Dubai',                    workStart: 9, workEnd: 18, lat:  25.20, lng:   55.27 },
  { id: id(), city: 'Mumbai',         country: 'India',           countryCode: 'IN', timezone: 'Asia/Kolkata',                  workStart: 9, workEnd: 18, lat:  19.08, lng:   72.88 },
  { id: id(), city: 'Singapore',      country: 'Singapore',       countryCode: 'SG', timezone: 'Asia/Singapore',                workStart: 9, workEnd: 18, lat:   1.35, lng:  103.82 },
  { id: id(), city: 'Tokyo',          country: 'Japan',           countryCode: 'JP', timezone: 'Asia/Tokyo',                    workStart: 9, workEnd: 18, lat:  35.68, lng:  139.69 },
  { id: id(), city: 'Sydney',         country: 'Australia',       countryCode: 'AU', timezone: 'Australia/Sydney',              workStart: 9, workEnd: 18, lat: -33.87, lng:  151.21 },
  { id: id(), city: 'Los Angeles',    country: 'United States',   countryCode: 'US', timezone: 'America/Los_Angeles',           workStart: 9, workEnd: 18, lat:  34.05, lng: -118.24 },
  { id: id(), city: 'Chicago',        country: 'United States',   countryCode: 'US', timezone: 'America/Chicago',               workStart: 9, workEnd: 18, lat:  41.88, lng:  -87.63 },
  { id: id(), city: 'São Paulo',      country: 'Brazil',          countryCode: 'BR', timezone: 'America/Sao_Paulo',             workStart: 9, workEnd: 18, lat: -23.55, lng:  -46.63 },
  { id: id(), city: 'Mexico City',    country: 'Mexico',          countryCode: 'MX', timezone: 'America/Mexico_City',           workStart: 9, workEnd: 18, lat:  19.43, lng:  -99.13 },
  { id: id(), city: 'Toronto',        country: 'Canada',          countryCode: 'CA', timezone: 'America/Toronto',               workStart: 9, workEnd: 18, lat:  43.65, lng:  -79.38 },
  { id: id(), city: 'Amsterdam',      country: 'Netherlands',     countryCode: 'NL', timezone: 'Europe/Amsterdam',              workStart: 9, workEnd: 18, lat:  52.37, lng:    4.90 },
  { id: id(), city: 'Moscow',         country: 'Russia',          countryCode: 'RU', timezone: 'Europe/Moscow',                 workStart: 9, workEnd: 18, lat:  55.75, lng:   37.62 },
  { id: id(), city: 'Istanbul',       country: 'Turkey',          countryCode: 'TR', timezone: 'Europe/Istanbul',               workStart: 9, workEnd: 18, lat:  41.01, lng:   28.95 },
  { id: id(), city: 'Seoul',          country: 'South Korea',     countryCode: 'KR', timezone: 'Asia/Seoul',                    workStart: 9, workEnd: 18, lat:  37.57, lng:  126.98 },
  { id: id(), city: 'Shanghai',       country: 'China',           countryCode: 'CN', timezone: 'Asia/Shanghai',                 workStart: 9, workEnd: 18, lat:  31.23, lng:  121.47 },
  { id: id(), city: 'Hong Kong',      country: 'Hong Kong',       countryCode: 'HK', timezone: 'Asia/Hong_Kong',                workStart: 9, workEnd: 18, lat:  22.32, lng:  114.17 },
  { id: id(), city: 'Bangkok',        country: 'Thailand',        countryCode: 'TH', timezone: 'Asia/Bangkok',                  workStart: 9, workEnd: 18, lat:  13.75, lng:  100.52 },
  { id: id(), city: 'Jakarta',        country: 'Indonesia',       countryCode: 'ID', timezone: 'Asia/Jakarta',                  workStart: 9, workEnd: 18, lat:  -6.21, lng:  106.85 },
  { id: id(), city: 'Nairobi',        country: 'Kenya',           countryCode: 'KE', timezone: 'Africa/Nairobi',                workStart: 9, workEnd: 18, lat:  -1.29, lng:   36.82 },
  { id: id(), city: 'Lagos',          country: 'Nigeria',         countryCode: 'NG', timezone: 'Africa/Lagos',                  workStart: 9, workEnd: 18, lat:   6.52, lng:    3.38 },
  { id: id(), city: 'Cairo',          country: 'Egypt',           countryCode: 'EG', timezone: 'Africa/Cairo',                  workStart: 9, workEnd: 18, lat:  30.04, lng:   31.24 },
  { id: id(), city: 'Johannesburg',   country: 'South Africa',    countryCode: 'ZA', timezone: 'Africa/Johannesburg',           workStart: 9, workEnd: 18, lat: -26.20, lng:   28.04 },
  { id: id(), city: 'Auckland',       country: 'New Zealand',     countryCode: 'NZ', timezone: 'Pacific/Auckland',              workStart: 9, workEnd: 18, lat: -36.86, lng:  174.77 },
  { id: id(), city: 'Denver',         country: 'United States',   countryCode: 'US', timezone: 'America/Denver',                workStart: 9, workEnd: 18, lat:  39.74, lng: -104.98 },
  { id: id(), city: 'Riyadh',         country: 'Saudi Arabia',    countryCode: 'SA', timezone: 'Asia/Riyadh',                   workStart: 9, workEnd: 18, lat:  24.69, lng:   46.72 },
  { id: id(), city: 'Karachi',        country: 'Pakistan',        countryCode: 'PK', timezone: 'Asia/Karachi',                  workStart: 9, workEnd: 18, lat:  24.86, lng:   67.01 },

  // ── North America (extended) ─────────────────────────────────────────────
  { id: id(), city: 'San Francisco',  country: 'United States',   countryCode: 'US', timezone: 'America/Los_Angeles',           workStart: 9, workEnd: 18, lat:  37.77, lng: -122.42 },
  { id: id(), city: 'Seattle',        country: 'United States',   countryCode: 'US', timezone: 'America/Los_Angeles',           workStart: 9, workEnd: 18, lat:  47.61, lng: -122.33 },
  { id: id(), city: 'Miami',          country: 'United States',   countryCode: 'US', timezone: 'America/New_York',              workStart: 9, workEnd: 18, lat:  25.77, lng:  -80.19 },
  { id: id(), city: 'Boston',         country: 'United States',   countryCode: 'US', timezone: 'America/New_York',              workStart: 9, workEnd: 18, lat:  42.36, lng:  -71.06 },
  { id: id(), city: 'Atlanta',        country: 'United States',   countryCode: 'US', timezone: 'America/New_York',              workStart: 9, workEnd: 18, lat:  33.75, lng:  -84.39 },
  { id: id(), city: 'Phoenix',        country: 'United States',   countryCode: 'US', timezone: 'America/Phoenix',               workStart: 9, workEnd: 18, lat:  33.45, lng: -112.07 },
  { id: id(), city: 'Houston',        country: 'United States',   countryCode: 'US', timezone: 'America/Chicago',               workStart: 9, workEnd: 18, lat:  29.76, lng:  -95.37 },
  { id: id(), city: 'Dallas',         country: 'United States',   countryCode: 'US', timezone: 'America/Chicago',               workStart: 9, workEnd: 18, lat:  32.78, lng:  -96.80 },
  { id: id(), city: 'Las Vegas',      country: 'United States',   countryCode: 'US', timezone: 'America/Los_Angeles',           workStart: 9, workEnd: 18, lat:  36.17, lng: -115.14 },
  { id: id(), city: 'Minneapolis',    country: 'United States',   countryCode: 'US', timezone: 'America/Chicago',               workStart: 9, workEnd: 18, lat:  44.98, lng:  -93.27 },
  { id: id(), city: 'Honolulu',       country: 'United States',   countryCode: 'US', timezone: 'Pacific/Honolulu',              workStart: 9, workEnd: 18, lat:  21.31, lng: -157.85 },
  { id: id(), city: 'Vancouver',      country: 'Canada',          countryCode: 'CA', timezone: 'America/Vancouver',             workStart: 9, workEnd: 18, lat:  49.25, lng: -123.12 },
  { id: id(), city: 'Montreal',       country: 'Canada',          countryCode: 'CA', timezone: 'America/Toronto',               workStart: 9, workEnd: 18, lat:  45.50, lng:  -73.57 },

  // ── South America ────────────────────────────────────────────────────────
  { id: id(), city: 'Buenos Aires',   country: 'Argentina',       countryCode: 'AR', timezone: 'America/Argentina/Buenos_Aires', workStart: 9, workEnd: 18, lat: -34.60, lng:  -58.38 },
  { id: id(), city: 'Lima',           country: 'Peru',            countryCode: 'PE', timezone: 'America/Lima',                  workStart: 9, workEnd: 18, lat: -12.05, lng:  -77.03 },
  { id: id(), city: 'Bogotá',         country: 'Colombia',        countryCode: 'CO', timezone: 'America/Bogota',                workStart: 9, workEnd: 18, lat:   4.71, lng:  -74.07 },
  { id: id(), city: 'Santiago',       country: 'Chile',           countryCode: 'CL', timezone: 'America/Santiago',              workStart: 9, workEnd: 18, lat: -33.45, lng:  -70.67 },
  { id: id(), city: 'Montevideo',     country: 'Uruguay',         countryCode: 'UY', timezone: 'America/Montevideo',            workStart: 9, workEnd: 18, lat: -34.90, lng:  -56.19 },

  // ── Europe (extended) ────────────────────────────────────────────────────
  { id: id(), city: 'Madrid',         country: 'Spain',           countryCode: 'ES', timezone: 'Europe/Madrid',                 workStart: 9, workEnd: 18, lat:  40.42, lng:   -3.70 },
  { id: id(), city: 'Rome',           country: 'Italy',           countryCode: 'IT', timezone: 'Europe/Rome',                   workStart: 9, workEnd: 18, lat:  41.90, lng:   12.50 },
  { id: id(), city: 'Vienna',         country: 'Austria',         countryCode: 'AT', timezone: 'Europe/Vienna',                 workStart: 9, workEnd: 18, lat:  48.21, lng:   16.37 },
  { id: id(), city: 'Prague',         country: 'Czech Republic',  countryCode: 'CZ', timezone: 'Europe/Prague',                 workStart: 9, workEnd: 18, lat:  50.08, lng:   14.44 },
  { id: id(), city: 'Warsaw',         country: 'Poland',          countryCode: 'PL', timezone: 'Europe/Warsaw',                 workStart: 9, workEnd: 18, lat:  52.23, lng:   21.01 },
  { id: id(), city: 'Stockholm',      country: 'Sweden',          countryCode: 'SE', timezone: 'Europe/Stockholm',              workStart: 9, workEnd: 18, lat:  59.33, lng:   18.07 },
  { id: id(), city: 'Oslo',           country: 'Norway',          countryCode: 'NO', timezone: 'Europe/Oslo',                   workStart: 9, workEnd: 18, lat:  59.91, lng:   10.75 },
  { id: id(), city: 'Helsinki',       country: 'Finland',         countryCode: 'FI', timezone: 'Europe/Helsinki',               workStart: 9, workEnd: 18, lat:  60.17, lng:   24.94 },
  { id: id(), city: 'Zurich',         country: 'Switzerland',     countryCode: 'CH', timezone: 'Europe/Zurich',                 workStart: 9, workEnd: 18, lat:  47.38, lng:    8.54 },
  { id: id(), city: 'Lisbon',         country: 'Portugal',        countryCode: 'PT', timezone: 'Europe/Lisbon',                 workStart: 9, workEnd: 18, lat:  38.72, lng:   -9.14 },
  { id: id(), city: 'Athens',         country: 'Greece',          countryCode: 'GR', timezone: 'Europe/Athens',                 workStart: 9, workEnd: 18, lat:  37.98, lng:   23.73 },
  { id: id(), city: 'Kyiv',           country: 'Ukraine',         countryCode: 'UA', timezone: 'Europe/Kyiv',                   workStart: 9, workEnd: 18, lat:  50.45, lng:   30.52 },
  { id: id(), city: 'Budapest',       country: 'Hungary',         countryCode: 'HU', timezone: 'Europe/Budapest',               workStart: 9, workEnd: 18, lat:  47.50, lng:   19.04 },
  { id: id(), city: 'Copenhagen',     country: 'Denmark',         countryCode: 'DK', timezone: 'Europe/Copenhagen',             workStart: 9, workEnd: 18, lat:  55.68, lng:   12.57 },
  { id: id(), city: 'Brussels',       country: 'Belgium',         countryCode: 'BE', timezone: 'Europe/Brussels',               workStart: 9, workEnd: 18, lat:  50.85, lng:    4.35 },
  { id: id(), city: 'Bucharest',      country: 'Romania',         countryCode: 'RO', timezone: 'Europe/Bucharest',              workStart: 9, workEnd: 18, lat:  44.43, lng:   26.10 },
  { id: id(), city: 'Dublin',         country: 'Ireland',         countryCode: 'IE', timezone: 'Europe/Dublin',                 workStart: 9, workEnd: 18, lat:  53.33, lng:   -6.25 },
  { id: id(), city: 'Milan',          country: 'Italy',           countryCode: 'IT', timezone: 'Europe/Rome',                   workStart: 9, workEnd: 18, lat:  45.46, lng:    9.19 },

  // ── Asia (extended) ──────────────────────────────────────────────────────
  { id: id(), city: 'Delhi',          country: 'India',           countryCode: 'IN', timezone: 'Asia/Kolkata',                  workStart: 9, workEnd: 18, lat:  28.66, lng:   77.22 },
  { id: id(), city: 'Bangalore',      country: 'India',           countryCode: 'IN', timezone: 'Asia/Kolkata',                  workStart: 9, workEnd: 18, lat:  12.97, lng:   77.59 },
  { id: id(), city: 'Kolkata',        country: 'India',           countryCode: 'IN', timezone: 'Asia/Kolkata',                  workStart: 9, workEnd: 18, lat:  22.57, lng:   88.36 },
  { id: id(), city: 'Chennai',        country: 'India',           countryCode: 'IN', timezone: 'Asia/Kolkata',                  workStart: 9, workEnd: 18, lat:  13.08, lng:   80.27 },
  { id: id(), city: 'Beijing',        country: 'China',           countryCode: 'CN', timezone: 'Asia/Shanghai',                 workStart: 9, workEnd: 18, lat:  39.91, lng:  116.39 },
  { id: id(), city: 'Osaka',          country: 'Japan',           countryCode: 'JP', timezone: 'Asia/Tokyo',                    workStart: 9, workEnd: 18, lat:  34.69, lng:  135.50 },
  { id: id(), city: 'Taipei',         country: 'Taiwan',          countryCode: 'TW', timezone: 'Asia/Taipei',                   workStart: 9, workEnd: 18, lat:  25.05, lng:  121.56 },
  { id: id(), city: 'Kuala Lumpur',   country: 'Malaysia',        countryCode: 'MY', timezone: 'Asia/Kuala_Lumpur',             workStart: 9, workEnd: 18, lat:   3.14, lng:  101.69 },
  { id: id(), city: 'Ho Chi Minh',    country: 'Vietnam',         countryCode: 'VN', timezone: 'Asia/Ho_Chi_Minh',              workStart: 9, workEnd: 18, lat:  10.82, lng:  106.63 },
  { id: id(), city: 'Manila',         country: 'Philippines',     countryCode: 'PH', timezone: 'Asia/Manila',                   workStart: 9, workEnd: 18, lat:  14.60, lng:  120.98 },
  { id: id(), city: 'Dhaka',          country: 'Bangladesh',      countryCode: 'BD', timezone: 'Asia/Dhaka',                    workStart: 9, workEnd: 18, lat:  23.72, lng:   90.41 },
  { id: id(), city: 'Tehran',         country: 'Iran',            countryCode: 'IR', timezone: 'Asia/Tehran',                   workStart: 9, workEnd: 18, lat:  35.69, lng:   51.39 },
  { id: id(), city: 'Tel Aviv',       country: 'Israel',          countryCode: 'IL', timezone: 'Asia/Jerusalem',                workStart: 9, workEnd: 18, lat:  32.09, lng:   34.79 },
  { id: id(), city: 'Doha',           country: 'Qatar',           countryCode: 'QA', timezone: 'Asia/Qatar',                    workStart: 9, workEnd: 18, lat:  25.29, lng:   51.53 },
  { id: id(), city: 'Muscat',         country: 'Oman',            countryCode: 'OM', timezone: 'Asia/Muscat',                   workStart: 9, workEnd: 18, lat:  23.61, lng:   58.59 },
  { id: id(), city: 'Kuwait City',    country: 'Kuwait',          countryCode: 'KW', timezone: 'Asia/Kuwait',                   workStart: 9, workEnd: 18, lat:  29.37, lng:   47.98 },
  { id: id(), city: 'Beirut',         country: 'Lebanon',         countryCode: 'LB', timezone: 'Asia/Beirut',                   workStart: 9, workEnd: 18, lat:  33.89, lng:   35.50 },
  { id: id(), city: 'Amman',          country: 'Jordan',          countryCode: 'JO', timezone: 'Asia/Amman',                    workStart: 9, workEnd: 18, lat:  31.95, lng:   35.91 },
  { id: id(), city: 'Tashkent',       country: 'Uzbekistan',      countryCode: 'UZ', timezone: 'Asia/Tashkent',                 workStart: 9, workEnd: 18, lat:  41.30, lng:   69.24 },
  { id: id(), city: 'Almaty',         country: 'Kazakhstan',      countryCode: 'KZ', timezone: 'Asia/Almaty',                   workStart: 9, workEnd: 18, lat:  43.24, lng:   76.95 },
  { id: id(), city: 'Kathmandu',      country: 'Nepal',           countryCode: 'NP', timezone: 'Asia/Kathmandu',                workStart: 9, workEnd: 18, lat:  27.70, lng:   85.31 },
  { id: id(), city: 'Colombo',        country: 'Sri Lanka',       countryCode: 'LK', timezone: 'Asia/Colombo',                  workStart: 9, workEnd: 18, lat:   6.93, lng:   79.86 },
  { id: id(), city: 'Yangon',         country: 'Myanmar',         countryCode: 'MM', timezone: 'Asia/Rangoon',                  workStart: 9, workEnd: 18, lat:  16.87, lng:   96.17 },
  { id: id(), city: 'Lahore',         country: 'Pakistan',        countryCode: 'PK', timezone: 'Asia/Karachi',                  workStart: 9, workEnd: 18, lat:  31.55, lng:   74.34 },
  { id: id(), city: 'Ulaanbaatar',    country: 'Mongolia',        countryCode: 'MN', timezone: 'Asia/Ulaanbaatar',              workStart: 9, workEnd: 18, lat:  47.91, lng:  106.88 },

  // ── Africa (extended) ────────────────────────────────────────────────────
  { id: id(), city: 'Casablanca',     country: 'Morocco',         countryCode: 'MA', timezone: 'Africa/Casablanca',             workStart: 9, workEnd: 18, lat:  33.59, lng:   -7.62 },
  { id: id(), city: 'Addis Ababa',    country: 'Ethiopia',        countryCode: 'ET', timezone: 'Africa/Addis_Ababa',            workStart: 9, workEnd: 18, lat:   9.03, lng:   38.74 },
  { id: id(), city: 'Accra',          country: 'Ghana',           countryCode: 'GH', timezone: 'Africa/Accra',                  workStart: 9, workEnd: 18, lat:   5.56, lng:   -0.20 },
  { id: id(), city: 'Dar es Salaam',  country: 'Tanzania',        countryCode: 'TZ', timezone: 'Africa/Dar_es_Salaam',          workStart: 9, workEnd: 18, lat:  -6.79, lng:   39.21 },
  { id: id(), city: 'Kinshasa',       country: 'DR Congo',        countryCode: 'CD', timezone: 'Africa/Kinshasa',               workStart: 9, workEnd: 18, lat:  -4.32, lng:   15.32 },
  { id: id(), city: 'Abidjan',        country: "Côte d'Ivoire",   countryCode: 'CI', timezone: 'Africa/Abidjan',                workStart: 9, workEnd: 18, lat:   5.35, lng:   -4.00 },
  { id: id(), city: 'Khartoum',       country: 'Sudan',           countryCode: 'SD', timezone: 'Africa/Khartoum',               workStart: 9, workEnd: 18, lat:  15.55, lng:   32.53 },
  { id: id(), city: 'Tunis',          country: 'Tunisia',         countryCode: 'TN', timezone: 'Africa/Tunis',                  workStart: 9, workEnd: 18, lat:  36.82, lng:   10.17 },
  { id: id(), city: 'Algiers',        country: 'Algeria',         countryCode: 'DZ', timezone: 'Africa/Algiers',                workStart: 9, workEnd: 18, lat:  36.74, lng:    3.06 },

  // ── Oceania (extended) ───────────────────────────────────────────────────
  { id: id(), city: 'Melbourne',      country: 'Australia',       countryCode: 'AU', timezone: 'Australia/Melbourne',           workStart: 9, workEnd: 18, lat: -37.81, lng:  144.96 },
  { id: id(), city: 'Brisbane',       country: 'Australia',       countryCode: 'AU', timezone: 'Australia/Brisbane',            workStart: 9, workEnd: 18, lat: -27.47, lng:  153.02 },
  { id: id(), city: 'Perth',          country: 'Australia',       countryCode: 'AU', timezone: 'Australia/Perth',               workStart: 9, workEnd: 18, lat: -31.95, lng:  115.86 },
  { id: id(), city: 'Wellington',     country: 'New Zealand',     countryCode: 'NZ', timezone: 'Pacific/Auckland',              workStart: 9, workEnd: 18, lat: -41.29, lng:  174.78 },
  { id: id(), city: 'Suva',           country: 'Fiji',            countryCode: 'FJ', timezone: 'Pacific/Fiji',                  workStart: 9, workEnd: 18, lat: -18.14, lng:  178.44 },
  { id: id(), city: 'Port Moresby',   country: 'Papua New Guinea',countryCode: 'PG', timezone: 'Pacific/Port_Moresby',          workStart: 9, workEnd: 18, lat:  -9.44, lng:  147.18 },
]

export function flagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0)))
    .join('')
}

export function latlngToPercent(lat: number, lng: number): [number, number] {
  const x = (lng + 180) / 360 * 100
  const y = (90 - lat) / 180 * 100
  return [x, y]
}
