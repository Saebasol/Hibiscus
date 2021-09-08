import React from 'react';
import {
  Button,
  Flex,
  Center,
  Spacer,
  Avatar,
  IconButton,
  Text,
  useColorMode,
  useMediaQuery,
} from '@chakra-ui/react';
import {
  MoonIcon,
  SunIcon,
  SearchIcon,
  ArrowForwardIcon,
  RepeatIcon,
} from '@chakra-ui/icons';

function Header() {
  const [ textVisible ] = useMediaQuery('(min-width: 720px)');
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Flex bg="blackAlpha.100" w="100%" p={4}>
      <Button
        variant={textVisible ? 'ghost' : 'link'}
        onClick={() => window.location.href = '/'}
        mr={1}
      >
        <Avatar
          size="sm"
          src="https://avatars.githubusercontent.com/u/73676374?s=200&v=4"
          mr={textVisible ? 2 : 0}
        />
        {textVisible ? <Text fontSize="sm">Heliotrope-web</Text> : ""}
      </Button>
      <IconButton mr={1} aria-label="Random" icon={<RepeatIcon />} />
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
      <IconButton
        mr={1}
        aria-label="Login button"
        icon={<ArrowForwardIcon />}
      />
    </Flex>
  );
}

export default Header;
