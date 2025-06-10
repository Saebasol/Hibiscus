import { Link } from "@radix-ui/themes"

const InfoThumbnail = ({ thumbnail, id }: { thumbnail: string, id: number }) => {
  return (
    <Link href={`/viewer/${id}`}>
      <img
        loading="lazy"
        src={"https://heliotrope.saebasol.org/api/proxy/" + encodeURIComponent(thumbnail)}
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
