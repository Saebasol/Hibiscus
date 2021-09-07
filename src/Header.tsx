import React from 'react';
import { Button, Flex, Spacer, Menu, IconButton, Text } from '@chakra-ui/react';
import { MoonIcon, SunIcon, SearchIcon, ArrowForwardIcon, RepeatIcon } from '@chakra-ui/icons';

function Header() {
  const dark = false//mock
  return (
    <Flex bg="blackAlpha.100" w="100%" p={4}>
      <Button onClick={()=> window.open("https://github.com/Saebasol/", "_blank")} mr={1}><Text fontSize="md">Heliotrope</Text></Button>
      <Button mr={2} aria-label="Random" leftIcon={<RepeatIcon />}><Text fontSize="sm">랜덤 작품</Text></Button>
      <Button><SearchIcon /></Button>
      <Spacer />
      <IconButton mr={1} aria-label={dark ? "Enable Light mode" : "Enable Dark mode"}>{dark ? <MoonIcon /> : <SunIcon />}</IconButton>
      <IconButton aria-label="Login button" icon={<ArrowForwardIcon />}></IconButton>
    </Flex>
  );
}

export default Header;
