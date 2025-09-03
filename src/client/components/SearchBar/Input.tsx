import Tags from '@yaireo/tagify/react'
import { type AddEventData, type ChangeEventData, type InputEventData, type TagData } from '@yaireo/tagify';
import '@yaireo/tagify/dist/tagify.css';
import './Input.css';
import { useEffect, useRef, useState } from 'react';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Box, Spinner } from '@radix-ui/themes';
import { useSearchInputData } from './context';
import { Tags as HeliotropeTags } from '@saebasol/delphinium'

// Define the Tagify type
interface CustomTagify extends Tagify<TagData> {
  state: {
    dropdown: {
      visible: boolean;
    };
    tag: boolean;
  };
}

export const pattern = /female:|male:|tag:|artist:|character:|group:|type:/



const scrolltoCarret = (e: CustomEvent<AddEventData<TagData>>) => {
  const dom = e.detail.tagify.DOM
  dom.scope.scrollLeft = dom.scope.scrollWidth;
}


const SearchInput = () => {
  const tagifyRef = useRef<Tagify<TagData>>(undefined);
  const [loading, setLoading] = useState(false);
  const [searchInputData, setSearchInputData] = useSearchInputData();
  const [autoCompleteTags, setAutoCompleteTags] = useState<HeliotropeTags>({
    artists: [],
    groups: [],
    series: [],
    characters: [],
    tag: [],
    female: [],
    male: [],
    type: [],
    language: []
  });

  const requestGetAutoCompleteTags = async () => {
    setLoading(true);
    tagifyRef.current?.setPlaceholder("Loading tags...");
    const response = await fetch('/internal/tags', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'force-cache',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch autocomplete tags');
    }

    const data = (await response.json()) as HeliotropeTags;
    setAutoCompleteTags(data);
    tagifyRef.current?.setPlaceholder("Search the works...");
    setLoading(false);
  }

  useEffect(() => {
    requestGetAutoCompleteTags();
  }, []);

  const transformTag = (tag: TagData) => {
    if (tag.prefix && !tag.value.startsWith(tag.prefix)) {
      tag.value = tag.prefix + tag.value;
    }

    if (tag.value.startsWith("female:")) {
      tag["data-accent-color"] = "ruby";
    }
    else if (tag.value.startsWith("male:")) {
      tag["data-accent-color"] = "blue";
    }
    else {
      tag["data-accent-color"] = "gray";
    }
    tag.class = "tagify__color_tag";

    return tag;
  }

  const onChange = (e: CustomEvent<ChangeEventData<TagData>>) => {
    const tags = e.detail.tagify.value as TagData[];
    setSearchInputData({
      ...searchInputData,
      tags: tags.map(tag => tag.value)
    });
  }

  const onInput = (e: CustomEvent<InputEventData<TagData>>) => {
    const tagify = e.detail.tagify
    const cleanTitle = tagify.getMixedTagsAsString().replaceAll(/\[\[.+\]\]/g, '').replaceAll(/[\u200B\u00A0]/g, '').trim()

    const mapping: Record<string, keyof typeof autoCompleteTags> = {
      "artist:": "artists",
      "character:": "characters",
      "group:": "groups",
      "series:": "series",
      "tag:": "tag",
      "female:": "female",
      "male:": "male",
      "type:": "type",
      "language:": "language"
    }

    for (const [prefix, key] of Object.entries(mapping)) {
      if (cleanTitle.startsWith(prefix)) {
        tagify.settings.whitelist = autoCompleteTags?.[key] as string[]
        break
      }
    }
    setSearchInputData({
      ...searchInputData,
      title: cleanTitle
    });
  }

  useEffect(() => {
    if (tagifyRef.current) {
      const inputElement = tagifyRef.current.DOM?.input;
      if (inputElement) {
        inputElement.setAttribute('aria-multiline', 'false');
        inputElement.removeAttribute('tagify--mix')
      }
    }

  }, []);

  return (
    <Box className="search-wrapper">
      {loading ? <Spinner
        className="search-icon"
        size="2"
      /> : <MagnifyingGlassIcon
        className="search-icon"
        height="16"
        width="16"
      />}
      <Tags
        tagifyRef={tagifyRef}
        settings={{
          mode: "mix",
          transformTag: transformTag,
          pattern: pattern,
          dropdown: {
            enabled: 0
          },
          autoComplete: {
            enabled: true
          },
          validate: (tag: TagData) => {
            return pattern.test(tag.value);
          },
          editTags: false,
          hooks: {
            beforeKeyDown: (event, { tagify }) => {
              return new Promise((resolve) => {
                const definedStateTagify = tagify as CustomTagify;
                if (event.key === "Enter" && !definedStateTagify.state.dropdown.visible && !definedStateTagify.state.tag) {
                  event.preventDefault();
                  return false;
                }
                if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
                  event.preventDefault();
                }
                resolve();
              });
            }
          },
        }}
        onChange={onChange}
        onInput={onInput}
        placeholder="Search the works..."
        disabled={loading}
      />
    </Box>
  );
}

export default SearchInput;