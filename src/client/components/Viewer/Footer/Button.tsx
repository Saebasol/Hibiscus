import { IconButton } from '@radix-ui/themes';
import { useViewerModeWithLocalStorage } from '../context';
import { HeightIcon, SizeIcon } from '@radix-ui/react-icons';

export const ScrollModeButton = () => {
  const setToggleViewerMode = useViewerModeWithLocalStorage()[1]
  return (
    <IconButton onClick={() => {
      setToggleViewerMode(false);
      localStorage.setItem('viewerMode', 'scroll');
    }}>
      <HeightIcon />
    </IconButton>
  );
}

export const PageModeButton = () => {
  const setToggleViewerMode = useViewerModeWithLocalStorage()[1]
  return (
    <IconButton onClick={() => {
      setToggleViewerMode(true);
      localStorage.setItem('viewerMode', 'page');
    }}>
      <SizeIcon />
    </IconButton>
  );
}