import Tags from '@yaireo/tagify/react'
import { type ChangeEventData, type InputEventData, type TagData } from '@yaireo/tagify';
import { useEffect, useRef, useState } from 'react';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Box, Button, Flex, Spinner } from '@radix-ui/themes';
import { useSearchInputData } from './context';
import type { Tags as HeliotropeTags } from '@saebasol/delphinium'
import { plainQuery, tagToken } from '../../utils/catalog'

// Define the Tagify type
interface CustomTagify extends Tagify<TagData> {
  state: {
    dropdown: {
      visible: boolean;
    };
    tag: boolean;
    actions: {
      selectOption: boolean;
    };
  };
}

export const pattern = /-?(?:female:|male:|tag:|artist:|character:|group:|type:|series:|language:)/

function tagifyInitialValue(query?: string) {
  if (query === undefined) return undefined;
  return query.trim().replaceAll(/[\r\n\u2028\u2029]+/g, ' ').split(/(\s+)/).map(part =>
    tagToken(part) ? `[[${JSON.stringify({ value: part })}]]` : part
  ).join('');
}

function tagBeforeCaret(input: HTMLElement) {
  const selection = window.getSelection();
  if (!selection?.isCollapsed || !selection.rangeCount) return null;
  const range = selection.getRangeAt(0);
  if (!input.contains(range.startContainer)) return null;

  let node: Node | null = range.startContainer;
  if (node.nodeType === Node.TEXT_NODE) {
    if (node.parentElement?.closest('tag')) return null;
    const beforeCaret = node.textContent?.slice(0, range.startOffset) ?? '';
    if (beforeCaret.replace(/[\u200B\u2060\uFEFF]/g, '')) return null;
    node = node.previousSibling;
  } else if (node === input) {
    node = node.childNodes[range.startOffset - 1] ?? null;
  } else {
    return null;
  }

  while (node && (node.nodeName === 'BR' ||
    (node.nodeType === Node.TEXT_NODE && !node.textContent?.replace(/[\u200B\u2060\uFEFF]/g, '')))) {
    node = node.previousSibling;
  }
  return node instanceof HTMLElement && node.tagName === 'TAG' ? node : null;
}

const SearchInput = ({ onSubmit, query }: { onSubmit: (query: string) => void; query?: string }) => {
  const tagifyRef = useRef<Tagify<TagData>>(undefined);
  const submit = () => {
    if (tagifyRef.current) onSubmit(plainQuery(tagifyRef.current));
  };
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const controller = new AbortController();
    async function loadTags() {
      try {
        const response = await fetch('/internal/tags', { signal: controller.signal, cache: 'force-cache' });
        if (response.ok) setAutoCompleteTags(await response.json());
      } catch {
        // Typed searches still work when suggestions are unavailable.
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadTags();
    return () => controller.abort();
  }, []);

  const transformTag = (tag: TagData) => {
    if (tag.prefix && !tag.value.startsWith(tag.prefix)) {
      tag.value = tag.prefix + tag.value;
    }

    const effectiveValue = tag.value.startsWith('-') ? tag.value.slice(1) : tag.value;

    if (effectiveValue.startsWith("female:")) {
      tag["data-accent-color"] = "ruby";
    }
    else if (effectiveValue.startsWith("male:")) {
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
      "-artist:": "artists",
      "character:": "characters",
      "-character:": "characters",
      "group:": "groups",
      "-group:": "groups",
      "series:": "series",
      "-series:": "series",
      "tag:": "tag",
      "-tag:": "tag",
      "female:": "female",
      "-female:": "female",
      "male:": "male",
      "-male:": "male",
      "type:": "type",
      "-type:": "type",
      "language:": "language",
      "-language:": "language",
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
    const tagify = tagifyRef.current;
    if (!tagify) return;

    const inputElement = tagify.DOM.input;
    const dropdown = tagify.DOM.dropdown;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    inputElement.setAttribute('aria-multiline', 'false');
    inputElement.removeAttribute('tagify--mix')

    const handleBeforeInput = (event: InputEvent) => {
      if (!isIOS || event.defaultPrevented || event.inputType !== 'deleteContentBackward') return;
      const tag = tagBeforeCaret(inputElement);
      if (!tag) return;

      event.preventDefault();
      const caret = document.createRange();
      caret.setStartBefore(tag);
      caret.collapse(true);
      void Promise.resolve(tagify.removeTags(tag, false, 0)).then(() => {
        inputElement.focus({ preventScroll: true });
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(caret);
      });
    };
    const handlePointerDown = () => {
      (tagify as CustomTagify).state.actions.selectOption = true;
    };

    inputElement.addEventListener('beforeinput', handleBeforeInput);
    dropdown?.addEventListener('pointerdown', handlePointerDown);
    return () => {
      inputElement.removeEventListener('beforeinput', handleBeforeInput);
      dropdown?.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return (
    <Flex gap="2" align="center">
      <Box className="search-wrapper" minWidth="0">
        <Box className="search-icon">
          {loading
            ? <Spinner size="2" role="status" aria-label="Loading search suggestions" />
            : <MagnifyingGlassIcon height="16" width="16" />}
        </Box>
        <Tags
          tagifyRef={tagifyRef}
          defaultValue={tagifyInitialValue(query)}
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
                  if (event.key === "Enter" && !event.isComposing && event.keyCode !== 229 && !definedStateTagify.state.dropdown.visible) {
                    event.preventDefault();
                    onSubmit(plainQuery(tagify));
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
        />
      </Box>
      <Button type="button" style={{ flexShrink: 0 }} onClick={submit}>Search</Button>
    </Flex>
  );
}

export default SearchInput;