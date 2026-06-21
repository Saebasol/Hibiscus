import { Link, Skeleton, Text } from "@radix-ui/themes"

const thumbnailStyle = {
  width: "12.5rem",
  height: "17.5rem",
  objectFit: "cover",
  overflow: "hidden",
  borderRadius: "8px",
  backgroundColor: "var(--gray-5)",
} as const;

const BookmarkThumbnail = ({ thumbnail, id, isLoading }: { thumbnail: string | null, id: number, isLoading: boolean }) => {
  return (
    <Link href={`/bookmark/${id}`} style={thumbnailStyle}>
      {isLoading ? <Skeleton style={thumbnailStyle} /> : thumbnail ? <img
        loading="lazy"
        alt="Thumbnail"
        src={thumbnail}
        width="100%"
        height="100%"
      /> : <div style={{width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}><Text>Thumbnail</Text></div>}
    </Link>
  )
}

export default BookmarkThumbnail
