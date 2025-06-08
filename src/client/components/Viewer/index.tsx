import type { ViewerProps } from "./types";
import PageViewer from "./PageViewer";
import ScrollViewer from "./ScrollViewer";


const Viewer = ({ images }: ViewerProps) => {
  return (
    true ? <PageViewer images={images} /> : <ScrollViewer images={images} />
  )
}

export default Viewer;