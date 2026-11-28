import type { ReactNode } from 'react';
import { BookmarksProvider } from '../components/Bookmarks';
import { BlurredTagsProvider } from '../components/BlurredTags';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <BookmarksProvider>
      <BlurredTagsProvider>
        {children}
      </BlurredTagsProvider>
    </BookmarksProvider>
  );
}

export default Layout;