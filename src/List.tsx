import { Container } from '@chakra-ui/react';
import * as React from 'react';
import { Redirect, useParams } from 'react-router-dom';
import api from './api';
import Info from './Info';
import Loading from './Loading';
import type { heliotropeList, heliotropeInfo } from './types';

const initInfo: heliotropeInfo = {
  index: '1',
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
  const { id } = useParams<{id?: string}>();
  
  const fetchHeliotropeList = async () => {
    const response = await fetch(api + `/hitomi/list/${id}`);

    const heliotropeListResponse: heliotropeList = await response.json();

    const info = heliotropeListResponse.list;

    setInfo(info);
    setLoading(true);
  };

  useEffect(() => {
    if (id){
      fetchHeliotropeList();
    }
  }, [id]);


  return (
    <Container w="100%" maxW={{ lg: '1140px' }} p={4}>
      {loading ? info.map((e: heliotropeInfo) => <Info {...e} />) : <Loading/>}
    </Container>
  );
};

export default List;
