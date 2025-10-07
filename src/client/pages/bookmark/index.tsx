import { Box, Flex } from "@radix-ui/themes"
import { useBookmarkContext } from "../../components/Bookmark/context"
import BookmarkCreateButton from "../../components/Bookmark/BookmarkCreateButton";
import BookmarkCard from "../../components/Bookmark/BookmarkCard";

const Index = () => {
  const [bookmarks] = useBookmarkContext();

  return (
    <Box>
        <Flex align="end" justify="start" p="3" direction="column">
            <BookmarkCreateButton />
        </Flex>
        <Flex align="start" justify="start" p="3" direction="column">
            {bookmarks.length <= 0 ? <div className=""></div> : bookmarks.map((d, i) => <BookmarkCard key={i} data={d} />)}
        </Flex>
    </Box>
  )
}

export default Index