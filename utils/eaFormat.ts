// Number and geometry helpers for the Expert Advisors pages.
//
// Figures are formatted ONE way regardless of the interface language: a track
// record is published data, and "+2,236.32%" is the form it is published and
// drawn in. Routing it through the active locale would print "2.236,32 %" in
// German, which is a different-looking number on what is meant to be a
// verifiable record. The words around the figures are translated; the figures
// are not.

const GROUPED = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const GROUPED_WHOLE = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

/** U+2212, the typographic minus the design sets losses with. It is the same
 *  width as "+" in Poppins, so a column of gains and losses stays aligned. */
const MINUS = '−'

/** `341.31` -> `+341.31%`. `sign` adds the plus; a loss always carries its minus. */
export function eaPercent(value: number, options: { sign?: boolean; decimals?: 0 | 2 } = {}): string {
    const { sign = false, decimals = 2 } = options
    const body = (decimals === 0 ? GROUPED_WHOLE : GROUPED).format(Math.abs(value))
    const prefix = value < 0 ? MINUS : sign ? '+' : ''
    return `${prefix}${body}%`
}

/** A heatmap cell: `+18.50`, with the unit left to the column. */
export function eaSigned(value: number): string {
    return `${value < 0 ? MINUS : '+'}${GROUPED.format(Math.abs(value))}`
}

/** `43` months -> `3.6`. One decimal, and none when it would be `.0`. */
export function eaYears(months: number): string {
    const years = Math.round((months / 12) * 10) / 10
    return Number.isInteger(years) ? String(years) : years.toFixed(1)
}

/** Short or long month name in the interface language. Built on a fixed UTC
 *  date so the server and the browser can never land on different months. */
export function eaMonthName(locale: string, month: number, style: 'short' | 'long' = 'short'): string {
    return new Intl.DateTimeFormat(locale, { month: style, timeZone: 'UTC' }).format(Date.UTC(2024, month, 15))
}

export interface EaPlotBox {
    width: number
    height: number
    /** Inset from the top and bottom edge that the curve may not enter. */
    top?: number
    bottom?: number
    /** Value range. Defaults to the series' own extent. */
    min?: number
    max?: number
}

/** Project a series onto a box: evenly spaced in x, linear in y, origin top-left. */
export function eaPlotPoints(series: readonly number[], box: EaPlotBox): { x: number; y: number }[] {
    const top = box.top ?? 0
    const bottom = box.bottom ?? 0
    const min = box.min ?? Math.min(...series)
    const max = box.max ?? Math.max(...series)
    const span = max - min || 1
    const drawable = box.height - top - bottom
    const step = series.length > 1 ? box.width / (series.length - 1) : 0
    return series.map((value, index) => ({
        x: Math.round(index * step * 100) / 100,
        y: Math.round((top + (1 - (value - min) / span) * drawable) * 100) / 100
    }))
}

/** The polyline through those points, as an SVG path. */
export function eaLinePath(points: readonly { x: number; y: number }[]): string {
    return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join('')
}

/** The same line closed down to `floor`, for the gradient under the curve. */
export function eaAreaPath(points: readonly { x: number; y: number }[], floor: number): string {
    if (!points.length) return ''
    return `${eaLinePath(points)}V${floor}H${points[0].x}Z`
}

/** Round axis ceiling: the smallest "nice" value at or above `value`, and the
 *  step that divides it into `ticks` equal intervals. */
export function eaNiceCeiling(value: number, ticks = 4): { max: number; step: number } {
    if (value <= 0) return { max: ticks, step: 1 }
    const rough = value / ticks
    const magnitude = Math.pow(10, Math.floor(Math.log10(rough)))
    const step = [1, 1.5, 2, 2.5, 5, 10].map((unit) => unit * magnitude).find((candidate) => candidate >= rough) ?? rough
    return { max: step * ticks, step }
}

export interface EaAxisScale {
    min: number
    max: number
    step: number
    /** Every gridline value, top of the plot first. */
    ticks: number[]
}

/** A value axis for `low..high`: round step, floor at zero unless the series
 *  goes under it, and four to six gridlines rather than a fixed count - a fixed
 *  four would put a +2,236% curve on a 0-4,000% axis and use half the plot. */
export function eaAxisScale(low: number, high: number, intervals = 5): EaAxisScale {
    const floor = Math.min(0, low)
    const { step } = eaNiceCeiling(Math.max(high - floor, 0.0001), intervals)
    const min = floor < 0 ? Math.floor(floor / step) * step : 0
    const max = Math.max(Math.ceil(high / step) * step, min + step)
    const count = Math.round((max - min) / step)
    const ticks = Array.from({ length: count + 1 }, (_, index) => Math.round((max - index * step) * 1000) / 1000)
    return { min, max, step, ticks }
}

/** An axis label: whole percent unless the step itself is fractional. */
export function eaAxisPercent(value: number, step: number): string {
    const decimals = Number.isInteger(step) ? 0 : 1
    const body = Math.abs(value).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })
    return `${value < 0 ? MINUS : ''}${body}%`
}

/** `19 Nov 2026, 01:00 GMT` from an ISO timestamp, in UTC, with the month in
 *  the interface language. Day-month-year reads correctly in all four. */
export function eaPublishStamp(locale: string, iso: string): string {
    const date = new Date(iso)
    const pad = (value: number) => String(value).padStart(2, '0')
    return `${date.getUTCDate()} ${eaMonthName(locale, date.getUTCMonth())} ${date.getUTCFullYear()}, ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} GMT`
}
