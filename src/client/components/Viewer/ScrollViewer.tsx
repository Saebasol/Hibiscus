import { Flex } from '@radix-ui/themes';
import ImageRenderer from './ImageRenderer';
import type { ViewerProps } from './types';
import { useEffect } from 'react';
import { useLocation } from 'react-router';

const ScrollViewer = ({ images }: ViewerProps) => {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.replace('#', ''));
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  return (
    <Flex
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

