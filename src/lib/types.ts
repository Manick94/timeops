export type Status = 'available' | 'edge' | 'sleeping'

export interface Location {
  id: string
  city: string
  country: string
  countryCode: string
  timezone: string
  workStart: number
  workEnd: number
}

export interface LocationWithTime extends Location {
  localTime: Date
  hour: number
  minute: number
  status: Status
  timeString: string
  dateString: string
  diffHours: number
}

export interface OverlapWindow {
  startUTC: number
  endUTC: number
  durationHours: number
  qualityScore: number
  localTimes: { locationId: string; city: string; start: string; end: string }[]
}

export interface Suggestion {
  text: string
  urgency: 'now' | 'soon' | 'later' | 'wait'
  waitHours?: number
}
