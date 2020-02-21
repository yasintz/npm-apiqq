import * as React from 'react';
import useQuery from './hooks/use-query';
import useMutation from './hooks/use-mutation';
import { refetchFactory } from './utils';
import DatabaseObjectContextProvider from './contexts/objects';
import ApiCallContextProvider from './contexts/api-call';
import QueryContextProvider from './contexts/query';
import MutationContextProvider from './contexts/mutation';

interface ServicesContextProviderProps {
  mutations: any;
  queries: any;
}

function ServicesContextProvider(
  props: React.PropsWithChildren<ServicesContextProviderProps>
) {
  const mutations = React.useMemo(() => {
    if (props.mutations) {
      const newMutation: Record<string, any> = {};
      Object.keys(props.mutations).forEach(key => {
        newMutation[`m_${key}`] = props.mutations[key];
      });

      return newMutation;
    }

    return {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const queries = React.useMemo(() => {
    if (props.queries) {
      const newQueris: Record<string, any> = {};
      Object.keys(props.queries).forEach(key => {
        newQueris[`q_${key}`] = props.queries[key];
      });

      return newQueris;
    }

    return {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
