import {
  Flex,
  useColorMode,
  Button,
  Text,
  Icon,
  Stack,
} from '@chakra-ui/react';
import { FiGithub } from 'react-icons/fi';
import { SiDiscord } from 'react-icons/si';
import * as React from 'react';

function Footer() {
  const { colorMode } = useColorMode();
  const repo = (): Window | null =>
    window.open('https://github.com/Saebasol/heliotrope-web', '__blank');
  const discord = (): Window | null =>
    window.open('https://discord.gg/PSshFYr', '__blank');
  return (
    <Flex
      bg={
        colorMode === 'dark'
          ? 'rgba(24, 30, 41, 255)'
          : 'rgba(240, 240, 240, 255)'
      }
      padding='24px 0'
      align='center'
      justify='center'
    >
      <Button variant="link" onClick={repo} style={{ textDecoration: 'none' }}>
        <Icon as={FiGithub} mr={3} />
        <Text>Saebasol/heliotrope-web</Text>
      </Button>
      <Button
        ml={3}
        variant="link"
        onClick={discord}
        style={{ textDecoration: 'none' }}
      >
        <Icon as={SiDiscord} mr={3} />
        <Text>Saebasol/Discord</Text>
      </Button>
    </Flex>
  );
}
export default Footer;
