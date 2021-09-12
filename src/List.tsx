import { Container } from '@chakra-ui/react';
import * as React from 'react';
import { Redirect, useParams } from 'react-router-dom';
import api from './api';
import Info from './Info';
import Loading from './Loading';
import Pagenation from './Pagination';
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
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{id?: string}>();
  
  const fetchHeliotropeList = async () => {
    setLoading(true);
    const response = await fetch(api + `/hitomi/list/${id}`);

    const heliotropeListResponse: heliotropeList = await response.json();

    const info = heliotropeListResponse.list;
    const total = heliotropeListResponse.total;

    setTotal(total);
    setInfo(info);
    setLoading(false);
  };

  useEffect(() => {
    if (id){
      fetchHeliotropeList();
    }
  }, [id]);


  return (
    <>
      <Container w="100%" maxW={{ lg: '1140px' }} p={4}>
          {loading ? <Loading/> : info.map((e: heliotropeInfo) => <Info {...e} />)}
      </Container>
      <Pagenation currentPage={Number(id)} total={total} />
    </>
  )
}

export default List;
