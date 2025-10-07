import { BookmarkIcon } from "@radix-ui/react-icons"
import { Button, Dialog, Flex, TextField, Text } from "@radix-ui/themes"
import { useBookmark } from "./context";
import { useRef, useState } from "react";

const BookmarkCreateButton = () => {
    const [_bookmarks, setBookmarks] = useBookmark();
	const [showNameTooltip, setShowNameTooltip] = useState(false);
	const [showDialog, setDialog] = useState(false);

	const nameRef = useRef<HTMLInputElement>(null);
	const descriptionRef = useRef<HTMLInputElement>(null);
    
    const createBookmark = () => {
		const name = nameRef.current?.value;
		const description = descriptionRef.current?.value;
		if (!name) {
			setShowNameTooltip(true);
			nameRef.current?.focus();
			return;
		}
		setShowNameTooltip(false);

		// create and save bookmark to context
		const newBookmark = {
				id: Date.now(),
				name: name!,
				description: description || undefined,
				date: Date.now(),
				items: [] as any[],
		}
		setBookmarks((prev) => [...prev, newBookmark]);
		setDialog(false);
		// clear inputs
		if (nameRef.current) nameRef.current.value = '';
		if (descriptionRef.current) descriptionRef.current.value = '';
    }

    return (
		<Dialog.Root open={showDialog}>
			<Button color="blue" onClick={() => setDialog(true)}>
				<BookmarkIcon /> Create bookmark
			</Button>
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
					<Button variant="soft" color="gray" onClick={() => setDialog(false)}>Cancel</Button>
					<Button color="blue" onClick={() => createBookmark()}>Create</Button>
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	)
}

export default BookmarkCreateButton