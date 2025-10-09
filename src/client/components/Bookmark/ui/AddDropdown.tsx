import { BookmarkIcon } from "@radix-ui/react-icons"
import { Button, DropdownMenu } from "@radix-ui/themes"
import { useState } from "react";
import type { RawInfoData } from "@saebasol/delphinium";
import { useBookmarkActions } from "../hooks/context";

type ContentProps = {
    onClose?: () => void
}

const BookmarkAddDropdownContent = ({ data, onClose }: ContentProps & { data: RawInfoData }) => {
    const {bookmarks, addItem } = useBookmarkActions();

    const bookmarkAdd = (id: number) => {
        addItem(id, data)
        onClose?.();
    }

    return (
        <DropdownMenu.Content>
        {bookmarks.map((e, i) => {
            return <DropdownMenu.Item key={i} onClick={() => bookmarkAdd(e.id)}>{e.name}</DropdownMenu.Item>
        })}
        </DropdownMenu.Content>
    )
}

const BookmarkAddDropdown = ({ trigger, data }: { trigger?: React.ReactNode, data: RawInfoData }) => {
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu.Root open={open} onOpenChange={setOpen}>
            {trigger ? (
                <DropdownMenu.Trigger>
                    {trigger}
                </DropdownMenu.Trigger>
            ) : (
                <DropdownMenu.Trigger>
                    <Button color="blue">
                        <BookmarkIcon />
                    </Button>
                </DropdownMenu.Trigger>
            )}
            <BookmarkAddDropdownContent onClose={() => setOpen(false)} data={data} />
        </DropdownMenu.Root>
    )
}

export default BookmarkAddDropdown
