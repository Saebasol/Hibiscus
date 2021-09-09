import { Flex, Stack, Button, Text, Icon } from '@chakra-ui/react';
import { FiGithub } from 'react-icons/fi';
import { SiDiscord } from 'react-icons/si';
import * as React from 'react';

function Footer() {
  const repo = (): Window | null =>
    window.open('https://github.com/Saebasol/heliotrope-web', '__blank');
  const discord = (): Window | null =>
    window.open('https://discord.gg/PSshFYr', '__blank');
  return (
    <Flex as="footer" bg="blackAlpha.100" w="100%" p={4}>
      <Stack>
        <Button
          ml={3}
          variant="link"
          onClick={repo}
          style={{ textDecoration: 'none' }}
        >
          <Icon as={FiGithub} mr={3} />
          <Text>Saebasol/heliotrope-web</Text>
        </Button>
      </Stack>
      <Stack>
        <Button
          ml={3}
          variant="link"
          onClick={discord}
          style={{ textDecoration: 'none' }}
        >
          <Icon as={SiDiscord} mr={3} />
          <Text>Saebasol/Discord</Text>
        </Button>
      </Stack>
    </Flex>
  );
}
export default Footer;
