import theme from './theme';
import React from 'react';
import ReactDOM from 'react-dom';
import { ColorModeScript } from '@chakra-ui/react';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <ColorModeScript
      initialColorMode={theme.config.initialColorMode}
    ></ColorModeScript>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://snowpack.dev/concepts/hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
}
