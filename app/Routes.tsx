import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import Main from './components/main/Main';
import Settings from './components/settings/Settings';

export default function Routes() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Main />
        </Route>
        <Route exact path="/settings">
          <Settings />
        </Route>
      </Switch>
    </Router>
  );
}
