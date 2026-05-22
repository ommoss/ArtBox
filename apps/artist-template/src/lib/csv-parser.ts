// Minimal RFC4180-ish CSV parser. Handles quoted fields, escaped quotes
// (""), and CRLF/LF line endings. Doesn't pull in a dependency for what's
// fundamentally a state machine.
export function parseCsv(input: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0

  while (i < input.length) {
    const ch = input[i]

    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += ch
      i++
      continue
    }

    if (ch === '"') {
      inQuotes = true
      i++
      continue
    }
    if (ch === ',') {
      row.push(field)
      field = ''
      i++
      continue
    }
    if (ch === '\r') {
      i++
      continue
    }
    if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i++
      continue
    }
    field += ch
    i++
  }

  // Flush the last field/row if no trailing newline.
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

// Map a CSV with headers into an array of records keyed by header name.
// Missing values become empty strings.
export function parseCsvWithHeaders(input: string): Record<string, string>[] {
  const rows = parseCsv(input)
  if (rows.length === 0) return []
  const headers = rows[0].map((h) => h.trim())
  return rows.slice(1).map((row) => {
    const rec: Record<string, string> = {}
    headers.forEach((h, idx) => {
      rec[h] = (row[idx] ?? '').trim()
    })
    return rec
  })
}
