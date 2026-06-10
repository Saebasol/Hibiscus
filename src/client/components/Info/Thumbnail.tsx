import { Link } from "@radix-ui/themes"
import { useState, useEffect } from "react"

const InfoThumbnail = ({ id }: { id: number }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

  const fetchThumbnail = async () => {
    const response = await fetch(`/internal/thumbnail/${id}`)
    if (response.ok) {
      const data = await response.json()
      if (data?.url) {
        setThumbnailUrl(data.url)
      }
    }
  }

  useEffect(() => {
    fetchThumbnail()
  }, [id])

  return (
    <Link href={`/viewer/${id}`}>
      <div
        style={{
          width: "12.5rem",
          height: "17.5rem",
          borderRadius: "8px",
          backgroundColor: "var(--gray-5)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {thumbnailUrl && (
          <img
            alt="Thumbnail"
            src={thumbnailUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
      </div>
    </Link>
  )
}

export default InfoThumbnail
