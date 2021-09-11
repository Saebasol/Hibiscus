import React from 'react';
import {
  Button,
  Center,
  Spacer,
  Avatar,
  IconButton,
  Text,
  Icon,
  useColorMode,
  useMediaQuery,
  Link,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon, SearchIcon } from '@chakra-ui/icons';
import { FiShuffle, FiLogIn } from 'react-icons/fi';

function Header() {
  const [textVisible] = useMediaQuery('(min-width: 720px)');
  const { colorMode, toggleColorMode } = useColorMode();
  const avatarURL =
    'https://avatars.githubusercontent.com/u/73676374?s=200&v=4';
  return (
    <Center
      bg={
        colorMode === 'dark'
          ? 'rgba(24, 30, 41, 255)'
          : 'rgba(240, 240, 240, 255)'
      }
      w="100%"
      p={4}
      sx={{
        position: 'sticky',
        top: '0',
      }}
    >
      <Button
        as="a"
        target="_blank"
        href="/"
        variant="ghost"
        mr={textVisible ? 1 : 0}
      >
        <Avatar size="sm" src={avatarURL} mr={2} />
        {textVisible ? <Text fontSize="sm">Heliotrope-web</Text> : ''}
      </Button>
      <IconButton
        mr={1}
        variant="ghost"
        aria-label="Login button"
        icon={<Icon as={FiLogIn} />}
      />
      <IconButton
        mr={1}
        variant="ghost"
        aria-label="Random"
        icon={<Icon as={FiShuffle} />}
      />
      <IconButton variant="ghost" aria-label="Search" icon={<SearchIcon />} />
      <Spacer />
      <IconButton
        variant="ghost"
        onClick={toggleColorMode}
        aria-label={
          colorMode === 'dark' ? 'Enable Light mode' : 'Enable Dark mode'
        }
      >
        {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
      </IconButton>
    </Center>
  );
}

export default Header;
