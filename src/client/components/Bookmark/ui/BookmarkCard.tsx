import { Box, Card, Flex, Heading, Separator, Text, Link } from "@radix-ui/themes";
import type { RawInfoData } from "@saebasol/delphinium";
import type Bookmark from "../../../types/Bookmark";
import BookmarkThumbnail from "./Thumbnail";
import TagBadge from "../../Info/TagBadge";
import BookmarkDeleteButton from "./DeleteButton";
import { useEffect, useState } from "react";
import InfoDate from "../../Info/Date";
import BookmarkExportButton from "./ExportButton";

const BookmarkCard = ({ data, hideDelete, noURL }: { data: Bookmark, hideDelete?: boolean, noURL?: boolean }) => {
    const { date, id, items, name, description } = data;
    const [thumbnailUrl, setThumbnailUrl] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const firstItem: RawInfoData | null = items.length > 0 ? items[0] : null;
    const languages = new Set(data.items.map(e => e.language))
    const tags = [...new Set(data.items.map(e => e.tags).flat())].sort((a, b) => a.localeCompare(b));

    useEffect(() => {
        if (!firstItem?.id) return setLoading(false);

		// Run fetch
		(async () => {
			const req = await fetch(`/internal/thumbnail/${firstItem.id}`)
			const json = await req.json()
			setThumbnailUrl(json.url)
			setLoading(false)
		})()
    }, [])

    return <Box width="90%" pb="3">
        <Card size="3">
            <Flex gap="4">
                {/* Thumbnail implementation */}
                <Flex align="center" justify="center" style={{ flexShrink: 0 }}>
                    <BookmarkThumbnail thumbnail={thumbnailUrl} id={id} isLoading={isLoading} />
                </Flex>
                {/* Horizontal divider */}
                <Flex style={{width: "100%"}} direction="column" justify="between">
                    {/* Card info */}
                    <Flex gap="2" direction="column">
                        <Flex justify="between">
                            <Heading>
                                {noURL ? `${name} (${items.length} items)` : <Link href={`/bookmark/${id}`} underline="hover" >
                                {name} ({items.length} items)
                                </Link>}
                            </Heading>
                            <InfoDate date={date} />
                        </Flex>
                        {description ? <Text color="gray" size="2">{description}</Text> : ''}
                        <Separator style={{width: "100%"}}></Separator>
                        <Flex gap="2" align="baseline" maxWidth="90%" wrap="wrap">
                            <Text size="2" weight="medium">
                            Tags ({tags.length})
                            </Text>
                            {tags.map((e, i) => <TagBadge tag={e} key={i} />)}
                        </Flex>
                        <Flex gap="2" align="baseline" maxWidth="90%" wrap="wrap">
                            <Text size="2" weight="medium">
                            Language
                            </Text>
                            <Text size="2" color="gray">
                                {[...languages].map(e => e ? e.charAt(0).toUpperCase() + e.slice(1) : e)}
                            </Text>
                        </Flex>
                    </Flex>
                    <Flex justify="end" gap="2">
                        <BookmarkExportButton data={data} />
                        {!hideDelete ? <BookmarkDeleteButton data={data} /> : ""}
                    </Flex>
                </Flex>
            </Flex>
        </Card>
    </Box>
}

export default BookmarkCard