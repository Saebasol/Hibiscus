import { TrashIcon } from "@radix-ui/react-icons"
import { Button, Dialog, Flex, Tooltip } from "@radix-ui/themes"
import { useBookmarkActions } from "../hooks/context";
import { useState } from "react";
import type Bookmark from "../../../types/Bookmark";

type ContentProps = {
    onClose?: () => void
}

const BookmarkDeleteDialogContent = ({ data, onClose }: ContentProps & { data: Bookmark }) => {
    const { id, name } = data;
    const { remove } = useBookmarkActions();
    
    const onDeleteButton = () => {
        remove(id);
        onClose?.()
    }

    return (
            <Dialog.Content maxWidth="450px">
                <Dialog.Title>Confirmation</Dialog.Title>
                <Dialog.Description size="2" mb="4">
                    Are you sure you want to delete this bookmark <strong>{name}</strong>?<br />
                    This action is <strong>unrecoverable!</strong>
                </Dialog.Description>
                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">Cancel</Button>
                    </Dialog.Close>
                    <Button color="red" onClick={() => onDeleteButton()}>Yes, do it</Button>
                </Flex>
            </Dialog.Content>
    )
}

const BookmarkDeleteDialog = ({ trigger, data }: { trigger?: React.ReactNode, data: Bookmark }) => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            {trigger ? (
                <Dialog.Trigger>
                    {trigger}
                </Dialog.Trigger>
            ) : (
                <Dialog.Trigger>
                    <Tooltip content="Delete bookmark">
                        <Button color="red" onClick={() => setOpen(true)}>
                            <TrashIcon />
                        </Button>
                    </Tooltip>
                </Dialog.Trigger>
            )}
            <BookmarkDeleteDialogContent onClose={() => setOpen(false)} data={data} />
        </Dialog.Root>
    )
}

export default BookmarkDeleteDialog
