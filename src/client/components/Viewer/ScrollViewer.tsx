import { Flex } from '@radix-ui/themes';
import ImageRenderer from './ImageRenderer';
import type { ViewerProps } from './types';
import { useEffect } from 'react';
import { useLocation } from 'react-router';

const ScrollViewer = ({ images }: ViewerProps) => {
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace('#', ''));
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [hash]);

  return (
    <Flex
      mt="4rem"
      direction="column"
      justify="center"
      align="center"
      gap="1rem"
    >
      {
        images.map((image, index) => (
          <ImageRenderer key={index} image={image} index={index} />
        ))
      }
    </Flex>
  );
}

export default ScrollViewer;

