import * as React from 'react';
import * as Chakra from '@chakra-ui/react';
import api from './api';
import type { heliotropeImageInfo, heliotropeImageList } from './types';
import { Center } from '@chakra-ui/react';
// TODO: 가로 채우기, 세로 채우기, 스크롤, 펼쳐보기 설정, 뷰어 헤더 구현, Lazy loading 구현
function Viewer({ index }: { index: string }) {
  const { Flex, Box, Spinner, Image } = Chakra;
  const { useEffect, useState } = React;
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<heliotropeImageInfo[]>([]);
  const fetchImages = async (): Promise<void> => {
    const response = await fetch(api + '/hitomi/images/' + index);
    const heliotropeFiles: heliotropeImageList = await response.json();
    setImages(heliotropeFiles.files);
    setLoading(false);
    return;
  };
  useEffect(() => {
    fetchImages();
  }, []);
  const imageElements = images.map((e, index) => (
    <Image
      key={index}
      loading='eager'
      style={{ width: '50%', marginLeft: 'auto', marginRight: 'auto' }}
      m={0}
      src={'https://heliotrope.me/v5/api/proxy/' + e.url}
    />
  ));
  //   align-items: center;
  //   justify-content: center;
  return (
    <Center>
      {loading ? (
        <Spinner />
      ) : (
        <Box>{[...imageElements]}</Box>
      )}
    </Center>
  );
export default Viewer;
