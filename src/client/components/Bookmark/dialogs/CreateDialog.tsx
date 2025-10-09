import { BookmarkIcon } from "@radix-ui/react-icons"
import { Button, Dialog, Flex, TextField, Text } from "@radix-ui/themes"
import { useBookmarkActions } from "../hooks/context";
import { useRef, useState } from "react";

type ContentProps = {
    onClose?: () => void
}

export const BookmarkCreateDialogContent = ({ onClose }: ContentProps) => {
    const { create: createBookmark } = useBookmarkActions();
    const [showNameTooltip, setShowNameTooltip] = useState(false);

    const nameRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLInputElement>(null);
    
    const onCreateButton = () => {
        const name = nameRef.current?.value;
        const description = descriptionRef.current?.value;
        if (!name) {
            setShowNameTooltip(true);
            nameRef.current?.focus();
            return;
        }
        setShowNameTooltip(false);

        createBookmark(name, description);
        onClose?.();
        if (nameRef.current) nameRef.current.value = '';
        if (descriptionRef.current) descriptionRef.current.value = '';
    }

    return (
        <Dialog.Content maxWidth="450px">
            <Dialog.Title>Create bookmark</Dialog.Title>
            <Dialog.Description size="2" mb="4">
                Bookmark will only be saved to this browser.
            </Dialog.Description>
            <Flex direction="column" gap="3">
                <label>
                    <Text as="div" size="2" mb="1" weight="bold">
                        Name<Text color="red">*</Text>
                    </Text>
                    {showNameTooltip && (
                        <Text size="1" color="red" mb="1">Please enter a name</Text>
                    )}
                    <TextField.Root
                        ref={nameRef}
                        placeholder="Enter bookmark name"
                        onChange={() => setShowNameTooltip(false)}
                    />
                </label>
                <label>
                    <Text as="div" size="2" mb="1" weight="bold">
                        Description
                    </Text>
                    <TextField.Root
                        ref={descriptionRef}
                        placeholder="Enter the description of this Bookmark"
                    />
                </label>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                    <Button variant="soft" color="gray">Cancel</Button>
                </Dialog.Close>
                <Button color="blue" onClick={() => onCreateButton()}>Create</Button>
            </Flex>
        </Dialog.Content>
    )
}

const BookmarkCreateDialog = ({ trigger }: { trigger?: React.ReactNode }) => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            {trigger ? (
                <Dialog.Trigger>
                    {trigger}
                </Dialog.Trigger>
            ) : (
                <Dialog.Trigger>
                    <Button color="blue">
                        <BookmarkIcon /> Create bookmark
                    </Button>
                </Dialog.Trigger>
            )}
            <BookmarkCreateDialogContent onClose={() => setOpen(false)} />
        </Dialog.Root>
    )
}

export default BookmarkCreateDialog
