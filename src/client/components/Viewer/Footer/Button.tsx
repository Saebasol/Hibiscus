import { IconButton } from '@radix-ui/themes';
import { useToggleViewerMode } from '../context';
import { HeightIcon, SizeIcon } from '@radix-ui/react-icons';

export const ScrollModeButton = () => {
  const [toggleViewerMode, setToggleViewerMode] = useToggleViewerMode();
  return (
    <IconButton onClick={() => setToggleViewerMode(!toggleViewerMode)}>
      <HeightIcon />
    </IconButton>
  );
}

export const PageModeButton = () => {
  const [toggleViewerMode, setToggleViewerMode] = useToggleViewerMode();
  return (
    <IconButton onClick={() => setToggleViewerMode(!toggleViewerMode)}>
      <SizeIcon />
    </IconButton>
  );
}
