import type { RawInfoData } from "@saebasol/delphinium";

export default interface Bookmark {
    id: number;
    name: string;
    description?: string;
    date: number;
    items: RawInfoData[];
}