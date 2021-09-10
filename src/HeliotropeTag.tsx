import * as React from 'react';
import type { heliotropeValueUrl } from './types';
import * as Chakra from '@chakra-ui/react';

function HeliotropeTag({ tag }: { tag: heliotropeValueUrl }) {
  const { Tag } = Chakra;
  const tagColor = (text: string): string => {
    const female = '♀';
    const male = '♂';
    return text.includes(male)
      ? 'blue.300'
      : text.includes(female)
      ? 'red.300'
      : 'gray.300';
  };

  return (
    <Tag mr={1} backgroundColor={tagColor(tag.value)}>
      {tag.value}
    </Tag>
  );
}

export default HeliotropeTag;
