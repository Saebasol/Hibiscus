import * as React from 'react';
import * as Chakra from '@chakra-ui/react';
import api from '../api';
import * as ReactRouterDom from 'react-router-dom';
import type { heliotropeImageInfo, heliotropeImageList } from '../types';
import { Center } from '@chakra-ui/react';
import LazyViewerImage  from './LazyLoadingImage';
import Loading from './Loading';
// TODO: 가로 채우기, 스크롤, 페이지 보기 설정, 뷰어 헤더 구현, Lazy loading 구현
// COMPLETE: 세로 채우기
const Viewer = () => {
  const { useEffect, useState } = React;
  const { Box, Image } = Chakra;
  const { useParams } = ReactRouterDom;
  const { index } = useParams<{ index: string }>();
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
  const fillVertical = {
    maxWidth: '100%',
    maxHeight: '100vh',
    marginLeft: 'auto',
    marginRight: 'auto',
  };
  const imageElements = images.map((e, index) => (
    <Image
      key={index}
      loading="lazy"
      style={fillVertical}
      m={0}
      src={api+'/proxy/' + e.url}
    />
  ));
  //   align-items: center;
  //   justify-content: center;
  return (
    <>
    {/* <LazyViewerImage /> */}
    <Center>{loading ? <Loading /> : <Box>{[...imageElements]}</Box>}</Center>
    </>
  );
}

export default Viewer;
