import type { ViewerProps } from "./types";
import PageViewer from "./PageViewer";
import ScrollViewer from "./ScrollViewer";
import { useViewerModeWithLocalStorage } from "./context";


const Viewer = ({ images }: ViewerProps) => {
  const toggleViewerMode = useViewerModeWithLocalStorage()[0];
  return (
    toggleViewerMode ? <PageViewer images={images} /> : <ScrollViewer images={images} />
  )
}

export default Viewer;