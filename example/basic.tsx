import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Provider, { useMutation, useQuery } from 'apiqq';
import { queries, mutations } from './api-functions';

const Overrider = () => {
  const { data } = useQuery(queries.getOverrider);
  return null;
};

const App = () => {
  const { data } = useQuery(queries.getAll, { defaultValue: [] });
  const { mutation } = useMutation(mutations.getOverrider);
  const [isShow, setIsShow] = React.useState(false);

  if (data && data.length > 0) {
    return (
      <div onClick={() => mutation()}>
        {data[0].balance}
        <button onClick={() => setIsShow(true)}>Goster</button>
        {isShow && <Overrider />}
      </div>
    );
  }

  return null;
};

ReactDOM.render(
  <Provider mutations={mutations} queries={queries}>
    <App />
  </Provider>,
  document.getElementById('root')
);
