import Header from "../components/Header";
import Footer from "../components/Footer";
import { BookmarksProvider } from "../components/Bookmarks";
import { BlurredTagsProvider } from "../components/BlurredTags";


const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <BookmarksProvider>
      <BlurredTagsProvider>
        <Header />
        {children}
        <Footer />
      </BlurredTagsProvider>
    </BookmarksProvider>
  );
}

export default Layout