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
} from '@chakra-ui/react';
import {
  MoonIcon,
  SunIcon,
  SearchIcon
} from '@chakra-ui/icons';
import { FiShuffle, FiLogIn } from 'react-icons/fi'

function Header() {
  const [textVisible] = useMediaQuery('(min-width: 720px)');
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Center bg="blackAlpha.100" w="100%" p={4}>
      {textVisible ? (
        <Button
          variant={textVisible ? 'solid' : 'outline'}
          onClick={() => (window.location.href = '/')}
          mr={1}
        >
          <Avatar
            size="sm"
            src="https://avatars.githubusercontent.com/u/73676374?s=200&v=4"
            mr={2}
          />
          {textVisible ? <Text fontSize="sm">Heliotrope-web</Text> : ''}
        </Button>
      ) : (
        <Center>
          <Avatar
            size="sm"
            src="https://avatars.githubusercontent.com/u/73676374?s=200&v=4"
            mr={2}
            ml={1}
          />
        </Center>
      )}
      <IconButton
        mr={1}
        aria-label="Login button"
        icon={<Icon as={FiLogIn} />}
      />
      <IconButton mr={1} aria-label="Random" icon={<Icon as={FiShuffle} />} />
      <IconButton aria-label="Search" icon={<SearchIcon />} />
      <Spacer />
      <IconButton
        onClick={toggleColorMode}
        mr={1}
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
