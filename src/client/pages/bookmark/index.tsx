import { Box, Flex, Spinner, Text } from "@radix-ui/themes"
import { useBookmark } from "../../components/Bookmark/hooks/context"
import BookmarkCreateButton from "../../components/Bookmark/ui/CreateButton";
import BookmarkImportButton from "../../components/Bookmark/ui/ImportButton"
import BookmarkCard from "../../components/Bookmark/ui/BookmarkCard";

const Index = () => {
  const [bookmarks, , isLoaded] = useBookmark();

  // Show spinner while loading
  if (!isLoaded) {
    return (
      <Flex align="center" justify="center" height="80vh">
        <Spinner size="3" />
      </Flex>
    );
  }

  return (
    <Box>
        <Flex align="center" justify="start" p="3" pt="0" direction="column">
                <Flex gap="2" width="90%">
                    <BookmarkCreateButton />
                    <BookmarkImportButton />
                </Flex>
        </Flex>
        {bookmarks.length <= 0 ? (
          <Flex align="center" justify="center" pl="3" pr="3" pb="3" direction="column" height="80vh">
            <Text size="4" color="gray">
              Bookmark not found, wanna try make one?
            </Text>
          </Flex>
        ) : (
          <Flex align="center" justify="start" pl="3" pr="3" pb="3" direction="column">
            {bookmarks.map((d, i) => <BookmarkCard key={i} data={d} />)}
          </Flex>
        )}
    </Box>
  )
}

export default Index