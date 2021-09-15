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

const Footer = () => {
  const { colorMode } = useColorMode();
  const repo = 'https://github.com/Saebasol/heliotrope-web';
  const discord = 'https://discord.gg/PSshFYr';
  return (
    <Flex
      bg={
        colorMode === 'dark'
          ? 'rgba(24, 30, 41, 255)'
          : 'rgba(240, 240, 240, 255)'
      }
      padding="24px 0"
      align="center"
      justify="center"
    >
      <Button
        as="a"
        variant="link"
        href={repo}
        target="_blank"
        style={{ textDecoration: 'none' }}
      >
        <Icon as={FiGithub} mr={3} />
        <Text>Saebasol/heliotrope-web</Text>
      </Button>
      <Button
        ml={3}
        as="a"
        variant="link"
        href={discord}
        target="_blank"
        style={{ textDecoration: 'none' }}
      >
        <Icon as={SiDiscord} mr={3} />
        <Text>Saebasol/Discord</Text>
      </Button>
    </Flex>
  );
}
export default Footer;
