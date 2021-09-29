import * as React from 'react';
import * as Chakra from '@chakra-ui/react';
import Loading from './Loading';
interface Props {
  src: string;
  imageNum: number;
  style: React.CSSProperties;
}
const LazyViewerImage = ({ src, imageNum, style }: Props) => {
  const { useRef, useState, useEffect } = React;
  const { Flex } = Chakra;

  const imgRef = useRef<HTMLImageElement>(null);
  const intersectionObserverRef = useRef<IntersectionObserver>();
  const isFirstRender = useRef<boolean>(true);

  const [reload, setReload] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isIntersect, setIntersect] = useState<boolean>(false);

  const [imgBlob, setBlob] = useState<Blob>(new Blob());

  const fetchImageBlob = async () => {
    try {
      const resp = await fetch(src);
      const respBlob = await resp.blob();
      setBlob(respBlob);
      setLoading(false);
    } catch (e) {
      console.error(e);
      if (confirm(`${imageNum} 번 이미지 불러오기 실패. 다시 불러올까요?`)) {
        fetchImageBlob();
        setReload(!reload);
      } else {
        setLoading(true);
      }
    }
  };

  useEffect(() => {
    if (isFirstRender.current !== true) fetchImageBlob();
  }, [isIntersect, setReload]);

  const intersectionCallback = (
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver,
  ) => {
    entries.map((entry) => {
      if (entry.isIntersecting) {
        setIntersect(true);
        observer.unobserve(entry.target);
      }
    });
  };
  useEffect(() => {
    if (isFirstRender.current) isFirstRender.current = false;
    if (!intersectionObserverRef.current)
      intersectionObserverRef.current = new IntersectionObserver(
        intersectionCallback,
        { threshold: 0.5 },
      );
    if (intersectionObserverRef.current && imgRef.current)
      intersectionObserverRef.current.observe(imgRef.current);
  }, [imgRef]);

  return !isIntersect || isLoading ? (
    <Flex
      ref={imgRef}
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <Loading />
    </Flex>
  ) : (
    <img
      style={style}
      alt={`${imageNum}번 페이지 사진`}
      src={URL.createObjectURL(imgBlob)}
    ></img>
  );
};

export default LazyViewerImage;
