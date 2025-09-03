import { Cross1Icon } from "@radix-ui/react-icons";
import { Dialog, Flex, IconButton, RadioCards, ScrollArea, Text, VisuallyHidden } from "@radix-ui/themes";
import { useOpenSearchDialog, useSearchInputData } from "./context";
import SearchInput, { pattern } from "./Input";
import { useEffect, useState } from "react";
import type { RawSearchResultData } from "@saebasol/delphinium";
import SearchResultItem from "./ResultItem";

const SearchDialog = () => {
  const [openSearchDialog, setOpenSearchDialog] = useOpenSearchDialog();
  const [searchInputData, setSearchInputData] = useSearchInputData();
  const [searchResults, setSearchResults] = useState<RawSearchResultData | null>(null);

  useEffect(() => {
    setSearchInputData({ title: "", tags: [] });
  }, [setSearchInputData]);

  const performSearch = async () => {
    if (!searchInputData.title.trim() && searchInputData.tags.length === 0) {
      setSearchResults({
        result: [],
        count: 0,
      });
      return;
    }

    const query = [
      ...searchInputData.tags,
    ]

    if (searchInputData.title && !pattern.test(searchInputData.title)) {
      query.push(searchInputData.title);
    }

    try {
      const response = await fetch('/internal/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          offset: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json() as RawSearchResultData
      setSearchResults(data);


    } catch (error) {
      console.error('Error during search:', error);
      setSearchResults({
        result: [],
        count: 0,
      });
    }
  };

  useEffect(() => {
    performSearch();
  }, [searchInputData]);

  return (
    <Dialog.Root open={openSearchDialog} onOpenChange={setOpenSearchDialog}>
      <Dialog.Content maxWidth={{
        "initial": "90vw",
        "md": "50vw",
      }}>
        <VisuallyHidden>
          <Dialog.Title>
            Search the works
          </Dialog.Title>
        </VisuallyHidden>
        <Flex
          gap="4"
          direction="column"
        >
          <Flex
            width="100%"
            justify="end"
          >
            <IconButton
              variant="ghost"
              size="2"
              onClick={() => setOpenSearchDialog(false)}
            >
              <Cross1Icon />
            </IconButton>
          </Flex>
          <SearchInput />
          <ScrollArea scrollbars="vertical" style={{ height: "50vh" }}>
            <RadioCards.Root
              columns={{ initial: "1", sm: "1" }}
              style={{
                justifyItems: "center",
                height: "100%",
                alignContent: "center",
              }}
            >
              {
                searchResults?.result && searchResults.result.length > 0 ?
                  searchResults.result.map((item) => (
                    <SearchResultItem
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      artist={item.artists.join(', ')}
                    />))
                  : <Text>No results found</Text>
              }
            </RadioCards.Root>
          </ScrollArea>
        </Flex>
      </Dialog.Content>
    </Dialog.Root >

  )
}

export default SearchDialog