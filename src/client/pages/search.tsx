import { Container, Flex, Heading, Text } from '@radix-ui/themes'
import type { RawSearchResultData } from '@saebasol/delphinium'
import { useNavigate } from 'react-router'
import SearchInput from '../components/SearchBar/Input'
import WorkList from '../components/WorkList'
import type { RouteContext, RouteError, ServerRouteContext } from '../types/RouteContext'
import { PAGE_SIZE, searchTerms, searchUrl } from '../utils/catalog'
import { useTypedRouteContext } from '../utils/useRouteContext'

interface SearchData extends RawSearchResultData {
  query: string
  page: number
  error?: RouteError
}

type Context = ServerRouteContext<{ Querystring: { q?: string; page?: string } }, SearchData>

export async function getData({ req, reply, server }: Context): Promise<SearchData> {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  const value = req.query.page ?? '1'
  const page = Number(value)
  const data: SearchData = { query, page, count: 0, results: [] }
  if (typeof value !== 'string' || !/^\d+$/.test(value) || !Number.isSafeInteger(page) || page < 1) {
    reply.code(404)
    return { ...data, error: { kind: 'invalid-page', firstPageUrl: searchUrl(query) } }
  }
  if (!query) return data
  const response = await server.inject({
    method: 'POST', url: '/internal/search', payload: { query: searchTerms(query), offset: page },
  })
  if (response.statusCode !== 200) {
    reply.code(502)
    return { ...data, error: { kind: 'unavailable', resource: 'search results', retryUrl: searchUrl(query, page) } }
  }
  const result = response.json<RawSearchResultData>()
  if (page > 1 && !result.results.length) {
    reply.code(404)
    return { ...data, error: { kind: 'invalid-page', firstPageUrl: searchUrl(query) } }
  }
  return { ...data, ...result }
}

export const getMeta = ({ data }: RouteContext<SearchData>) => ({
  title: data.query ? `${data.query} | Hibiscus` : 'Search | Hibiscus',
})

export default function Search() {
  const { data: { query, page, count, results } } = useTypedRouteContext<SearchData>()
  const navigate = useNavigate()
  const totalPages = Math.ceil(count / PAGE_SIZE)

  return (
    <main>
      <Container size="4" px="4" py={{ initial: '5', sm: '7' }}>
        <Flex direction="column" gap="5">
          <Heading size={{ initial: '7', sm: '8' }}>Search</Heading>
          <SearchInput
            key={query}
            query={query}
            onSubmit={value => navigate(value ? searchUrl(value) : '/search')}
          />
          {!query ? (
            <Text color="gray">Enter a title or a filter such as <code>artist:name</code>. Use <code>-tag:name</code> to exclude a tag.</Text>
          ) : !results.length ? (
            <Text>No works found for “{query}”.</Text>
          ) : (
            <Flex align="baseline" justify="between" wrap="wrap" gap="2">
              <Heading as="h2" size="4">Results for “{query}”</Heading>
              <Text size="2" color="gray">{count.toLocaleString('en-US')} {count === 1 ? 'work' : 'works'} · Page {page} of {totalPages}</Text>
            </Flex>
          )}
        </Flex>
        {results.length > 0 && (
          <WorkList
            mt="5"
            items={results}
            count={count}
            currentPage={page}
            onPageChange={next => navigate(searchUrl(query, next))}
            navLabel="Search result pages"
          />
        )}
      </Container>
    </main>
  )
}
