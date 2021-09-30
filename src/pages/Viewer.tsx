import * as React from 'react';
import * as Chakra from '@chakra-ui/react';
import api from '../api';
import * as ReactRouterDom from 'react-router-dom';
import type { heliotropeImageInfo, heliotropeImageList } from '../types';
import { Center } from '@chakra-ui/react';
import LazyViewerImage from '../components/LazyViewerImage';
import ViewerNav from '../components/ViewerNav';
import Loading from '../components/Loading';
// TODO: 스크롤, 페이지 보기 설정
// WIP: 뷰어 헤더 구현, Lazy loading 구현
// Lazyloading 컴포넌트마다 IntersectionObserver 인스턴스가 생성됨. Viewer컴포넌트에서 관리하도록 바꿀 필요 있음
// COMPLETE: 세로 채우기, 가로 채우기
const Viewer = () => {
  const { useEffect, useState } = React;
  const { Box } = Chakra;
  const { useParams } = ReactRouterDom;

  const { index } = useParams<{ index: string }>();

  const [isVertical, setVertical] = useState<boolean>(true);
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
  const fillHorizontal = {
    minWidth: '90vw',
    maxHeight: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  const imageElements = images.map((e, index) => (
    <LazyViewerImage
      key={index}
      style={isVertical ? fillVertical : fillHorizontal}
      src={api + '/proxy/' + e.url}
      imageNum={index + 1}
    />
  ));
  return (
    <Center m={0}>
      <ViewerNav
        setVertical={setVertical}
        isVertical={isVertical}
        index={index}
      />
      {loading ? <Loading /> : <Box>{[...imageElements]}</Box>}
    </Center>
  );
};

export default Viewer;
