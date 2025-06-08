import { Link } from "@radix-ui/themes"

const InfoThumbnail = ({ thumbnail, id }: { thumbnail: string, id: number }) => {
  return (
    <Link href={`/viewer/${id}`}>
      <img
        loading="lazy"
        alt="Thumbnail"
        style={{
          width: "12.5rem",
          height: "17.5rem",
          objectFit: "cover",
          borderRadius: "8px",
          backgroundColor: "var(--gray-5)",
        }}
      />
    </Link>

  )
}

export default InfoThumbnail
