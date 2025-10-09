import { useEffect, useState } from 'react'
//@ts-ignore
import { useRouteContext } from '@fastify/react/client'
import { Flex, Spinner } from '@radix-ui/themes'

import { useBookmark } from '../../components/Bookmark/hooks/context'
import BookmarkCard from '../../components/Bookmark/ui/BookmarkCard'
import type Bookmark from '../../types/Bookmark'

//@ts-ignore
export const getData = async ctx => {
  return {
    result: ctx.req.params.id,
  }
}

const Index = () => {
  const { data }: { data: { result: string } } = useRouteContext()
  const [bookmarks, _setBookmarks] = useBookmark()
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);

  useEffect(() => {
    const found = bookmarks.find((b: any) => b.id == parseInt(data.result));
    if (found) setBookmark(found);
  }, [bookmarks])

  return (
    <Flex align="center" justify="start" p="3" direction="column">
        {bookmark ? <BookmarkCard data={bookmark!} hideDelete={true} noURL={true} /> : <Spinner />}
    </Flex>
  )
}

export default Index
