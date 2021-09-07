import * as React from 'react'

import {
  ChakraProvider,
  extendTheme,
} from '@chakra-ui/react'


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
    </ChakraProvider >
  );
}

export default App;