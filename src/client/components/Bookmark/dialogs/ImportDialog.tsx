import { DownloadIcon, UploadIcon } from "@radix-ui/react-icons"
import { Button, Dialog, Flex, Text, Card, Separator, Progress } from "@radix-ui/themes"
import { useRef, useState } from "react";
import type Bookmark from "../../../types/Bookmark";
import { validateBookmarkData } from "../utils/validator";
import { useBookmarkActions } from "../hooks/context";

type ContentProps = {
    onClose?: () => void
}

export const BookmarkImportDialogContent = ({ onClose }: ContentProps) => {
    const { create: createBookmark, addItem } = useBookmarkActions();

    const [isImporting, setImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);

    const [isDragging, setIsDragging] = useState(false);
    const [bookmarkData, setBookmarkData] = useState<Bookmark | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            setError('Please upload a JSON file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            
            // Validate the bookmark data
            const validation = validateBookmarkData(content);
            if (!validation.valid) {
                setError(validation.error || 'Invalid bookmark data');
                return;
            }

            try {
                const json = JSON.parse(content);
                setBookmarkData(json as Bookmark);
                setError(null);
            } catch (err) {
                setError('Failed to parse JSON file');
                console.error(err);
            }
        };

        reader.onerror = () => {
            setError('Failed to read file');
        };

        reader.readAsText(file);
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }

    const handleDragLeave = () => {
        setIsDragging(false);
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    }

    const handleImport = async () => {
        if (!bookmarkData) return;

        setImporting(true);
        setImportProgress(0);

        try {
            // Create the bookmark first
            const createdBookmark = createBookmark(bookmarkData.name, bookmarkData.description);
            
            // Import items with progress tracking
            const totalItems = bookmarkData.items.length;
            for (let index = 0; index < totalItems; index++) {
                // Update progress
                setImportProgress(((index + 1) / totalItems) * 100);
                
                // Add item to bookmark
                addItem(createdBookmark.id, bookmarkData.items[index]);
                
                // Small delay to allow UI to update (optional, can be removed for faster import)
                await new Promise(resolve => setTimeout(resolve, 10));
            }

            // Small delay to show 100% completion
            await new Promise(resolve => setTimeout(resolve, 300));
            
            onClose?.();
        } catch (err) {
            console.error('Import failed:', err);
            setError('Failed to import bookmark');
        } finally {
            setImporting(false);
            setImportProgress(0);
            setBookmarkData(null);
        }
    }

    const handleCancel = () => {
        setBookmarkData(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose?.();
    }

    return (
        <Dialog.Content maxWidth="500px">
            <Dialog.Title>Import bookmark</Dialog.Title>
            <Dialog.Description size="2" mb="4">
                Upload a bookmark JSON file to import.
            </Dialog.Description>

            {!bookmarkData ? (
                <Flex direction="column" gap="3">
                    {/* Drag & Drop Area */}
                    <Card
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        style={{
                            padding: '2rem',
                            border: isDragging ? '2px dashed var(--accent-9)' : '2px dashed var(--gray-7)',
                            backgroundColor: isDragging ? 'var(--accent-2)' : 'var(--gray-2)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'center',
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Flex direction="column" gap="2" align="center" justify="center">
                            <UploadIcon width="32" height="32" style={{ opacity: 0.5 }} />
                            <Text size="3" weight="medium">
                                {isDragging ? 'Drop your file here' : 'Drag & drop JSON file here'}
                            </Text>
                            <Text size="2" color="gray">
                                or click to browse
                            </Text>
                        </Flex>
                    </Card>

                    {/* Hidden File Input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,application/json"
                        style={{ display: 'none' }}
                        onChange={handleFileInput}
                    />

                    {error && (
                        <Text size="2" color="red">
                            {error}
                        </Text>
                    )}
                </Flex>
            ) : (
                <Flex direction="column" gap="3">
                    {/* Preview Section */}
                    <Card style={{ padding: '1rem', backgroundColor: 'var(--gray-2)' }}>
                        <Flex direction="column" gap="2">
                            <Text size="2" weight="bold" color="gray">
                                Preview
                            </Text>
                            <Separator size="4" />
                            <Flex direction="column" gap="1">
                                <Text size="2">
                                    <Text weight="bold">Name:</Text> {bookmarkData.name}
                                </Text>
                                {bookmarkData.description && (
                                    <Text size="2">
                                        <Text weight="bold">Description:</Text> {bookmarkData.description}
                                    </Text>
                                )}
                                <Text size="2">
                                    <Text weight="bold">Items:</Text> {bookmarkData.items.length} item(s)
                                </Text>
                                <Text size="1" color="gray">
                                    Created: {new Date(bookmarkData.date).toLocaleString()}
                                </Text>
                            </Flex>
                        </Flex>
                    </Card>
                    {/* Importing Progress */}
                    {isImporting && (
                        <Card style={{ padding: '1rem' }}>
                            <Flex direction="column" gap="3">
                                <Text size="2" weight="bold">
                                    Importing bookmark...
                                </Text>
                                <Progress value={importProgress} max={100} />
                                <Text size="1" color="gray" align="center">
                                    {Math.round(importProgress)}% complete
                                </Text>
                            </Flex>
                        </Card>
                    )}

                    <Flex gap="3" mt="2" justify="end">
                        <Button 
                            variant="soft" 
                            color="gray" 
                            onClick={handleCancel}
                            disabled={isImporting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            color="blue" 
                            onClick={handleImport}
                            disabled={isImporting}
                        >
                            <DownloadIcon /> {isImporting ? 'Importing...' : 'Import'}
                        </Button>
                    </Flex>
                </Flex>
            )}

            {!bookmarkData && (
                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">Close</Button>
                    </Dialog.Close>
                    <Button variant="soft" color="gray" disabled={true}><DownloadIcon /> Import</Button>
                </Flex>
            )}
        </Dialog.Content>
    )
}

const BookmarkImportDialog = ({ trigger }: { trigger?: React.ReactNode }) => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            {trigger ? (
                <Dialog.Trigger>
                    {trigger}
                </Dialog.Trigger>
            ) : (
                <Dialog.Trigger>
                    <Button color="gray">
                        <DownloadIcon /> Import bookmark
                    </Button>
                </Dialog.Trigger>
            )}
            <BookmarkImportDialogContent onClose={() => setOpen(false)} />
        </Dialog.Root>
    )
}

export default BookmarkImportDialog
