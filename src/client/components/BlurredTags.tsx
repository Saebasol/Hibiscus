import { createContext, useContext, useEffect, useState } from 'react'
import { Cross2Icon, EyeClosedIcon, EyeOpenIcon, PlusIcon } from '@radix-ui/react-icons'
import { Badge, Button, Dialog, Flex, IconButton, Switch, Text, TextField } from '@radix-ui/themes'
import type { Tags as HeliotropeTags } from '@saebasol/delphinium'
import { useTypedRouteContext } from '../utils/useRouteContext'

const BLUR_ALL_KEY = 'hibiscus.blurAll'
const BLURRED_TAGS_KEY = 'hibiscus.blurredTags'

interface BlurredTagsContextValue {
  tags: string[]
  blurAll: boolean
  error: string | null
  toggleBlurAll: (next?: boolean) => void
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

export function BlurredTagsProvider({ children }: { children: React.ReactNode }) {
  const { state } = useTypedRouteContext<unknown>()
  const userId = state.currentUser?.id
  const [tags, setTags] = useState<string[]>([])
  const [blurAll, setBlurAll] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setBlurAll(readLocalBlurAll())
  }, [])

  useEffect(() => {
    setError(null)
    if (!userId) {
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
  }, [userId])

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

  const addTag = async (raw: string) => {
    const tag = normalizeBlurTag(raw)
    if (!tag || tag.length > 200 || tags.includes(tag)) return
    setError(null)

    if (!userId) {
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

    if (!userId) {
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
    <BlurredTagsContext.Provider value={{ tags, blurAll, error, toggleBlurAll, addTag, removeTag }}>
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
  const { tags, blurAll, error, toggleBlurAll, addTag, removeTag } = useBlurredTags()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loadedSuggestions, setLoadedSuggestions] = useState(false)

  useEffect(() => {
    if (!open || loadedSuggestions) return
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
  }, [open, loadedSuggestions])

  const query = normalizeBlurTag(input)
  const matchingSuggestions = query.length >= 2
    ? suggestions.filter(item => item.includes(query) && !tags.includes(item)).slice(0, 10)
    : []
  const active = blurAll || tags.length > 0

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!query) return
    void addTag(query)
    setInput('')
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <IconButton
          size="2"
          variant="solid"
          color={active ? 'ruby' : 'gray'}
          aria-label="Thumbnail blur settings"
          title="Thumbnail blur settings"
        >
          {active ? <EyeClosedIcon /> : <EyeOpenIcon />}
        </IconButton>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="28rem">
        <Dialog.Title>Thumbnail blur</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          Blur thumbnails for works with matching tags, or blur all thumbnails at once.{' '}
          {state.currentUser ? 'Tag rules are saved to your account.' : 'Tag rules are saved in this browser.'}
        </Dialog.Description>

        <Flex direction="column" gap="4">
          <Flex asChild align="center" justify="between" gap="3">
            <label>
              <Text size="2" weight="medium">Blur all thumbnails</Text>
              <Switch checked={blurAll} onCheckedChange={checked => toggleBlurAll(checked)} />
            </label>
          </Flex>

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
