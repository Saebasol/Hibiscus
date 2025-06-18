import { create } from "../../utils/context";

export const useOpenSearchDialog = create<boolean>(false);

export const useSearchInputData = create<{ title: string; tags: string[]; }>({ title: "", tags: [] });

