import * as React from 'react'

import {
  ChakraProvider,
  extendTheme,
} from '@chakra-ui/react'
import Header from './Header'

const theme = extendTheme({
  fonts: {
    heading: 'Inter, Noto Sans KR',
    body: 'Inter, Noto Sans KR'
  },
  initialColorMode: 'dark'
})

function App() {
  const { useEffect } = React

  useEffect(() => {}, [])

  return (
    <ChakraProvider theme={theme}>
      <Header></Header>
    </ChakraProvider >
  );
}

export default App;