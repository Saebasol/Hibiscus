interface Dimensions {
  width: number
  height: number
}

export interface LazyImageProps {
  src: string
  alt: string
  index: number
  dimensions: Dimensions
  screenSize: Dimensions
}
export interface Image {
  url: string
  dimensions: Dimensions

}

export interface ImageRendererProps {
  image: Image
  index: number
}

