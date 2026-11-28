import { createContext, useContext, useEffect, useState } from 'react'
import { Cross2Icon, PlusIcon } from '@radix-ui/react-icons'
import { Badge, Button, Dialog, Flex, Switch, Text, TextField } from '@radix-ui/themes'
import type { Tags as HeliotropeTags } from '@saebasol/delphinium'
import { useTypedRouteContext } from '../utils/useRouteContext'

const BLUR_ALL_KEY = 'hibiscus.blurAll'
const BLURRED_TAGS_KEY = 'hibiscus.blurredTags'
const SYNC_BLURRED_TAGS_KEY = 'hibiscus.syncBlurredTags'

interface BlurredTagsContextValue {
  tags: string[]
  blurAll: boolean
  syncEnabled: boolean
  error: string | null
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  toggleBlurAll: (next?: boolean) => void
  toggleSync: (next?: boolean) => Promise<void>
  addTag: (tag: string) => Promise<void>
  removeTag: (tag: string) => Promise<void>
}

const BlurredTagsContext = createContext<BlurredTagsContextValue | null>(null)

export function normalizeBlurTag(value: string): string {
  return value.trim().toLowerCase()
}

export function matchBlurredTags(workTags: string[], rules: string[]): string[] {
  if (!workTags.length || !rules.length) return []
  const normalizedRules = rules.map(normalizeBlurTag).filter(Boolean)
  if (!normalizedRules.length) return []

  const matched: string[] = []
  for (const workTag of workTags) {
    const normalizedWorkTag = normalizeBlurTag(workTag)
    const isMatch = normalizedRules.some(rule =>
      normalizedWorkTag === rule ||
      (!rule.includes(':') && (
        normalizedWorkTag === `female:${rule}` ||
        normalizedWorkTag === `male:${rule}` ||
        normalizedWorkTag === `tag:${rule}`
      ))
    )
    if (isMatch) matched.push(workTag)
  }
  return matched
}

function readLocalBlurAll(): boolean {
  try {
    return localStorage.getItem(BLUR_ALL_KEY) === 'true'
  } catch {
    return false
  }
}

function readLocalBlurredTags(): string[] {
  try {
    const raw = localStorage.getItem(BLURRED_TAGS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return Array.from(new Set(parsed.filter((item): item is string => typeof item === 'string').map(normalizeBlurTag).filter(Boolean)))
  } catch {
    return []
  }
}

function writeLocalBlurredTags(tags: string[]): void {
  try {
    localStorage.setItem(BLURRED_TAGS_KEY, JSON.stringify(tags))
  } catch {
    // Storage is optional.
  }
}

function tagBadgeColor(tag: string): 'ruby' | 'blue' | 'gray' {
  if (tag.startsWith('female:')) return 'ruby'
  if (tag.startsWith('male:')) return 'blue'
  return 'gray'
}

function readLocalSyncPreference(): boolean {
  if (typeof localStorage === 'undefined') return true
  try {
    return localStorage.getItem(SYNC_BLURRED_TAGS_KEY) !== 'false'
  } catch {
    return true
  }
}

export function BlurredTagsProvider({ children }: { children: React.ReactNode }) {
  const { state } = useTypedRouteContext<unknown>()
  const userId = state.currentUser?.id
  const [tags, setTags] = useState<string[]>([])
  const [blurAll, setBlurAll] = useState(false)
  const [syncEnabled, setSyncEnabled] = useState(true)
  const [storageReady, setStorageReady] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const shouldSyncToAccount = Boolean(userId && syncEnabled)

  useEffect(() => {
    setBlurAll(readLocalBlurAll())
    setSyncEnabled(readLocalSyncPreference())
    setStorageReady(true)
  }, [])

  useEffect(() => {
    if (!storageReady) return
    setError(null)
    if (!shouldSyncToAccount) {
      setTags(readLocalBlurredTags())
      return
    }

    let active = true
    fetch('/internal/blurred-tags', { headers: { accept: 'application/json' } })
      .then(async response => {
        if (response.status === 401) {
          if (active) {
            window.location.assign('/login?returnTo=' + encodeURIComponent(window.location.pathname + window.location.search))
          }
          return
        }
        if (!response.ok) throw new Error('Failed to load blurred tags')
        const payload = await response.json() as { tags: string[] }
        if (active) setTags(payload.tags)
      })
      .catch(() => {
        if (active) setError('Blurred tag settings could not be loaded.')
      })
    return () => { active = false }
  }, [storageReady, shouldSyncToAccount])

  const toggleBlurAll = (next?: boolean) => {
    setBlurAll(current => {
      const updated = next ?? !current
      try {
        localStorage.setItem(BLUR_ALL_KEY, String(updated))
      } catch {
        // Storage is optional.
      }
      return updated
    })
  }

  const toggleSync = async (next?: boolean) => {
    const updated = next ?? !syncEnabled
    setSyncEnabled(updated)
    try {
      localStorage.setItem(SYNC_BLURRED_TAGS_KEY, String(updated))
    } catch {
      // Storage is optional.
    }
    if (!userId) return
    setError(null)
    if (!updated) {
      const local = readLocalBlurredTags()
      if (local.length === 0 && tags.length > 0) {
        writeLocalBlurredTags(tags)
      }
      return
    }
    const local = readLocalBlurredTags()
    if (local.length === 0) return
    try {
      let latest: string[] | null = null
      for (const tag of local) {
        const response = await fetch('/internal/blurred-tags', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ tag }),
        })
        if (response.status === 401) {
          window.location.assign('/login?returnTo=' + encodeURIComponent(window.location.pathname + window.location.search))
          return
        }
        if (!response.ok) throw new Error('Failed to sync blurred tags')
        const payload = await response.json() as { tags: string[] }
        latest = payload.tags
      }
      if (latest) setTags(latest)
    } catch {
      setError('Could not sync blurred tags with your account.')
    }
  }

  const addTag = async (raw: string) => {
    const tag = normalizeBlurTag(raw)
    if (!tag || tag.length > 200 || tags.includes(tag)) return
    setError(null)

    if (!shouldSyncToAccount) {
      const updated = [...tags, tag]
      setTags(updated)
      writeLocalBlurredTags(updated)
      return
    }

    try {
      const response = await fetch('/internal/blurred-tags', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tag }),
      })
      if (response.status === 401) {
        window.location.assign('/login?returnTo=' + encodeURIComponent(window.location.pathname + window.location.search))
        return
      }
      if (!response.ok) throw new Error('Failed to add blurred tag')
      const payload = await response.json() as { tags: string[] }
      setTags(payload.tags)
    } catch {
      setError('Could not save blurred tag. Please try again.')
    }
  }

  const removeTag = async (raw: string) => {
    const tag = normalizeBlurTag(raw)
    if (!tag) return
    setError(null)

    if (!shouldSyncToAccount) {
      const updated = tags.filter(entry => entry !== tag)
      setTags(updated)
      writeLocalBlurredTags(updated)
      return
    }

    try {
      const response = await fetch('/internal/blurred-tags/' + encodeURIComponent(tag), {
        method: 'DELETE',
      })
      if (response.status === 401) {
        window.location.assign('/login?returnTo=' + encodeURIComponent(window.location.pathname + window.location.search))
        return
      }
      if (!response.ok) throw new Error('Failed to remove blurred tag')
      const payload = await response.json() as { tags: string[] }
      setTags(payload.tags)
    } catch {
      setError('Could not remove blurred tag. Please try again.')
    }
  }

  return (
    <BlurredTagsContext.Provider value={{
      tags,
      blurAll,
      syncEnabled,
      error,
      dialogOpen,
      setDialogOpen,
      toggleBlurAll,
      toggleSync,
      addTag,
      removeTag,
    }}>
      {children}
    </BlurredTagsContext.Provider>
  )
}

export function useBlurredTags() {
  const context = useContext(BlurredTagsContext)
  if (!context) throw new Error('useBlurredTags must be used inside BlurredTagsProvider')
  return context
}

export function BlurredTagsDialog() {
  const { state } = useTypedRouteContext<unknown>()
  const { tags, blurAll, syncEnabled, error, dialogOpen, setDialogOpen, toggleBlurAll, toggleSync, addTag, removeTag } = useBlurredTags()
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loadedSuggestions, setLoadedSuggestions] = useState(false)

  useEffect(() => {
    if (!dialogOpen || loadedSuggestions) return
    const controller = new AbortController()
    fetch('/internal/tags', { signal: controller.signal, cache: 'force-cache' })
      .then(async response => {
        if (!response.ok) return
        const data = await response.json() as Partial<HeliotropeTags>
        const combined = [
          ...(data.female ?? []).map(item => `female:${item}`),
          ...(data.male ?? []).map(item => `male:${item}`),
          ...(data.tag ?? []).map(item => `tag:${item}`),
        ]
        if (!controller.signal.aborted) {
          setSuggestions(Array.from(new Set(combined.map(normalizeBlurTag))))
          setLoadedSuggestions(true)
        }
      })
      .catch(() => {
        // Manual tag input works even when autocomplete tags cannot be fetched.
      })
    return () => controller.abort()
  }, [dialogOpen, loadedSuggestions])

  const query = normalizeBlurTag(input)
  const matchingSuggestions = query.length >= 2
    ? suggestions.filter(item => item.includes(query) && !tags.includes(item)).slice(0, 10)
    : []

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!query) return
    void addTag(query)
    setInput('')
  }

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      <Dialog.Content maxWidth="28rem">
        <Dialog.Title>Thumbnail blur</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          <span key={blurAll ? 'blur-all' : 'blur-tags'}>
            {blurAll
              ? 'All thumbnails are currently blurred. Hover over a thumbnail to preview it. '
              : 'Only thumbnails matching your blocked tags are blurred. Hover over a blurred thumbnail to preview it. '}
          </span>
          <span key={state.currentUser && syncEnabled ? 'sync-on' : 'sync-off'}>
            {state.currentUser && syncEnabled
              ? `Blocked tags sync with your ${state.authProviderName} account.`
              : 'Blocked tags are saved in this browser only.'}
          </span>
        </Dialog.Description>

        <Flex direction="column" gap="4">
          <Flex asChild align="center" justify="between" gap="3">
            <label>
              <Flex direction="column" gap="1">
                <Text size="2" weight="medium">Blur all thumbnails</Text>
                <Text size="1" color="gray">
                  <span key={blurAll ? 'all' : 'tags'}>
                    {blurAll
                      ? 'Every thumbnail is blurred regardless of tags'
                      : 'Only works matching your blocked tags are blurred'}
                  </span>
                </Text>
              </Flex>
              <Switch checked={blurAll} onCheckedChange={checked => toggleBlurAll(checked)} />
            </label>
          </Flex>

          {state.authEnabled && state.currentUser && (
            <Flex asChild align="center" justify="between" gap="3">
              <label>
                <Flex direction="column" gap="1">
                  <Text size="2" weight="medium">Sync blocked tags with account</Text>
                  <Text size="1" color="gray">
                    <span key={syncEnabled ? 'on' : 'off'}>
                      {syncEnabled
                        ? `Synced with your ${state.authProviderName} account`
                        : 'Saved in this browser only (not synced)'}
                    </span>
                  </Text>
                </Flex>
                <Switch checked={syncEnabled} onCheckedChange={checked => void toggleSync(checked)} />
              </label>
            </Flex>
          )}

          <form onSubmit={handleSubmit}>
            <Flex gap="2" align="center">
              <TextField.Root
                style={{ flex: 1 }}
                value={input}
                onChange={event => setInput(event.target.value)}
                placeholder="e.g. female:guro or guro"
                aria-label="Tag to blur"
              />
              <Button type="submit" variant="solid" disabled={!query}>
                <PlusIcon /> Add
              </Button>
            </Flex>
          </form>

          {matchingSuggestions.length > 0 && (
            <Flex gap="1" wrap="wrap">
              {matchingSuggestions.map(suggestion => (
                <Button
                  key={suggestion}
                  type="button"
                  size="1"
                  variant="soft"
                  color={tagBadgeColor(suggestion)}
                  onClick={() => {
                    void addTag(suggestion)
                    setInput('')
                  }}
                >
                  + {suggestion}
                </Button>
              ))}
            </Flex>
          )}

          {error && (
            <Text size="2" color="ruby" role="alert">{error}</Text>
          )}

          <Flex gap="2" wrap="wrap">
            {tags.length === 0 ? (
              <Text size="2" color="gray">No blurred tags configured.</Text>
            ) : (
              tags.map(tag => (
                <Badge key={tag} size="2" variant="soft" color={tagBadgeColor(tag)}>
                  <Flex align="center" gap="1">
                    <span>{tag}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${tag}`}
                      onClick={() => void removeTag(tag)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                        color: 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      <Cross2Icon />
                    </button>
                  </Flex>
                </Badge>
              ))
            )}
          </Flex>

          <Flex justify="end">
            <Dialog.Close>
              <Button type="button" variant="soft" color="gray">Close</Button>
            </Dialog.Close>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
