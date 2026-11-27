import { developmentThumbnail } from "../../utils/developmentThumbnail"
import { EyeClosedIcon } from "@radix-ui/react-icons"
import { Button, IconButton, Link } from "@radix-ui/themes"
import { useState, useEffect, useRef } from "react"
import { matchBlurredTags, useBlurredTags } from "../BlurredTags"

const InfoThumbnail = ({ id, tags = [] }: { id: number; tags?: string[] }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(developmentThumbnail ?? null)
  const [revealed, setRevealed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { tags: blurredTags, blurAll } = useBlurredTags()
  const matchedTags = matchBlurredTags(tags, blurredTags)
  const shouldBlur = blurAll || matchedTags.length > 0
  const isBlurred = shouldBlur && !revealed

  useEffect(() => {
    setRevealed(false)
  }, [id])

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
      <Link href={`/viewer/${id}`} style={{ display: "block", width: "100%", height: "100%" }}>
        {thumbnailUrl && (
          <img
            alt="Thumbnail"
            loading="lazy"
            src={thumbnailUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: isBlurred ? "blur(1.25rem)" : "none",
              transform: isBlurred ? "scale(1.12)" : "scale(1)",
              transition: "filter 180ms ease, transform 180ms ease",
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
