import React, { createContext, useContext, useEffect, useState } from 'react'
import { Pencil, RotateCcw } from 'lucide-react'
import { doc, getDoc, setDoc, deleteField } from 'firebase/firestore'
import { db } from '../firebase'

// Page copy lives in code as defaults; Firestore `pageContent/{page}` holds only
// the fields an admin has changed. A draft of `null` means "reset to default".
type Drafts = Record<string, string | null>

interface PageContentContextValue {
  saved: Record<string, string>
  drafts: Drafts
  loaded: boolean
  editing: boolean
  versions: Record<string, number>
  setDraft: (field: string, value: string) => void
  setActiveField: (field: string) => void
}

const PageContentContext = createContext<PageContentContextValue | null>(null)

interface PageContentProviderProps {
  page: string
  canEdit: boolean
  children: React.ReactNode
}

export const PageContentProvider: React.FC<PageContentProviderProps> = ({
  page,
  canEdit,
  children,
}) => {
  const [saved, setSaved] = useState<Record<string, string>>({})
  const [loaded, setLoaded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [drafts, setDrafts] = useState<Drafts>({})
  const [activeField, setActiveField] = useState<string | null>(null)
  // Bumped to remount a field when its text is replaced from outside (reset).
  const [versions, setVersions] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getDoc(doc(db, 'pageContent', page))
      .then((snap) => {
        if (snap.exists()) setSaved(snap.data() as Record<string, string>)
      })
      .catch((err) => console.error('Failed to load page content:', err))
      .finally(() => setLoaded(true))
  }, [page])

  const hasChanges = Object.keys(drafts).length > 0

  useEffect(() => {
    if (!hasChanges) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [hasChanges])

  const setDraft = (field: string, value: string) =>
    setDrafts((prev) => ({ ...prev, [field]: value }))

  const stopEditing = () => {
    setEditing(false)
    setDrafts({})
    setActiveField(null)
  }

  const handleSave = async () => {
    if (!hasChanges) {
      stopEditing()
      return
    }
    setSaving(true)
    try {
      const payload = Object.fromEntries(
        Object.entries(drafts).map(([field, value]) => [field, value ?? deleteField()]),
      )
      await setDoc(doc(db, 'pageContent', page), payload, { merge: true })
      setSaved((prev) => {
        const next = { ...prev }
        for (const [field, value] of Object.entries(drafts)) {
          if (value === null) delete next[field]
          else next[field] = value
        }
        return next
      })
      stopEditing()
    } catch (err) {
      console.error('Failed to save page content:', err)
      alert('Could not save your changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleResetField = () => {
    if (!activeField) return
    setDrafts((prev) => ({ ...prev, [activeField]: null }))
    setVersions((prev) => ({ ...prev, [activeField]: (prev[activeField] ?? 0) + 1 }))
  }

  const activeIsCustom =
    !!activeField &&
    (activeField in drafts ? drafts[activeField] !== null : activeField in saved)

  return (
    <PageContentContext.Provider
      value={{ saved, drafts, loaded, editing, versions, setDraft, setActiveField }}
    >
      {children}

      {canEdit && !editing && (
        <button
          onClick={() => setEditing(true)}
          className="btn-seal fixed bottom-6 right-6 z-50 shadow-lift"
        >
          <Pencil aria-hidden="true" className="w-4 h-4" />
          Edit page
        </button>
      )}

      {canEdit && editing && (
        <div
          role="region"
          aria-label="Page editing"
          className="fixed bottom-0 inset-x-0 z-50 bg-kinari border-t-2 border-t-shu shadow-lift"
        >
          <div className="max-w-page mx-auto px-gutter py-3 flex flex-wrap items-center gap-3">
            <p className="text-sm text-sumi-soft mr-auto">
              Editing — click any outlined text to change it.
            </p>
            <button
              onClick={handleResetField}
              disabled={!activeIsCustom || saving}
              className="btn-ghost disabled:opacity-40"
            >
              <RotateCcw aria-hidden="true" className="w-4 h-4" />
              Reset to original
            </button>
            <button onClick={stopEditing} disabled={saving} className="btn-ghost">
              Discard
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </PageContentContext.Provider>
  )
}

interface EditableTextProps {
  field: string
  children: string
  as?: React.ElementType
  className?: string
  multiline?: boolean
}

export const EditableText: React.FC<EditableTextProps> = ({
  field,
  children: defaultText,
  as: Tag = 'span',
  className = '',
  multiline = false,
}) => {
  const ctx = useContext(PageContentContext)
  if (!ctx) throw new Error('EditableText must be used inside PageContentProvider')

  const draft = ctx.drafts[field]
  const text =
    draft !== undefined ? (draft ?? defaultText) : (ctx.saved[field] ?? defaultText)

  if (!ctx.editing) {
    // Hidden until Firestore answers so visitors never see the old copy flash.
    return (
      <Tag
        className={`whitespace-pre-line transition-opacity duration-300 ${ctx.loaded ? '' : 'opacity-0'} ${className}`}
      >
        {text}
      </Tag>
    )
  }

  return (
    <EditingField
      key={`${field}-${ctx.versions[field] ?? 0}`}
      Tag={Tag}
      className={className}
      initialText={text}
      multiline={multiline}
      onFocus={() => ctx.setActiveField(field)}
      onChange={(value) => ctx.setDraft(field, value)}
    />
  )
}

interface EditingFieldProps {
  Tag: React.ElementType
  className: string
  initialText: string
  multiline: boolean
  onFocus: () => void
  onChange: (value: string) => void
}

// Uncontrolled on purpose: re-rendering a contentEditable's text moves the caret,
// so the DOM owns the text while editing and we only read it back out.
const EditingField: React.FC<EditingFieldProps> = ({
  Tag,
  className,
  initialText,
  multiline,
  onFocus,
  onChange,
}) => {
  const [initial] = useState(initialText)

  return (
    <Tag
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      role="textbox"
      aria-multiline={multiline}
      tabIndex={0}
      onFocus={onFocus}
      onInput={(e: React.FormEvent<HTMLElement>) => onChange(e.currentTarget.innerText)}
      // Stops links (e.g. CTA buttons) navigating while their label is edited.
      onClick={(e: React.MouseEvent) => e.preventDefault()}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) e.preventDefault()
      }}
      className={`whitespace-pre-wrap min-w-[2ch] cursor-text outline-dashed outline-1 outline-offset-4 outline-shu/60 hover:outline-shu focus:outline-2 focus:outline-shu ${className}`}
    >
      {initial}
    </Tag>
  )
}
