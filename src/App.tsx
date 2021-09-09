import * as React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import Header from './Header';
import Footer from './Footer';
import theme from './theme';

function App() {
  const { useEffect } = React;

  useEffect(() => {}, []);

  return (
    <ChakraProvider theme={theme}>
      <Header />
      <Footer />
    </ChakraProvider>
  );
}

export default App;
