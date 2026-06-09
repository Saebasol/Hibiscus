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

  useEffect(() => {
    const container = containerRef.current;
    if (!container || pages.length === 0 || viewerRef.current) {
      return;
    }

    const initialHash = typeof window === "undefined" ? "" : window.location.hash;
    const initialPageIndex = getHashPageIndex(initialHash, pages.length) ?? 0;

    viewerRef.current = createMangaViewer(container, {
      manga: {
        id: mangaId,
        title,
        author,
        pages
      },
      initialPageIndex,
      settings: {
        layoutMode: "browserFullscreen"
      },
      locale: "en",
      events: {
        pageChange: ({ pageIndex }) => {
          if (typeof window === "undefined") return;
          const nextHash = `#${pageIndex + 1}`;
          if (window.location.hash !== nextHash) {
            window.history.replaceState(null, "", nextHash);
            setHash(nextHash);
          }
        }
      }
    });
  }, [author, mangaId, title, pages]);

  useEffect(() => {
    return () => {
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!viewerRef.current) return;
    viewerRef.current.setManga({
      id: mangaId,
      title,
      author,
      pages
    });
  }, [author, mangaId, title, pages]);

  useEffect(() => {
    if (!viewerRef.current) return;
    const index = getHashPageIndex(hash, pages.length);
    if (index === null) return;
    viewerRef.current.goToPage(index);
  }, [hash, pages.length]);

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
        width: "100%"
      }}
      tabIndex={0}
    />
  );
};

export default Viewer;