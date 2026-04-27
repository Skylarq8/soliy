'use client'
import { useState, useTransition } from 'react'
import type { Category, CategoryField } from './page'
import { upsertCategory, deleteCategory } from './actions'

const FIELD_TYPES = ['text', 'number', 'select', 'boolean', 'date', 'tags'] as const

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

// ─── Tree node ───────────────────────────────────────────────
function CategoryNode({
  cat,
  children,
  depth,
  selected,
  onSelect,
}: {
  cat: Category
  children: React.ReactNode
  depth: number
  selected: boolean
  onSelect: (c: Category) => void
}) {
  const [open, setOpen] = useState(true)
  const hasChildren = !!children

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${
          selected ? 'bg-violet-600 text-white' : 'hover:bg-muted'
        }`}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
        onClick={() => onSelect(cat)}
      >
        {hasChildren && (
          <button
            onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
            className="text-xs opacity-60 hover:opacity-100 w-4"
          >
            {open ? '▾' : '▸'}
          </button>
        )}
        {!hasChildren && <span className="w-4" />}
        <span>{cat.icon}</span>
        <span className="flex-1 font-medium">{cat.name}</span>
        {!cat.is_active && <span className="text-xs opacity-50">нуусан</span>}
      </div>
      {hasChildren && open && <div className="mt-0.5">{children}</div>}
    </div>
  )
}

// ─── Field row editor ────────────────────────────────────────
function FieldRow({
  field,
  onChange,
  onRemove,
}: {
  field: CategoryField
  onChange: (f: CategoryField) => void
  onRemove: () => void
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <input
          className="flex-1 rounded-lg border border-border bg-background px-2 py-1 text-sm"
          value={field.label}
          placeholder="Монгол нэр"
          onChange={e => {
            const label = e.target.value
            onChange({ ...field, label, key: field.key || slugify(label) })
          }}
        />
        <select
          className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
          value={field.type}
          onChange={e => onChange({ ...field, type: e.target.value as CategoryField['type'] })}
        >
          {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <label className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
          <input
            type="checkbox"
            checked={field.required}
            onChange={e => onChange({ ...field, required: e.target.checked })}
          />
          Заавал
        </label>
        <button onClick={onRemove} className="text-red-400 hover:text-red-500 text-lg leading-none px-1">×</button>
      </div>

      <input
        className="w-full rounded-lg border border-border bg-background px-2 py-1 text-xs text-muted-foreground"
        value={field.placeholder ?? ''}
        placeholder="Placeholder текст (заавал биш)"
        onChange={e => onChange({ ...field, placeholder: e.target.value })}
      />

      {field.type === 'select' && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Сонголтууд (мөр бүр нэг утга)</p>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-2 py-1 text-xs"
            value={(field.options ?? []).join('\n')}
            placeholder="Утга 1&#10;Утга 2&#10;Утга 3"
            onChange={e => onChange({ ...field, options: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
          />
        </div>
      )}
    </div>
  )
}

// ─── Edit panel ───────────────────────────────────────────────
function EditPanel({
  category,
  allCategories,
  onSave,
  onDelete,
  onCancel,
  isNew,
}: {
  category: Category
  allCategories: Category[]
  onSave: (c: Category) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onCancel: () => void
  isNew: boolean
}) {
  const [form, setForm] = useState<Category>(category)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const update = (patch: Partial<Category>) => setForm(f => ({ ...f, ...patch }))

  const addField = () => update({
    fields: [...form.fields, { key: '', label: '', type: 'text', required: false }],
  })

  const updateField = (i: number, f: CategoryField) =>
    update({ fields: form.fields.map((x, idx) => idx === i ? f : x) })

  const removeField = (i: number) =>
    update({ fields: form.fields.filter((_, idx) => idx !== i) })

  const handleSave = () => {
    if (!form.id || !form.name) { setError('ID болон нэр оруулна уу'); return }
    setError('')
    startTransition(async () => {
      try { await onSave(form) } catch (e) { setError((e as Error).message) }
    })
  }

  const handleDelete = () => {
    if (!confirm(`"${form.name}" категорийг устгах уу?`)) return
    startTransition(async () => {
      try { await onDelete(form.id) } catch (e) { setError((e as Error).message) }
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <h2 className="font-semibold">{isNew ? 'Шинэ категори' : 'Категори засах'}</h2>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">ID (slug)</label>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono disabled:opacity-50"
              value={form.id}
              disabled={!isNew}
              onChange={e => update({ id: slugify(e.target.value) })}
              placeholder="skincare"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Дүрс (emoji)</label>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={form.icon}
              onChange={e => update({ icon: e.target.value })}
              placeholder="✨"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Монгол нэр</label>
          <input
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={form.name}
            onChange={e => update({ name: e.target.value })}
            placeholder="Арьс засал"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Эх категори</label>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={form.parent_id ?? ''}
              onChange={e => update({ parent_id: e.target.value || null })}
            >
              <option value="">— Эх категори байхгүй —</option>
              {allCategories
                .filter(c => c.id !== form.id)
                .map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)
              }
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Эрэмбэ</label>
            <input
              type="number"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={form.sort_order}
              onChange={e => update({ sort_order: Number(e.target.value) })}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={e => update({ is_active: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Идэвхтэй (хэрэглэгчид харагдана)</span>
        </label>

        {/* Fields editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">Талбарууд ({form.fields.length})</p>
            <button
              onClick={addField}
              className="text-xs text-violet-600 hover:text-violet-500 font-medium"
            >
              + Талбар нэмэх
            </button>
          </div>
          <div className="space-y-2">
            {form.fields.map((f, i) => (
              <FieldRow
                key={i}
                field={f}
                onChange={updated => updateField(i, updated)}
                onRemove={() => removeField(i)}
              />
            ))}
            {form.fields.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-xl">
                Талбар байхгүй байна
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-border flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={pending}
          className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Хадгалж байна…' : 'Хадгалах'}
        </button>
        {!isNew && (
          <button
            onClick={handleDelete}
            disabled={pending}
            className="rounded-xl border border-red-300 dark:border-red-800 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50 transition-colors"
          >
            Устгах
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────
export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [selected, setSelected] = useState<Category | null>(null)
  const [isNew, setIsNew] = useState(false)

  const roots = categories.filter(c => !c.parent_id)
  const childrenOf = (id: string) => categories.filter(c => c.parent_id === id)

  function renderTree(cats: Category[], depth = 0): React.ReactNode {
    return cats.map(cat => (
      <CategoryNode
        key={cat.id}
        cat={cat}
        depth={depth}
        selected={selected?.id === cat.id}
        onSelect={c => { setSelected(c); setIsNew(false) }}
      >
        {childrenOf(cat.id).length > 0 ? renderTree(childrenOf(cat.id), depth + 1) : null}
      </CategoryNode>
    ))
  }

  async function handleSave(cat: Category) {
    await upsertCategory(cat)
    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === cat.id)
      return idx >= 0 ? prev.map(c => c.id === cat.id ? cat : c) : [...prev, cat]
    })
    setSelected(cat)
    setIsNew(false)
  }

  async function handleDelete(id: string) {
    await deleteCategory(id)
    setCategories(prev => prev.filter(c => c.id !== id))
    setSelected(null)
  }

  const newCategory: Category = {
    id: '', name: '', parent_id: null, icon: '📦', fields: [], sort_order: categories.length + 1, is_active: true,
  }

  return (
    <div className="flex h-full">
      {/* Left — tree */}
      <div className="w-72 border-r border-border flex flex-col flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <h1 className="font-semibold text-sm">Категориуд</h1>
          <button
            onClick={() => { setSelected(newCategory); setIsNew(true) }}
            className="w-7 h-7 rounded-lg bg-violet-600 text-white text-lg leading-none flex items-center justify-center hover:bg-violet-700 transition-colors"
          >
            +
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {renderTree(roots)}
          {categories.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">Категори байхгүй байна</p>
          )}
        </div>
        <div className="px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">{categories.length} категори нийт</p>
        </div>
      </div>

      {/* Right — editor */}
      <div className="flex-1 overflow-hidden">
        {selected ? (
          <EditPanel
            key={selected.id + String(isNew)}
            category={selected}
            allCategories={categories}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={() => setSelected(null)}
            isNew={isNew}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-muted-foreground">
            <span className="text-5xl">🗂️</span>
            <p className="text-sm">Категори сонгох эсвэл шинэ нэмэх</p>
          </div>
        )}
      </div>
    </div>
  )
}
