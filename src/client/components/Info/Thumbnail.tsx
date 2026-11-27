import { developmentThumbnail } from "../../utils/developmentThumbnail"
import { Link } from "@radix-ui/themes"
import { useState, useEffect, useRef } from "react"

const InfoThumbnail = ({ id }: { id: number }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(developmentThumbnail ?? null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = containerRef.current
    if (developmentThumbnail || !element) return

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect()
          const res = await fetch(`/internal/thumbnail/${id}`)
          const data = await res.json()
          setThumbnailUrl(data.url)
        }
      },
      { rootMargin: "25% 0%" }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [id])

  return (
    <Link href={`/viewer/${id}`}>
      <div
        ref={containerRef}
        style={{
          width: "12.5rem",
          height: "17.5rem",
          borderRadius: "0.5rem",
          backgroundColor: "var(--gray-5)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {thumbnailUrl && (
          <img
            alt="Thumbnail"
            loading="lazy"
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
