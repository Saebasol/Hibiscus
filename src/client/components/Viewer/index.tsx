import type { ViewerProps } from "./types";
import PageViewer from "./PageViewer";
import ScrollViewer from "./ScrollViewer";
import { useToggleViewerMode } from "./context";


const Viewer = ({ images }: ViewerProps) => {
  const toggleViewerMode = useToggleViewerMode()[0]
  return (
    toggleViewerMode ? <PageViewer images={images} /> : <ScrollViewer images={images} />
  )
}

export default Viewer;