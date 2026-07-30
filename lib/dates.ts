export function getTodayRange(now: Date = new Date()) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return { start, end }
}

export function isDateToday(value: Date | null, now: Date = new Date()) {
  if (!value) {
    return false
  }

  const { start, end } = getTodayRange(now)

  return value >= start && value < end
}
