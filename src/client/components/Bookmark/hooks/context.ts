import { useEffect, useState } from "react";
import type Bookmark from "../../../types/Bookmark";
import { create } from "../../../utils/context";
import type { RawInfoData } from "@saebasol/delphinium";

const useBookmarkStorage = create<Bookmark[]>([]);

// Internal hook that uses the existing shared state implementation.
export const useBookmark = () => {
    const [bookmarks, setBookmarks] = useBookmarkStorage();
    const [isLoaded, setIsLoaded] = useState(false);
    
    useEffect(() => {
        const localStorageBookmark = typeof localStorage !== 'undefined' ? localStorage.getItem("bookmark") : null;
        if (localStorageBookmark !== null) {
            setBookmarks(localStorageBookmark ? JSON.parse(localStorageBookmark) : [] as Bookmark[])
        } else {
            setBookmarks([] as Bookmark[])
        }
        
        setIsLoaded(true);
    }, [setBookmarks]);

    useEffect(() => {
        if (isLoaded) localStorage.setItem("bookmark", JSON.stringify(bookmarks));
    }, [bookmarks, isLoaded]);

    return [bookmarks, setBookmarks, isLoaded] as const;
};

export const useBookmarkActions = () => {
  const [bookmarks, setBookmarks, isLoaded] = useBookmark()
  
  return {
    bookmarks,
    isLoaded,
    
    create: (name: string, description?: string) => {
      const newBookmark: Bookmark = {
        id: bookmarks.length + 1,
        name,
        description,
        date: Date.now(),
        items: [],
      }
      setBookmarks((prev) => [...prev, newBookmark])
      return newBookmark
    },
    
    remove: (id: number) => {
      setBookmarks((prev) => {
        const index = prev.findIndex((value) => value.id === id)
        if (index !== -1) {
          const updated = [...prev]
          updated.splice(index, 1)
          return updated
        }
        return prev
      })
    },
    
    update: (id: number, updates: Partial<Bookmark>) => {
      setBookmarks((prev) => prev.map((b) => 
        b.id === id ? { ...b, ...updates } : b
      ))
    },
    
    addItem: (bookmarkId: number, item: RawInfoData) => {
      setBookmarks((prev) => prev.map((bookmark) => {
        if (bookmark.id === bookmarkId) {
          return {
            ...bookmark,
            items: [...bookmark.items, item],
          }
        }
        return bookmark
      }))
    },
    
    removeItem: (bookmarkId: number, itemId: number) => {
      setBookmarks((prev) => prev.map((bookmark) => {
        if (bookmark.id === bookmarkId) {
          return {
            ...bookmark,
            items: bookmark.items.filter((item) => item.id !== itemId),
          }
        }
        return bookmark
      }))
    },
    
    find: (id: number) => {
      return bookmarks.find((b) => b.id === id)
    },
  }
}