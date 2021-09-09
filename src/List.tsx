import { Container } from '@chakra-ui/react';
import * as React from 'react';
import api from './api';
import Info from './Info';
import type { heliotropeList, heliotropeInfo } from './types';

const initInfo: heliotropeInfo = {
  title: 'title',
  thumbnail: '',
  artist: [{ value: 'value', url: 'url' }],
  group: [{ value: 'value', url: 'url' }],
  type: null,
  language: null,
  series: [{ value: 'value', url: 'url' }],
  character: [{ value: 'value', url: 'url' }],
  tags: [{ value: 'value', url: 'url' }],
  date: 'date',
};

const List = () => {
  const { useState, useEffect } = React;
  const [info, setInfo] = useState<heliotropeInfo[]>([initInfo]);
  const [loading, setLoading] = useState(false);

  const fetchHeliotropeList = async () => {
    const response = await fetch(api + '/hitomi/list/1');
    const heliotropeListResponse: heliotropeList = await response.json();

    const info = heliotropeListResponse.list;

    setInfo(info);
    setLoading(true);
  };

  useEffect(() => {
    fetchHeliotropeList();
  }, []);

  return (
    // 컨테이너 나중에 옮겨야함
    <Container w="100%" maxW={{ lg: '1140px' }} p={4}>
      {loading ? info.map((e) => <Info {...e} />) : '로딩중...'}
    </Container>
  );
};

export default List;
