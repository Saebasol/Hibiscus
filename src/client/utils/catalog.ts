import type { RawTagsData } from '@saebasol/delphinium'
import type { TagData } from '@yaireo/tagify'

export const PAGE_SIZE = 15

export function plainQuery(tagify: Tagify<TagData>) {
  return Array.from(tagify.DOM.input.childNodes, node => {
    if (node instanceof HTMLElement && node.tagName === 'TAG') {
      const data = tagify.getSetTagData(node)
      return data && !data.__removed ? ' ' + data.value + ' ' : ''
    }
    return node.nodeName === 'BR' ? ' ' : node.textContent
  }).join('').replaceAll(/[\u200B\u2060\uFEFF]/g, '').replace(/\s+/g, ' ').trim()
}

const tagFields = {
  artist: 'artists', character: 'characters', group: 'groups', series: 'series',
  tag: 'tag', female: 'female', male: 'male', type: 'type', language: 'language',
} as const satisfies Record<string, keyof RawTagsData>

export function tagToken(token: string) {
  const match = /^(-?)(\w+):(.*)$/.exec(token)
  if (!match || !Object.hasOwn(tagFields, match[2])) return null
  const name = match[2] as keyof typeof tagFields
  return { field: tagFields[name], prefix: match[1] + name + ':', value: match[3] }
}

export function searchTerms(input: string) {
  const title: string[] = []
  const filters: string[] = []
  for (const word of input.trim().split(/\s+/)) {
    if (tagToken(word) || (word.startsWith('-') && word.length > 1)) filters.push(word)
    else if (word) title.push(word)
  }
  if (title.length) filters.push(title.join(' '))
  return filters
}

export function searchUrl(query: string, page = 1) {
  const params = new URLSearchParams({ q: query })
  if (page > 1) params.set('page', String(page))
  return '/search?' + params
}
