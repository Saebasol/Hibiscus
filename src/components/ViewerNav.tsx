import * as React from 'react';
import * as Chakra from '@chakra-ui/react';
import { CgArrowsHAlt, CgArrowsVAlt } from 'react-icons/cg';
import api from '../api';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import type { heliotropeInfo } from '../types';

interface IProps {
  index: string;
  setVertical: React.Dispatch<React.SetStateAction<boolean>>;
  isVertical: boolean;
}
const Viewer = ({ setVertical, isVertical, index }: IProps) => {
  const { useEffect, useState, useRef } = React;
  const { Center, Spacer, IconButton, Icon, Text, useColorMode } = Chakra;
  const { colorMode, toggleColorMode } = useColorMode();
  const scrollRef = useRef<number>(window.scrollY);

  const [hitomiInfo, setInfo] = useState<heliotropeInfo>();
  const [isScrollUp, setScrollUp] = useState<boolean>(true);

  const fetchHitomiInfo = async () => {
    const resp = await fetch(api + '/hitomi/info/' + index);
    const json = await resp.json();
    setInfo(json);
  };

  const ViewerNavCSS: React.CSSProperties = {
    display: isScrollUp ? '' : 'none',
    position: 'fixed',
    bottom: 0,
    minHeight: '5vh',
  };
  
  const toggleVertical = () => {
    setVertical(!isVertical);
  };

  useEffect(() => {
    window.addEventListener('scroll', () => {
      setScrollUp(scrollRef.current > window.scrollY);
      scrollRef.current = window.scrollY;
    });
    fetchHitomiInfo();
  }, []);

  return (
    <Center w="100%" style={ViewerNavCSS} bg={colorMode === 'dark' ? 'blackAlpha.800' : 'whiteAlpha.800'}>
      <Text ml={4}>{hitomiInfo?.title}</Text>
      <Spacer />
      <IconButton
        variant="ghost"
        onClick={toggleColorMode}
        aria-label={
          colorMode === 'dark' ? 'Enable Light mode' : 'Enable Dark mode'
        }
        mr={1}
      >
        {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
      </IconButton>
      <IconButton
        mr={4}
        variant="ghost"
        onClick={toggleVertical}
        aria-label={isVertical ? 'expand horizontal' : 'expand vertical'}
        icon={<Icon as={isVertical ? CgArrowsVAlt : CgArrowsHAlt} />}
      />
    </Center>
  );
};

export default Viewer;
