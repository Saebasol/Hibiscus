import * as React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme';
import List from './List';
import Login from './Login';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import HFContainer from '../components/HFContainer';
import Viewer from './Viewer';

function App() {
  return (
    <Router>
      <ChakraProvider theme={theme}>
        <Switch>
          <Route exact path="/list">
            <Redirect to="/list/1" />
          </Route>
          <Route exact path="/list/:id">
            <HFContainer children={<List />} />
          </Route>

          <Route exact path="/viewer">
            <Redirect to="/list/1" />
          </Route>
          <Route exact path="/viewer/:id">
            <Viewer />
          </Route>

          <Route path="/login" exact component={Login} />
        </Switch>
      </ChakraProvider>
    </Router>
  );
}

export default App;
