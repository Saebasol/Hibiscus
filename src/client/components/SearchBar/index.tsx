
import Tagify, { type AddEventData, type TagData } from '@yaireo/tagify';
import Tags from '@yaireo/tagify/react'
import { useEffect, useRef } from 'react';
import '@yaireo/tagify/dist/tagify.css';
import './index.css';


const SearchBar = () => {
  const getAutoCompleteResource = () => {
  }

  const transeformTag = (tag: TagData) => {
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

  }

  const scrolltoCarret = (e: CustomEvent<AddEventData<TagData>>) => {
    const dom = e.detail.tagify.DOM
    dom.scope.scrollLeft = dom.scope.scrollWidth;

  }

  return (
    <Tags
      settings={{
        transformTag: transeformTag,
      }}
      onAdd={scrolltoCarret}

    />
  );
}

export default SearchBar;