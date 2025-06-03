const InfoThumbnail = ({ thumbnail }: { thumbnail: string }) => {
  return (
    <img
      src={`https://api.saebasol.org/api/proxy/${encodeURIComponent(thumbnail)}`}
      alt="Thumbnail"
      style={{
        width: "200px",
        height: "280px",
        objectFit: "cover",
        borderRadius: "8px",
        backgroundColor: "var(--gray-5)",
      }}
    />
  )
}

export default InfoThumbnail
