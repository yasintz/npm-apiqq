import * as React from 'react';
import useQuery from './hooks/use-query';
import useMutation from './hooks/use-mutation';
import { refetchFactory } from './utils';
import DatabaseObjectContextProvider from './contexts/objects';
import ApiCallContextProvider from './contexts/api-call';
import QueryContextProvider from './contexts/query';
import MutationContextProvider from './contexts/mutation';
import { copyObject } from './utils/copy-object';

interface ServicesContextProviderProps {
  mutations: any;
  queries: any;
}

function ServicesContextProvider(
  props: React.PropsWithChildren<ServicesContextProviderProps>
) {
  const mutations = React.useMemo(
    () => copyObject(props.mutations, 'mutation'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const queries = React.useMemo(
    () => copyObject(props.queries, 'query'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <DatabaseObjectContextProvider>
      <ApiCallContextProvider mutations={mutations} queries={queries}>
        <QueryContextProvider>
          <MutationContextProvider>{props.children}</MutationContextProvider>
        </QueryContextProvider>
      </ApiCallContextProvider>
    </DatabaseObjectContextProvider>
  );
}

export { useQuery, useMutation, refetchFactory };

export default ServicesContextProvider;
