import { Flex } from '@chakra-ui/layout';
import { Spinner } from '@chakra-ui/react';
import React from 'react';

const Loading = () => {
  return (
    <Flex alignItems="center" justifyContent="center" minHeight="100vh">
      <Spinner />
    </Flex>
  );
};

export default Loading;
