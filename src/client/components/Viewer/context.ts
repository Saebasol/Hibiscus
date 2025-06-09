import { create } from "../../utils/context";

export const useIsVisibleHeaderFooter = create(true)

export const useToggleViewerMode = create(
  typeof window !== "undefined" && window.localStorage.getItem("viewerMode") === "page"
)