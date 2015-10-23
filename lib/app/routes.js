import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './components/App';
import UsersIndex from './components/UsersIndex';
import UserProfile from './components/UserProfile';
import UrlShortener from './components/UrlShortener';

export default (
  <Route name="app" component={App} path="/">
    <IndexRoute component={UsersIndex} />
    <Route path="/users/:id" component={UserProfile} />
    <Route path="/url-shortener" component={UrlShortener} />
  </Route>
);
