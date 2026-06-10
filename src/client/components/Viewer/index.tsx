import { useEffect, useMemo, useRef, useState } from "react";
import { createMangaViewer } from "@yui540/comimi";
import type { ViewerProps } from "./types";

const getHashPageIndex = (hashValue: string, totalPages: number) => {
  if (!hashValue) return null;
  const raw = Number(hashValue.replace("#", ""));
  if (!Number.isFinite(raw) || raw < 1) return null;
  const clamped = Math.min(raw, totalPages);
  return clamped - 1;
};

const Viewer = ({ images, mangaId, title, author }: ViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ReturnType<typeof createMangaViewer> | null>(null);
  const [hash, setHash] = useState("");
  const currentPageIndexRef = useRef<number | null>(null);

  const pages = useMemo(() => {
    return images.map((image, index) => ({
      id: `${mangaId}-${index}`,
      type: "image" as const,
      src: image.url,
      thumbnailSrc: image.thumbnailUrl ?? image.url,
      width: image.dimensions.width,
      height: image.dimensions.height,
      alt: `page-${index + 1}`,
      label: String(index + 1)
    }));
  }, [images, mangaId]);

  // 1. Viewer Initialization & Mount
  // - Creates the comimi viewer instance and attaches it to the DOM container.
  // - Reads the URL hash (#) on initial load to render the corresponding page.
  // - Registers an event listener to update the URL hash whenever the page turns.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || pages.length === 0 || viewerRef.current) {
      return;
    }

    const initialHash = typeof window === "undefined" ? "" : window.location.hash;
    const initialPageIndex = getHashPageIndex(initialHash, pages.length) ?? 0;

    currentPageIndexRef.current = initialPageIndex;
    
    viewerRef.current = createMangaViewer(container, {
      manga: {
        id: mangaId,
        title,
        author,
        pages
      },
      initialPageIndex,
      settings: {
        layoutMode: "browserFullscreen",
        backgroundColor: "black",
      },
      locale: "en",
      events: {
        pageChange: ({ pageIndex }) => {
          currentPageIndexRef.current = pageIndex;
          if (typeof window === "undefined") return;
          
          const nextHash = `#${pageIndex + 1}`;
          if (window.location.hash !== nextHash) {
            window.history.replaceState(null, "", nextHash);
            setHash(nextHash);
          }
        }
      }
    });
    
    container.focus();
  }, [author, mangaId, title, pages]);

  // 2. Viewer Instance Cleanup
  // - Destroys the viewer instance when the component unmounts to prevent memory leaks.
  useEffect(() => {
    return () => {
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, []);

  // 3. Manga Data Synchronization
  // - Updates the viewer's internal data (title, author, pages) when props change,
  //   without completely recreating the viewer instance.
  useEffect(() => {
    if (!viewerRef.current) return;
    viewerRef.current.setManga({
      id: mangaId,
      title,
      author,
      pages
    });
  }, [author, mangaId, title, pages]);

  // 4. Programmatic Navigation
  // - Forces the viewer to navigate to the target page when the 'hash' state changes.
  // - Only triggers if the target page differs from the current page to prevent infinite loops.
  useEffect(() => {
    if (!viewerRef.current) return;
    const index = getHashPageIndex(hash, pages.length);
    if (index === null) return;

    if (currentPageIndexRef.current !== index) {
      viewerRef.current.goToPage(index);
      currentPageIndexRef.current = index;
    }
  }, [hash, pages.length]);

  // 5. Browser History Tracking
  // - Listens for 'hashchange' events triggered by the browser's 'Back' or 'Forward' buttons.
  // - Synchronizes the React 'hash' state, which subsequently triggers the navigation effect (Hook 4).
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    setHash(window.location.hash);
    
    const handleHashChange = () => {
      setHash(window.location.hash);
    };
    
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        height: "100vh",
        width: "100%",
        outline: "none"
      }}
      tabIndex={0}
    />
  );
};

export default Viewer;