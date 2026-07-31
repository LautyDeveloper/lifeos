function getStartOfDay(now: Date) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  return start
}

function isValidLocalDateParts(date: Date, year: number, month: number, day: number) {
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

export function getDateDaysFromNow(offset: number, now: Date = new Date()) {
  const start = getStartOfDay(now)
  start.setDate(start.getDate() + offset)
  return start
}

export function getTodayRange(now: Date = new Date()) {
  const start = getStartOfDay(now)

  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return { start, end }
}

export function getTomorrowRange(now: Date = new Date()) {
  const start = getDateDaysFromNow(1, now)

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

export function isDateTomorrow(value: Date | null, now: Date = new Date()) {
  if (!value) {
    return false
  }

  const { start, end } = getTomorrowRange(now)

  return value >= start && value < end
}

export function parseDateInput(value: string) {
  const trimmed = value.trim()

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null
  }

  const [yearString, monthString, dayString] = trimmed.split("-")
  const year = Number(yearString)
  const month = Number(monthString)
  const day = Number(dayString)
  const date = new Date(year, month - 1, day)

  if (!isValidLocalDateParts(date, year, month, day)) {
    return null
  }

  return date
}

export function formatDateInputValue(value: Date | null) {
  if (!value) {
    return ""
  }

  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function formatPlanningDateLabel(value: Date | null, now: Date = new Date()) {
  if (!value) {
    return "Sin fecha"
  }

  if (isDateToday(value, now)) {
    return "Hoy"
  }

  if (isDateTomorrow(value, now)) {
    return "Mañana"
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  }).format(value)
}
