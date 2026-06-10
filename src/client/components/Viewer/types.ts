interface Dimensions {
  width: number
  height: number
}

export interface Image {
  url: string
  thumbnailUrl?: string
  dimensions: Dimensions
}

export interface ViewerProps {
  images: Image[]
  mangaId: string
  title: string
  author?: string
}

