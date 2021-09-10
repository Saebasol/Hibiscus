import * as React from 'react';
import type { heliotropeValueUrl } from './types';
import * as Chakra from '@chakra-ui/react';

function HeliotropeTag({ tag }: { tag: heliotropeValueUrl }) {
  const { Tag, Text } = Chakra;
  const tagColor = (text: string): string => {
    const female = '♀';
    const male = '♂';
    return text.includes(male)
      ? 'blue.500'
      : text.includes(female)
      ? 'red.500'
      : 'gray.500';
  };

  return (
    <Tag mr={1} mt={1} backgroundColor={tagColor(tag.value)}>
      <Text textColor="black">{tag.value}</Text>
    </Tag>
  );
}

export default HeliotropeTag;
