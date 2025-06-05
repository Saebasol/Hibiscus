import { Flex } from '@radix-ui/themes';
import ImageRenderer from './ImageRenderer';
import type { Image } from './types';

const ScrollViewer = ({ images }: { images: Image[] }) => {
  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      gap="1rem"
    >
      {
        images.map((image, index) => (
          <ImageRenderer image={image} index={index} />
        ))
      }
    </Flex>
  );
}

export default ScrollViewer;

