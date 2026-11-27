import { Cross1Icon } from "@radix-ui/react-icons";
import { Dialog, Flex, IconButton, RadioCards, ScrollArea, Spinner, Text } from "@radix-ui/themes";
import { useOpenSearchDialog, useSearchInputData } from "./context";
import SearchInput, { pattern } from "./Input";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { RawSearchResultData } from "@saebasol/delphinium";
import SearchResultItem from "./ResultItem";
import { searchUrl } from "../../utils/catalog";

const SearchDialog = () => {
  const navigate = useNavigate();
  const [openSearchDialog, setOpenSearchDialog] = useOpenSearchDialog();
  const [searchInputData, setSearchInputData] = useSearchInputData();
  const [searchResults, setSearchResults] = useState<RawSearchResultData | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    setSearchInputData({ title: "", tags: [] });
  }, [setSearchInputData]);

  useEffect(() => {
    const hasQuery = Boolean(searchInputData.title.trim() || searchInputData.tags.length > 0);
    if (!hasQuery) {
      setSearching(false);
      setSearchResults({ results: [], count: 0 });
      return;
    }

    const requestQuery = [...searchInputData.tags];
    if (searchInputData.title && !pattern.test(searchInputData.title)) {
      requestQuery.push(searchInputData.title);
    }

    const controller = new AbortController();
    setSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch('/internal/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: requestQuery,
            offset: 1,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json() as RawSearchResultData;
        if (!controller.signal.aborted) setSearchResults(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error during search:', error);
          setSearchResults({
            results: [],
            count: 0,
          });
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchInputData]);

  const hasResults = Boolean(searchResults?.results && searchResults.results.length > 0);

  return (
    <Dialog.Root open={openSearchDialog} onOpenChange={setOpenSearchDialog}>
      <Dialog.Content maxWidth={{
        "initial": "90vw",
        "md": "50vw",
      }} onPointerDownOutside={(e) => {
        const target = e.detail.originalEvent.target as Element | null;
        if (target?.closest?.('.tagify__dropdown')) {
          e.preventDefault();
        }
      }}>
        <Flex
          gap="4"
          direction="column"
        >
          <Flex
            width="100%"
            align="center"
            justify="between"
          >
            <Dialog.Title mb="0">Search</Dialog.Title>
            <IconButton
              aria-label="Close search"
              variant="ghost"
              size="2"
              onClick={() => setOpenSearchDialog(false)}
            >
              <Cross1Icon />
            </IconButton>
          </Flex>
          <SearchInput onSubmit={value => {
            setOpenSearchDialog(false);
            navigate(value ? searchUrl(value) : "/search");
          }} />
          <ScrollArea scrollbars="vertical" style={{ height: "50vh" }}>
            <RadioCards.Root
              columns={{ initial: "1", sm: "1" }}
              style={{
                justifyItems: "center",
                height: "100%",
                alignContent: hasResults ? "start" : "center",
              }}
            >
              {
                searching ? (
                  <Flex align="center" gap="2">
                    <Spinner size="2" />
                    <Text size="2" color="gray">Searching...</Text>
                  </Flex>
                ) : hasResults ? (
                  searchResults!.results.map((item) => (
                    <SearchResultItem
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      artist={item.artists.join(', ')}
                    />))
                ) : (
                  <Text color="gray">No results found</Text>
                )
              }
            </RadioCards.Root>
          </ScrollArea>
        </Flex>
      </Dialog.Content>
    </Dialog.Root >

  )
}

export default SearchDialog
