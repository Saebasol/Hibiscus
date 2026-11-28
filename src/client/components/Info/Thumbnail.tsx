import { developmentThumbnail } from "../../utils/developmentThumbnail"
import { EyeNoneIcon } from "@radix-ui/react-icons"
import { Link, Skeleton } from "@radix-ui/themes"
import { useState, useEffect, useRef } from "react"
import { matchBlurredTags, useBlurredTags } from "../BlurredTags"

const InfoThumbnail = ({ id, tags = [] }: { id: number; tags?: string[] }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(developmentThumbnail ?? null)
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null)
  const [hovered, setHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const { tags: blurredTags, blurAll } = useBlurredTags()
  const matchedTags = matchBlurredTags(tags, blurredTags)
  const shouldBlur = blurAll || matchedTags.length > 0
  const isBlurred = shouldBlur && !hovered
  const loaded = Boolean(thumbnailUrl && loadedUrl === thumbnailUrl)

  useEffect(() => {
    setHovered(false)
  }, [id])

  useEffect(() => {
    const img = imgRef.current
    if (thumbnailUrl && img?.complete && img.naturalWidth > 0) {
      setLoadedUrl(thumbnailUrl)
    }
  }, [thumbnailUrl])

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
    <div
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{
        position: "relative",
        width: "12.5rem",
        height: "17.5rem",
        borderRadius: "0.5rem",
        backgroundColor: "var(--gray-5)",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {!loaded && (
        <Skeleton width="100%" height="100%" style={{ position: "absolute", inset: 0 }} />
      )}
      <Link href={`/viewer/${id}`} style={{ display: "block", width: "100%", height: "100%" }}>
        {thumbnailUrl && (
          <img
            ref={imgRef}
            alt="Thumbnail"
            src={thumbnailUrl}
            onLoad={() => setLoadedUrl(thumbnailUrl)}
            onError={() => setLoadedUrl(thumbnailUrl)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: loaded ? 1 : 0,
              filter: isBlurred ? "blur(1.25rem)" : "none",
              transform: isBlurred ? "scale(1.12)" : "scale(1)",
              transition: "opacity 180ms ease, filter 180ms ease, transform 180ms ease",
            }}
          />
        )}
      </Link>
      {shouldBlur && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            opacity: isBlurred ? 0.65 : 0,
            transition: "opacity 180ms ease",
            zIndex: 1,
          }}
        >
          <EyeNoneIcon
            style={{
              width: "2.25rem",
              height: "2.25rem",
              color: "#fff",
              filter: "drop-shadow(0 0.125rem 0.5rem rgba(0, 0, 0, 0.55))",
            }}
          />
        </div>
      )}
    </div>
  )
}

export default InfoThumbnail
