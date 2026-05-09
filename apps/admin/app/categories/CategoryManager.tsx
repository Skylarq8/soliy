'use client'
import { useState, useTransition } from 'react'
import { Plus, ChevronDown, ChevronRight, GripVertical, Trash2, X, Check, AlertCircle, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import type { Category, CategoryField } from './page'
import { upsertCategory, deleteCategory, seedDefaultCategories } from './actions'
import { Badge } from '@/components/ui/badge'

const FIELD_TYPES = ['text', 'number', 'select', 'boolean', 'date', 'tags'] as const
type FieldType = typeof FIELD_TYPES[number]

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text:    'Text',
  number:  'Number',
  select:  'Select',
  boolean: 'Toggle',
  date:    'Date',
  tags:    'Tags',
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

// ─── Category Tree Node ───────────────────────────────────────────────────────
function CategoryNode({
  cat, depth, selected, onSelect, hasChildren, children,
}: {
  cat: Category
  depth: number
  selected: boolean
  onSelect: (c: Category) => void
  hasChildren: boolean
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <div
        onClick={() => onSelect(cat)}
        className={[
          'flex items-center gap-2 py-2 pr-3 rounded-xl cursor-pointer transition-all text-sm select-none',
          selected
            ? 'bg-violet-500/12 border border-violet-500/20 text-violet-300'
            : 'hover:bg-[hsl(var(--surface))] text-[hsl(var(--foreground))] border border-transparent',
        ].join(' ')}
        style={{ paddingLeft: `${12 + depth * 18}px` }}
      >
        <button
          onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
          className={`w-4 h-4 flex items-center justify-center flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity ${!hasChildren ? 'invisible' : ''}`}
        >
          {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
        <span className="text-base leading-none">{cat.icon}</span>
        <span className="flex-1 font-medium truncate">{cat.name}</span>
        {!cat.is_active && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] bg-[hsl(var(--surface))] px-1.5 py-0.5 rounded-full">
            hidden
          </span>
        )}
        <span className="text-xs text-[hsl(var(--muted-foreground))]">{cat.fields.length}f</span>
      </div>
      {hasChildren && open && <div className="mt-0.5">{children}</div>}
    </div>
  )
}

// ─── Field Row ────────────────────────────────────────────────────────────────
function FieldRow({
  field, index, onChange, onRemove,
}: {
  field: CategoryField
  index: number
  onChange: (f: CategoryField) => void
  onRemove: () => void
}) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-3.5 space-y-3 group">
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-[hsl(var(--muted-foreground))] opacity-40 cursor-grab flex-shrink-0" />
        <input
          className="flex-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background-2,var(--background)))] px-2.5 py-1.5 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all"
          value={field.label}
          placeholder="Field name"
          onChange={e => {
            const label = e.target.value
            onChange({ ...field, label, key: field.key || slugify(label) })
          }}
        />
        <select
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background-2,var(--background)))] px-2 py-1.5 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
          value={field.type}
          onChange={e => onChange({ ...field, type: e.target.value as CategoryField['type'] })}
        >
          {FIELD_TYPES.map(t => (
            <option key={t} value={t}>{FIELD_TYPE_LABELS[t]}</option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-xs cursor-pointer whitespace-nowrap">
          <div
            onClick={() => onChange({ ...field, required: !field.required })}
            className={[
              'w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer',
              field.required
                ? 'bg-violet-600 border-violet-600'
                : 'border-[hsl(var(--border))]',
            ].join(' ')}
          >
            {field.required && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
          </div>
          <span className="text-[hsl(var(--muted-foreground))]">Required</span>
        </label>
        <button
          onClick={onRemove}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <input
        className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background-2,var(--background)))] px-2.5 py-1.5 text-xs text-[hsl(var(--muted-foreground))] placeholder:text-[hsl(var(--muted-foreground))]/60 focus:outline-none focus:border-violet-500/60 transition-all"
        value={field.placeholder ?? ''}
        placeholder="Placeholder text (optional)"
        onChange={e => onChange({ ...field, placeholder: e.target.value })}
      />

      {field.key && (
        <p className="text-[10px] font-mono text-[hsl(var(--muted-foreground))] opacity-60">
          key: {field.key}
        </p>
      )}

      {field.type === 'select' && (
        <div className="space-y-1">
          <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">Options (one per line)</p>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background-2,var(--background)))] px-2.5 py-1.5 text-xs font-mono text-[hsl(var(--foreground))] resize-none focus:outline-none focus:border-violet-500/60 transition-all"
            value={(field.options ?? []).join('\n')}
            placeholder={"Option 1\nOption 2\nOption 3"}
            onChange={e => onChange({ ...field, options: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
          />
        </div>
      )}
    </div>
  )
}

// ─── Edit Panel ───────────────────────────────────────────────────────────────
function EditPanel({
  category, allCategories, onSave, onDelete, onCancel, isNew,
}: {
  category: Category
  allCategories: Category[]
  onSave: (c: Category) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onCancel: () => void
  isNew: boolean
}) {
  const [form, setForm] = useState<Category>(category)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const update = (patch: Partial<Category>) => setForm(f => ({ ...f, ...patch }))

  const addField = () =>
    update({ fields: [...form.fields, { key: '', label: '', type: 'text', required: false }] })

  const updateField = (i: number, f: CategoryField) =>
    update({ fields: form.fields.map((x, idx) => idx === i ? f : x) })

  const removeField = (i: number) =>
    update({ fields: form.fields.filter((_, idx) => idx !== i) })

  function handleSave() {
    if (!form.id.trim()) { setError('Category ID is required'); return }
    if (!form.name.trim()) { setError('Category name is required'); return }
    setError('')
    startTransition(async () => {
      try {
        await onSave(form)
        toast.success(isNew ? 'Category created' : 'Category saved')
      } catch (e) {
        setError((e as Error).message)
        toast.error('Failed to save')
      }
    })
  }

  function handleDelete() {
    if (!showDeleteConfirm) { setShowDeleteConfirm(true); return }
    startTransition(async () => {
      try {
        await onDelete(form.id)
        toast.success('Category deleted')
      } catch (e) {
        setError((e as Error).message)
        toast.error('Failed to delete')
      }
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))] flex-shrink-0">
        <div>
          <h2 className="font-semibold">{isNew ? 'New Category' : 'Edit Category'}</h2>
          {!isNew && <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono mt-0.5">{form.id}</p>}
        </div>
        <button onClick={onCancel} className="w-7 h-7 rounded-lg flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface))] transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Basic info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              ID (slug)
            </label>
            <input
              className="input-base font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              value={form.id}
              disabled={!isNew}
              onChange={e => update({ id: slugify(e.target.value) })}
              placeholder="skincare"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              Icon (emoji)
            </label>
            <input
              className="input-base text-2xl"
              value={form.icon}
              onChange={e => update({ icon: e.target.value })}
              placeholder="✨"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
            Display Name
          </label>
          <input
            className="input-base"
            value={form.name}
            onChange={e => update({ name: e.target.value })}
            placeholder="Skin Care"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              Parent Category
            </label>
            <select
              className="input-base cursor-pointer"
              value={form.parent_id ?? ''}
              onChange={e => update({ parent_id: e.target.value || null })}
            >
              <option value="">— Top Level —</option>
              {allCategories
                .filter(c => c.id !== form.id)
                .map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              Sort Order
            </label>
            <input
              type="number"
              className="input-base"
              value={form.sort_order}
              onChange={e => update({ sort_order: Number(e.target.value) })}
            />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => update({ is_active: !form.is_active })}
            className={[
              'relative w-10 h-5.5 rounded-full transition-all cursor-pointer flex-shrink-0',
              'h-[22px]',
              form.is_active ? 'bg-violet-600' : 'bg-[hsl(var(--muted))]',
            ].join(' ')}
          >
            <div className={[
              'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all',
              form.is_active ? 'left-[22px]' : 'left-0.5',
            ].join(' ')} />
          </div>
          <div>
            <p className="text-sm font-medium">Active</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Visible to users in the app</p>
          </div>
        </label>

        {/* Fields */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold">Category Fields</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {form.fields.length} field{form.fields.length !== 1 ? 's' : ''} defined
              </p>
            </div>
            <button
              onClick={addField}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-medium hover:bg-violet-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Field
            </button>
          </div>

          <div className="space-y-2.5">
            {form.fields.map((f, i) => (
              <FieldRow
                key={i}
                field={f}
                index={i}
                onChange={updated => updateField(i, updated)}
                onRemove={() => removeField(i)}
              />
            ))}
            {form.fields.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-[hsl(var(--border))] text-center">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">No fields yet</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 opacity-60">
                  Add fields to define what data sellers fill out
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panel footer */}
      <div className="flex items-center gap-3 px-5 py-4 border-t border-[hsl(var(--border))] flex-shrink-0">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving…' : (isNew ? 'Create Category' : 'Save Changes')}
        </button>
        {!isNew && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className={[
              'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50',
              showDeleteConfirm
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'border border-red-500/30 text-red-400 hover:bg-red-500/10',
            ].join(' ')}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {showDeleteConfirm ? 'Confirm Delete' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [selected, setSelected]     = useState<Category | null>(null)
  const [isNew, setIsNew]           = useState(false)
  const [seeding, startSeed]        = useTransition()

  async function handleSeed() {
    startSeed(async () => {
      try {
        await seedDefaultCategories()
        toast.success('Default categories added — refreshing…')
        // Reload page to get fresh data from server
        window.location.reload()
      } catch (e) {
        toast.error((e as Error).message)
      }
    })
  }

  const roots      = categories.filter(c => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order)
  const childrenOf = (id: string) => categories.filter(c => c.parent_id === id).sort((a, b) => a.sort_order - b.sort_order)

  function renderTree(cats: Category[], depth = 0): React.ReactNode {
    return cats.map(cat => {
      const kids = childrenOf(cat.id)
      return (
        <CategoryNode
          key={cat.id}
          cat={cat}
          depth={depth}
          selected={selected?.id === cat.id}
          hasChildren={kids.length > 0}
          onSelect={c => { setSelected(c); setIsNew(false) }}
        >
          {kids.length > 0 ? renderTree(kids, depth + 1) : undefined}
        </CategoryNode>
      )
    })
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
    id: '', name: '', parent_id: null, icon: '📦',
    fields: [], sort_order: categories.length + 1, is_active: true,
  }

  return (
    <div className="flex h-full">
      {/* Left: tree */}
      <div className="w-72 border-r border-[hsl(var(--border))] flex flex-col flex-shrink-0 bg-[hsl(var(--surface))]">
        <div className="flex items-center justify-between px-4 py-4 border-b border-[hsl(var(--border))]">
          <div>
            <h1 className="text-sm font-semibold">Categories</h1>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{categories.length} total</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSeed}
              disabled={seeding}
              title="Add default categories"
              className="w-7 h-7 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-violet-400 hover:border-violet-500/40 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setSelected(newCategory); setIsNew(true) }}
              className="w-7 h-7 rounded-lg bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No categories</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 opacity-60">Create your first category</p>
            </div>
          ) : (
            renderTree(roots)
          )}
        </div>
      </div>

      {/* Right: edit panel */}
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
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-[hsl(var(--muted-foreground))]">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--surface))] border border-[hsl(var(--border))] flex items-center justify-center text-3xl">
              🗂️
            </div>
            <div>
              <p className="text-sm font-medium">Select a category</p>
              <p className="text-xs mt-1 opacity-70">Or create a new one using the + button</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
