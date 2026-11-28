import { developmentThumbnail } from "../../utils/developmentThumbnail"
import { EyeClosedIcon } from "@radix-ui/react-icons"
import { Button, IconButton, Link, Skeleton } from "@radix-ui/themes"
import { useState, useEffect, useRef } from "react"
import { matchBlurredTags, useBlurredTags } from "../BlurredTags"

const InfoThumbnail = ({ id, tags = [] }: { id: number; tags?: string[] }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(developmentThumbnail ?? null)
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const { tags: blurredTags, blurAll } = useBlurredTags()
  const matchedTags = matchBlurredTags(tags, blurredTags)
  const shouldBlur = blurAll || matchedTags.length > 0
  const isBlurred = shouldBlur && !revealed
  const loaded = Boolean(thumbnailUrl && loadedUrl === thumbnailUrl)

  useEffect(() => {
    setRevealed(false)
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
      {isBlurred && (
        <Button
          type="button"
          size="1"
          variant="solid"
          color="gray"
          aria-label="Reveal blurred thumbnail"
          onClick={() => setRevealed(true)}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1,
          }}
        >
          <EyeClosedIcon />
          {matchedTags.length > 0 ? `${matchedTags.length} tag${matchedTags.length > 1 ? "s" : ""}` : "Blurred"}
        </Button>
      )}
      {shouldBlur && revealed && (
        <IconButton
          type="button"
          size="1"
          variant="solid"
          color="gray"
          aria-label="Blur thumbnail"
          title="Blur thumbnail"
          onClick={() => setRevealed(false)}
          style={{
            position: "absolute",
            top: "0.5rem",
            right: "0.5rem",
            zIndex: 1,
          }}
        >
          <EyeClosedIcon />
        </IconButton>
      )}
    </div>
  )
}

export default InfoThumbnail
