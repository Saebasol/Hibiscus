import React from 'react';
import { Button, Flex, Spacer, Select } from '@chakra-ui/react';
import { MoonIcon, SunIcon, SearchIcon } from '@chakra-ui/icons';

function Header() {
  return (
    <Flex bg="blackAlpha.100" w="100%" p={4}>
      <Button>Heliotrope</Button>
      <Button><SearchIcon /></Button>
      <Spacer />
      <Button><MoonIcon /></Button>
    </Flex>
  );
}

export default Header;
