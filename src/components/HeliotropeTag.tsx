import * as React from 'react';
import type { heliotropeValueUrl } from '../types';
import * as Chakra from '@chakra-ui/react';

function HeliotropeTag({ tag }: { tag: heliotropeValueUrl }) {
  const { Tag, Text } = Chakra;
  const tagColor = (text: string): string => {
    return text.includes('♂')
      ? 'blue.500'
      : text.includes('♀')
      ? 'red.500'
      : 'gray.500';
  };

  return (
    <Tag mr={1} mb={1} backgroundColor={tagColor(tag.value)}>
      <Text textColor="white">{tag.value}</Text>
    </Tag>
  );
}

export default HeliotropeTag;
