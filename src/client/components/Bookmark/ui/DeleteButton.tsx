import type Bookmark from "../../../types/Bookmark";
import BookmarkDeleteDialog from "../dialogs/DeleteDialog";

const BookmarkDeleteButton = ({ data }: { data: Bookmark }) => {
	return <BookmarkDeleteDialog data={data} />
}

export default BookmarkDeleteButton