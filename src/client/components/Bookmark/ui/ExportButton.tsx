import { Button, Tooltip } from "@radix-ui/themes";
import type Bookmark from "../../../types/Bookmark";
import { UploadIcon } from "@radix-ui/react-icons";

const BookmarkExportButton = ({ data }: { data: Bookmark }) => {
    const handleExport = () => {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `bookmark-${data.id}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        alert("Download started")
        URL.revokeObjectURL(url);
    };

    return (
        <Tooltip content="Export bookmark">
            <Button color="gray" onClick={() => handleExport()}>
                <UploadIcon />
            </Button>
        </Tooltip>
    )
}

export default BookmarkExportButton