import 'react-app-polyfill/ie11';
import axios from 'axios';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Provider, { useMutation, useQuery } from '../.';

const mutations = {};
const queries = {
  getAll: () => axios('https://next.json-generator.com/api/json/get/VkjoqHFm_'),
};

const App = () => {
  const d = useQuery(queries.getAll);
  console.log(d);
  return <div>Hello World</div>;
};

ReactDOM.render(
  <Provider {...{ queries, mutations }}>
    <App />
  </Provider>,
  document.getElementById('root')
);
