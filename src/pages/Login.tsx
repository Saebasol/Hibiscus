import { Flex } from '@chakra-ui/layout';
import { Icon, Button } from '@chakra-ui/react';
import React from 'react';
import { SiDiscord } from 'react-icons/si';

const Login = () => {
  return (
    <Flex alignItems="center" justifyContent="center" minHeight="100vh">
      <Button color="white" bgColor="#5865F2" leftIcon={<SiDiscord />}>
        Login into Discord
      </Button>
    </Flex>
  );
};

export default Login;
