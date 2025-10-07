import { useEffect } from "react";
import type Bookmark from "../../types/Bookmark";
import { create } from "../../utils/context";

const useBookmarkStorage = create<Bookmark[]>([]);

// Internal hook that uses the existing shared state implementation.
export const useBookmark = () => {
    const localStorageBookmark = typeof localStorage !== 'undefined' ? localStorage.getItem("bookmark") : null;
    const [bookmarks, setBookmarks] = useBookmarkStorage(localStorageBookmark ? JSON.parse(localStorageBookmark) : [] as Bookmark[]);

    useEffect(() => {
        try {
            localStorage.setItem("bookmark", JSON.stringify(bookmarks));
        } catch {
            // ignore
        }
    }, [bookmarks]);

    return [bookmarks, setBookmarks] as const;
};
