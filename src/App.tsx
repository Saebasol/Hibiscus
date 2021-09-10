import * as React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import Header from './Header';
import Footer from './Footer';
import theme from './theme';
import List from './List';
import Login from './Login';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import HFContainer from './HFContainer';

function App() {
  return (
    <Router>
      <ChakraProvider theme={theme}>

      <Switch>
        <Route exact path="/list">
          <Redirect to="/list/1" />
        </Route>
        <Route exact path="/list/:id">
          <HFContainer children={<List/>}/>
        </Route>
        <Route path="/login" exact component={Login}/>
      </Switch>
      </ChakraProvider>
    </Router>
  );
}

export default App;
