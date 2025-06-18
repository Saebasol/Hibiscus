import Tags from '@yaireo/tagify/react'
import { type AddEventData, type ChangeEventData, type InputEventData, type TagData } from '@yaireo/tagify';
import '@yaireo/tagify/dist/tagify.css';
import './Input.css';
import { useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Box } from '@radix-ui/themes';
import { useSearchInputData } from './context';


const pattern = /(female|male|tag|artist|character|group|type):/;

const scrolltoCarret = (e: CustomEvent<AddEventData<TagData>>) => {
  const dom = e.detail.tagify.DOM
  dom.scope.scrollLeft = dom.scope.scrollWidth;
}


const SearchInput = () => {
  const tagifyRef = useRef<Tagify<TagData>>(undefined);
  const [searchInputData, setSearchInputData] = useSearchInputData();

  const transformTag = (tag: TagData) => {
    if (tag.prefix) {
      const cleanValue = tag.value.replace(pattern, '');

      if (!tag.value.startsWith(tag.prefix)) {
        tag.value = tag.prefix + cleanValue;
      }
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
      <MagnifyingGlassIcon
        className="search-icon"
        height="16"
        width="16"
      />
      <Tags
        tagifyRef={tagifyRef}
        settings={{
          mode: "mix",
          transformTag: transformTag,
          pattern: pattern,
          validate: (tag: TagData) => {
            return pattern.test(tag.value);
          },
          editTags: false,
          hooks: {
            beforeKeyDown: (event, data) => {
              return new Promise((resolve) => {
                if (event.key === "Enter") {
                  event.preventDefault();
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
      />
    </Box>
  );
}

export default SearchInput;