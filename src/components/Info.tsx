import * as Chakra from '@chakra-ui/react';
import * as React from 'react';
import type { heliotropeInfo, heliotropeValueUrl } from '../types';
import HeliotropeTag from './HeliotropeTag';
import { Link as RouterLink } from 'react-router-dom';
const tagMapping: Record<string, string> = {
  artist: '작가',
  group: '그룹',
  type: '종류',
  series: '원작',
  // tags: '태그' // Tag Badge를위해 주석
};

const Info = (info: heliotropeInfo) => {
  const { Text, Box, Center, Image, Link } = Chakra;

  const tagFields: JSX.Element[] = [];
  const tagBadges: JSX.Element[] = [];
  // key, value로 나눠서 매핑된거 찾고 값있을때에만 넣기
  Object.entries(info).forEach(([tagName, tagValue]) => {
    if (Object.keys(tagMapping).includes(tagName) && !!tagValue?.length) {
      const tag = tagMapping[tagName];
      tagFields.push(
        <Text mt={2} color="gray.500">
          {tag}:{' '}
          {(tagValue as heliotropeValueUrl[]).map((e) => e.value).join(', ')}
        </Text>,
      );
    } else if (tagName === 'tags' && 0 < tagValue?.length) {
      tagBadges.push(
        <Text style={{ display: 'unset' }} mr={1} color="gray.500">
          태그:
        </Text>,
      );
      (tagValue as heliotropeValueUrl[]).map((tag) => {
        tagBadges.push(<HeliotropeTag tag={tag} />);
      });
    }
  });

  return (
    <Box
      display={{ md: 'flex' }}
      padding="0.3125rem"
      borderRadius="0.5rem"
      boxShadow="rgb(0 0 0 / 16%) 0px 0.1875rem 0.1875rem 0px, rgb(0 0 0 / 8%) 0px 0px 0px 0.0625rem"
      border="0.0625rem solid rgba(0,0,0, 0.16)"
      alignItems="stretch"
      marginBottom="1.5rem"
    >
      <Center
        backgroundColor="rgb(34, 36, 38)"
        borderRadius="0.5rem"
        flexShrink={0}
      >
        <Image
          maxW="100%"
          maxH="300px"
          width={{ md: 40 }}
          alt="thumbnail"
          src={info.thumbnail}
        />
      </Center>
      <Box mt={{ base: 4, md: 0 }} ml={{ md: 6 }}>
        <Link
          mt={1}
          as={RouterLink}
          display="block"
          fontSize="lg"
          lineHeight="normal"
          fontWeight="semibold"
          to={`/viewer/${info.index}`}
          style={{ textDecorationLine: 'none' }}
        >
          <Text fontSize="xl">{info.title}</Text>
        </Link>
        {...tagFields}
        <Box mt={1}>{...tagBadges}</Box>
      </Box>
    </Box>
  );
};

export default Info;
