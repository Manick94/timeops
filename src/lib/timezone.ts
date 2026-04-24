import type { Location, LocationWithTime, Status, OverlapWindow, Suggestion } from './types'

export function getLocalTime(timezone: string): Date {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(now)
  const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value ?? '0')
  return new Date(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'))
}

export function formatTime(timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date())
}

export function formatDate(timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date())
}

export function getStatus(hour: number, workStart: number, workEnd: number): Status {
  if (hour >= workStart && hour < workEnd) return 'available'
  if ((hour >= workStart - 2 && hour < workStart) || (hour >= workEnd && hour < workEnd + 3)) return 'edge'
  return 'sleeping'
}

export function getTimeDiff(timezone: string, userTimezone: string): number {
  const userLocal = getLocalTime(userTimezone)
  const targetLocal = getLocalTime(timezone)
  const diffMs = targetLocal.getTime() - userLocal.getTime()
  return Math.round(diffMs / (1000 * 60 * 60))
}

export function enrichLocation(loc: Location, userTimezone: string): LocationWithTime {
  const localTime = getLocalTime(loc.timezone)
  const hour = localTime.getHours()
  const minute = localTime.getMinutes()
  return {
    ...loc,
    localTime,
    hour,
    minute,
    status: getStatus(hour, loc.workStart, loc.workEnd),
    timeString: formatTime(loc.timezone),
    dateString: formatDate(loc.timezone),
    diffHours: getTimeDiff(loc.timezone, userTimezone),
  }
}

export function computeOverlap(locations: Location[]): OverlapWindow | null {
  if (locations.length < 2) return null

  // For each location, compute working hours in UTC offset minutes
  const now = new Date()

  // Try each hour of the day to find the best overlap
  let bestWindow: OverlapWindow | null = null
  let bestScore = 0

  for (let startHour = 0; startHour < 24; startHour++) {
    let overlapDuration = 0

    for (let h = startHour; h < startHour + 12; h++) {
      const checkHour = h % 24
      const allAvailable = locations.every(loc => {
        // Compute what local time it would be for this UTC hour
        const utcDate = new Date(now)
        utcDate.setUTCHours(checkHour, 0, 0, 0)
        const localHour = parseInt(
          new Intl.DateTimeFormat('en-US', {
            timeZone: loc.timezone,
            hour: '2-digit',
            hour12: false,
          }).format(utcDate)
        )
        return localHour >= loc.workStart && localHour < loc.workEnd
      })

      if (allAvailable) overlapDuration++
      else if (overlapDuration > 0) break
    }

    if (overlapDuration > bestScore) {
      bestScore = overlapDuration
      const localTimes = locations.map(loc => {
        const utcStart = new Date(now)
        utcStart.setUTCHours(startHour, 0, 0, 0)
        const utcEnd = new Date(now)
        utcEnd.setUTCHours(startHour + overlapDuration, 0, 0, 0)
        const fmt = (d: Date) =>
          new Intl.DateTimeFormat('en-US', {
            timeZone: loc.timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }).format(d)
        return { locationId: loc.id, city: loc.city, start: fmt(utcStart), end: fmt(utcEnd) }
      })
      bestWindow = {
        startUTC: startHour,
        endUTC: startHour + overlapDuration,
        durationHours: overlapDuration,
        qualityScore: Math.min(100, Math.round((overlapDuration / 4) * 100)),
        localTimes,
      }
    }
  }

  return bestWindow
}

export function getSuggestion(locations: LocationWithTime[]): Suggestion {
  if (locations.length === 0) return { text: 'Add locations to get suggestions', urgency: 'wait' }

  const anyAvailable = locations.some(l => l.status === 'available')
  if (anyAvailable) {
    const cities = locations.filter(l => l.status === 'available').map(l => l.city)
    return { text: `Call ${cities[0]} now`, urgency: 'now' }
  }

  const anyEdge = locations.some(l => l.status === 'edge')
  if (anyEdge) {
    const city = locations.find(l => l.status === 'edge')!.city
    return { text: `${city} in edge hours — call soon`, urgency: 'soon' }
  }

  // Find next available window
  let minWait = Infinity
  locations.forEach(loc => {
    const hoursUntilWork = loc.hour < loc.workStart
      ? loc.workStart - loc.hour
      : 24 - loc.hour + loc.workStart
    if (hoursUntilWork < minWait) minWait = hoursUntilWork
  })

  return {
    text: `Wait ${minWait}h — all locations sleeping`,
    urgency: 'wait',
    waitHours: minWait,
  }
}

export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}
