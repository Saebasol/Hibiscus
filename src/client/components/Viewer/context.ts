import { useEffect, useState } from "react";
import { create } from "../../utils/context";

export const useIsVisibleHeaderFooter = create(true)

export const useToggleViewerMode = create(false)

export const useViewerModeWithLocalStorage = () => {
  const [viewerMode, setViewerMode] = useToggleViewerMode();
  const [isLoaded, setIsLoaded] = useState(false);

  // 초기 로드
  useEffect(() => {
    const savedMode = localStorage.getItem("viewerMode");
    if (savedMode !== null) {
      setViewerMode(savedMode === "page");
    }
    setIsLoaded(true);
  }, [setViewerMode]);

  // 로드 완료 후 상태 변경 시에만 저장
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("viewerMode", viewerMode ? "page" : "normal");
    }
  }, [viewerMode, isLoaded]);

  return [viewerMode, setViewerMode] as const;
}