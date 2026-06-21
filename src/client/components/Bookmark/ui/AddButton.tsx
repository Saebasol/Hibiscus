import BookmarkCreateDialog from '../dialogs/CreateDialog'
import { useBookmark } from "../hooks/context";
import { BookmarkIcon } from "@radix-ui/react-icons";
import BookmarkAddDropdown from "./AddDropdown";
import { IconButton } from '@radix-ui/themes';
import type { RawInfoData } from '@saebasol/delphinium';

const BookmarkAddButton = ({ data }: { data: RawInfoData }) => {
    const [bookmark] = useBookmark();

    return (
        bookmark.length > 0 ? <BookmarkAddDropdown trigger={<IconButton color="blue"><BookmarkIcon /></IconButton>} data={data} /> : <BookmarkCreateDialog trigger={<BookmarkIcon />}/>
    )
}

export default BookmarkAddButton