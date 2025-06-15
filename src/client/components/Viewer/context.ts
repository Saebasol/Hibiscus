import { useEffect, useState } from "react";
import { create } from "../../utils/context";

export const useIsVisibleHeaderFooter = create(true)

export const useToggleViewerMode = create(false)

export const useViewerModeWithLocalStorage = () => {
  const [viewerMode, setViewerMode] = useToggleViewerMode();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("viewerMode");
    if (savedMode !== null) {
      setViewerMode(savedMode === "page");
    }
    setIsLoaded(true);
  }, [setViewerMode]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("viewerMode", viewerMode ? "page" : "normal");
    }
  }, [viewerMode, isLoaded]);

  return [viewerMode, setViewerMode] as const;
}