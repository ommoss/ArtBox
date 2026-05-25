'use client'

import Link from 'next/link'
import * as React from 'react'

export type TemplateRow = {
  id: number
  name: string
  slug: string
  category: string
  basePrice: number
  isActive: boolean
}

export type ProductionItemRow = {
  id: number
  sku: string
  name: string
  category: string
  widthIn: number | null
  heightIn: number | null
  material: string
  baseCost: number
  isActive: boolean
}

type Edits = {
  templates: Map<number, number>
  productionItems: Map<number, number>
}

export default function BulkPricesClient({
  templates,
  productionItems,
}: {
  templates: TemplateRow[]
  productionItems: ProductionItemRow[]
}) {
  const [edits, setEdits] = React.useState<Edits>({
    templates: new Map(),
    productionItems: new Map(),
  })
  const [filter, setFilter] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState<string>('')
  const [saving, setSaving] = React.useState(false)
  const [saveMsg, setSaveMsg] = React.useState<string | null>(null)
  const [showInactive, setShowInactive] = React.useState(false)

  // All categories present across templates + production items, for the
  // category dropdown.
  const categories = React.useMemo(() => {
    const set = new Set<string>()
    for (const t of templates) if (t.category) set.add(t.category)
    for (const p of productionItems) if (p.category) set.add(p.category)
    return Array.from(set).sort()
  }, [templates, productionItems])

  const filteredTemplates = React.useMemo(() => {
    return templates.filter((t) => {
      if (!showInactive && !t.isActive) return false
      if (categoryFilter && t.category !== categoryFilter) return false
      const f = filter.toLowerCase()
      if (!f) return true
      return (
        t.name.toLowerCase().includes(f) ||
        t.slug.toLowerCase().includes(f) ||
        t.category.toLowerCase().includes(f)
      )
    })
  }, [templates, filter, categoryFilter, showInactive])

  // ProductionCatalog items grouped by category so staff can scan the
  // catalog by product line (framed / canvas / etc.). Within each
  // category, items sort by area ascending so 8×10 lands before 16×20.
  const productionByCategory = React.useMemo(() => {
    const map = new Map<string, ProductionItemRow[]>()
    for (const p of productionItems) {
      if (!showInactive && !p.isActive) continue
      if (categoryFilter && p.category !== categoryFilter) continue
      const f = filter.toLowerCase()
      if (
        f &&
        !p.sku.toLowerCase().includes(f) &&
        !p.name.toLowerCase().includes(f) &&
        !p.material.toLowerCase().includes(f)
      ) {
        continue
      }
      const existing = map.get(p.category) ?? []
      existing.push(p)
      map.set(p.category, existing)
    }
    for (const [, rows] of map) {
      rows.sort((a, b) => {
        const aArea = (a.widthIn ?? 0) * (a.heightIn ?? 0)
        const bArea = (b.widthIn ?? 0) * (b.heightIn ?? 0)
        if (aArea !== bArea) return aArea - bArea
        return a.sku.localeCompare(b.sku)
      })
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [productionItems, filter, categoryFilter, showInactive])

  const setTemplatePrice = (id: number, value: number) => {
    setEdits((prev) => {
      const m = new Map(prev.templates)
      m.set(id, value)
      return { ...prev, templates: m }
    })
  }
  const setProductionPrice = (id: number, value: number) => {
    setEdits((prev) => {
      const m = new Map(prev.productionItems)
      m.set(id, value)
      return { ...prev, productionItems: m }
    })
  }

  const dirtyCount = edits.templates.size + edits.productionItems.size

  const handleSave = async () => {
    if (dirtyCount === 0) return
    setSaving(true)
    setSaveMsg(null)
    try {
      const body = {
        templates: Array.from(edits.templates.entries()).map(([id, basePrice]) => ({
          id,
          basePrice,
        })),
        productionItems: Array.from(edits.productionItems.entries()).map(([id, baseCost]) => ({
          id,
          baseCost,
        })),
      }
      const res = await fetch('/api/admin/bulk-prices', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      })
      const result = await res.json()
      if (!res.ok && res.status !== 207) {
        setSaveMsg(`Error: ${result.error ?? res.statusText}`)
        setSaving(false)
        return
      }
      const updated = result.updated?.templates + result.updated?.productionItems
      setSaveMsg(`Saved ${updated} change(s).`)
      setEdits({ templates: new Map(), productionItems: new Map() })
    } catch (err) {
      setSaveMsg(`Network error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setEdits({ templates: new Map(), productionItems: new Map() })
    setSaveMsg(null)
  }

  return (
    <main style={main}>
      <header style={header}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Bulk price editor</h1>
          <p style={subtitle}>
            Edit the base prices Artbox invoices artists for. The Production
            Catalog section sets the per-SKU base cost (e.g. "Canvas 16×20 = $150");
            the Templates section sets each template&apos;s starting price.
            Artist sites add their own markup on top.
          </p>
        </div>
        <Link href="/admin" style={backLink}>
          ← Back to admin
        </Link>
      </header>

      <div style={toolbar}>
        <input
          type="search"
          placeholder="Filter by name, SKU, slug, material…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={searchInput}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {prettifyCategory(c)}
            </option>
          ))}
        </select>
        <label style={checkboxLabel}>
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          <span>Show inactive</span>
        </label>
        <div style={{ flex: 1 }} />
        <span style={dirtyLabel}>
          {dirtyCount === 0 ? 'No unsaved changes' : `${dirtyCount} unsaved change${dirtyCount === 1 ? '' : 's'}`}
        </span>
        {dirtyCount > 0 ? (
          <button type="button" onClick={handleReset} style={resetBtn} disabled={saving}>
            Reset
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleSave}
          style={dirtyCount === 0 ? saveBtnDisabled : saveBtn}
          disabled={dirtyCount === 0 || saving}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
      {saveMsg ? (
        <div style={saveMsg.startsWith('Error') || saveMsg.startsWith('Network') ? errMsgStyle : okMsgStyle}>
          {saveMsg}
        </div>
      ) : null}

      <section style={section}>
        <h2 style={sectionHeading}>
          Production catalog ({productionByCategory.reduce((acc, [, rows]) => acc + rows.length, 0)})
        </h2>
        <p style={sectionHelp}>
          Per-SKU base cost — the price for one finished unit. This is what Artbox
          invoices artists for that SKU. Sorted by area within each category so
          smaller sizes appear first.
        </p>
        {productionByCategory.map(([category, rows]) => (
          <div key={category} style={groupBlock}>
            <h3 style={groupHeading}>
              {prettifyCategory(category)}
              <span style={groupCount}>· {rows.length} SKU(s)</span>
            </h3>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>SKU</th>
                  <th style={th}>Name</th>
                  <th style={th}>Size</th>
                  <th style={th}>Material</th>
                  <th style={thRight}>Base cost</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const edited = edits.productionItems.get(p.id)
                  const value = edited ?? p.baseCost
                  const isDirty = edited !== undefined && edited !== p.baseCost
                  const sizeLabel =
                    p.widthIn && p.heightIn ? `${p.widthIn}×${p.heightIn}″` : '—'
                  return (
                    <tr key={p.id} style={isDirty ? trDirty : tr}>
                      <td style={tdMono}>{p.sku}</td>
                      <td style={td}>
                        {p.name}
                        {!p.isActive ? <span style={inactiveBadge}>inactive</span> : null}
                      </td>
                      <td style={tdMeta}>{sizeLabel}</td>
                      <td style={tdMeta}>{p.material || '—'}</td>
                      <td style={tdRight}>
                        <div style={priceInputWrap}>
                          <span style={dollarSign}>$</span>
                          <input
                            type="number"
                            step="0.01"
                            min={0}
                            value={value}
                            onChange={(e) => setProductionPrice(p.id, Number(e.target.value))}
                            style={priceInput}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
        {productionByCategory.length === 0 ? (
          <p style={emptyRow}>No production items match the current filter.</p>
        ) : null}
      </section>

      <section style={section}>
        <h2 style={sectionHeading}>Product templates ({filteredTemplates.length})</h2>
        <p style={sectionHelp}>
          Template base price — applies before any size/option modifiers. Most
          templates leave this at 0 because pricing is carried by the Production
          Catalog SKUs above.
        </p>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Template</th>
              <th style={th}>Category</th>
              <th style={th}>Slug</th>
              <th style={thRight}>Base price</th>
            </tr>
          </thead>
          <tbody>
            {filteredTemplates.map((t) => {
              const edited = edits.templates.get(t.id)
              const value = edited ?? t.basePrice
              const isDirty = edited !== undefined && edited !== t.basePrice
              return (
                <tr key={t.id} style={isDirty ? trDirty : tr}>
                  <td style={td}>{t.name}</td>
                  <td style={tdMeta}>{prettifyCategory(t.category)}</td>
                  <td style={tdMeta}>{t.slug}</td>
                  <td style={tdRight}>
                    <div style={priceInputWrap}>
                      <span style={dollarSign}>$</span>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={value}
                        onChange={(e) => setTemplatePrice(t.id, Number(e.target.value))}
                        style={priceInput}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
            {filteredTemplates.length === 0 ? (
              <tr>
                <td colSpan={4} style={emptyRow}>No templates match.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </main>
  )
}

function prettifyCategory(c: string): string {
  return c
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

// Inline styles — keep this page self-contained, no SCSS dep.
const main: React.CSSProperties = {
  maxWidth: 1100,
  margin: '32px auto',
  padding: '0 24px',
  fontFamily: 'inherit',
  color: '#111',
}
const header: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  marginBottom: 16,
}
const subtitle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#555',
  marginTop: 4,
  marginBottom: 0,
  maxWidth: 720,
  lineHeight: 1.5,
}
const backLink: React.CSSProperties = {
  color: '#1565c0',
  textDecoration: 'none',
  fontSize: '0.9rem',
  whiteSpace: 'nowrap',
  paddingTop: 6,
}
const toolbar: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 16px',
  background: '#fff',
  border: '1px solid #e0e0e0',
  borderRadius: 6,
  marginBottom: 16,
  position: 'sticky',
  top: 0,
  zIndex: 10,
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  flexWrap: 'wrap',
}
const searchInput: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #ccc',
  borderRadius: 4,
  fontSize: '0.9rem',
  minWidth: 200,
  flex: '0 1 240px',
}
const selectStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #ccc',
  borderRadius: 4,
  fontSize: '0.9rem',
  background: '#fff',
}
const checkboxLabel: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: '0.85rem',
  color: '#555',
  cursor: 'pointer',
}
const dirtyLabel: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#555',
}
const resetBtn: React.CSSProperties = {
  padding: '8px 14px',
  background: '#fff',
  border: '1px solid #ccc',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: '0.9rem',
}
const saveBtn: React.CSSProperties = {
  padding: '8px 16px',
  background: '#111',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 600,
}
const saveBtnDisabled: React.CSSProperties = {
  ...saveBtn,
  background: '#bbb',
  cursor: 'not-allowed',
}
const okMsgStyle: React.CSSProperties = {
  padding: '10px 14px',
  background: '#e8f5e9',
  border: '1px solid #a5d6a7',
  color: '#1b5e20',
  borderRadius: 4,
  marginBottom: 16,
  fontSize: '0.9rem',
}
const errMsgStyle: React.CSSProperties = {
  padding: '10px 14px',
  background: '#ffebee',
  border: '1px solid #ef9a9a',
  color: '#b71c1c',
  borderRadius: 4,
  marginBottom: 16,
  fontSize: '0.9rem',
}
const section: React.CSSProperties = {
  marginTop: 24,
  background: '#fff',
  border: '1px solid #e0e0e0',
  borderRadius: 6,
  padding: 20,
}
const sectionHeading: React.CSSProperties = {
  margin: 0,
  fontSize: '1.1rem',
  fontWeight: 600,
}
const sectionHelp: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#666',
  marginTop: 6,
  marginBottom: 16,
  lineHeight: 1.5,
}
const groupBlock: React.CSSProperties = {
  marginTop: 24,
  borderTop: '1px solid #eee',
  paddingTop: 16,
}
const groupHeading: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: '0.95rem',
  fontWeight: 600,
}
const groupCount: React.CSSProperties = {
  marginLeft: 6,
  color: '#999',
  fontSize: '0.8rem',
  fontWeight: 400,
}
const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.9rem',
}
const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: '2px solid #e0e0e0',
  fontWeight: 600,
  color: '#555',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: 0.4,
}
const thRight: React.CSSProperties = { ...th, textAlign: 'right' }
const tr: React.CSSProperties = {
  borderBottom: '1px solid #f0f0f0',
}
const trDirty: React.CSSProperties = {
  ...tr,
  background: '#fff8e1',
}
const td: React.CSSProperties = {
  padding: '8px 12px',
  verticalAlign: 'middle',
}
const tdMono: React.CSSProperties = {
  ...td,
  fontFamily: 'SFMono-Regular, Menlo, Consolas, monospace',
  fontSize: '0.85rem',
  color: '#444',
}
const tdMeta: React.CSSProperties = {
  ...td,
  color: '#888',
  fontSize: '0.85rem',
}
const tdRight: React.CSSProperties = { ...td, textAlign: 'right' }
const priceInputWrap: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
}
const dollarSign: React.CSSProperties = {
  color: '#666',
  fontSize: '0.85rem',
}
const priceInput: React.CSSProperties = {
  width: 96,
  padding: '6px 8px',
  border: '1px solid #ccc',
  borderRadius: 4,
  fontSize: '0.9rem',
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
}
const emptyRow: React.CSSProperties = {
  padding: '24px 12px',
  textAlign: 'center',
  color: '#888',
  fontSize: '0.9rem',
}
const inactiveBadge: React.CSSProperties = {
  marginLeft: 8,
  padding: '2px 6px',
  background: '#eee',
  color: '#888',
  fontSize: '0.7rem',
  borderRadius: 999,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
}
