import type HeliotropeInfo from "./HeliotropeInfo";

export default interface Bookmark {
    id: number;
    name: string;
    description?: string;
    date: number;
    items: HeliotropeInfo[];
}