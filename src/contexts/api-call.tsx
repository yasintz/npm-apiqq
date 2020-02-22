import * as React from 'react';
import narrowObject from 'narrow-object';
import QQueue from 'qqueue';
import routeSchema from 'route-schema';
import {
  ApiCallContextType,
  ApiCallContextProviderProps,
  QueryHandlerParams,
  BasicQuery,
  QueryGetter,
} from '../helpers';
import { useDatabaseObjectsContext } from './objects';
import { getRouteByEndpoint, getKeyByValue } from '../utils';
const initialValue: ApiCallContextType = {
  fetch: () => Promise.resolve(),
  fetchIfNotExist: () => Promise.resolve(),
  getRouteId: () => '',
  hasQuery: () => false,
  hasMutation: () => false,
  queryGetter: () => ({ isFetched: false, data: null }),
};

const ApiCallContext = React.createContext(initialValue);

function useApiCallContext() {
  return React.useContext(ApiCallContext);
}

const queryQueue: Record<string, QQueue> = {};
const queryResults: Record<string, any> = {};

const getQueue = (routeId: string) => {
  return queryQueue[routeId];
};

const getQueueOrCreate = (routeId: string) => {
  const queue = getQueue(routeId);
  if (queue) {
    return queue;
  }
  queryQueue[routeId] = new QQueue();

  return queryQueue[routeId];
};

const dataWriter = (result: any, routeId: string) => {
  queryResults[routeId] = { result, id: routeId };

  return queryResults[routeId];
};

const getQueryResult = (routeId: string) => queryResults[routeId];
const isRouteFetched = (routeId: string) => Boolean(queryResults[routeId]);

function ApiCallContextProvider(
  props: React.PropsWithChildren<ApiCallContextProviderProps>
) {
  const databaseContext = useDatabaseObjectsContext();
  const getRouteId = React.useCallback(
    (query: QueryHandlerParams['query'], variables?: Record<string, any>) => {
      const endpointKey = getRouteByEndpoint(props.queries, query);
      const variablesNarrowString = narrowObject(variables || {}).toString();

      return endpointKey + variablesNarrowString;
    },
    [props.queries]
  );

  const queryGetter = React.useCallback<QueryGetter>(
    (query, variables) => {
      const routeId = getRouteId(query as any, variables);

      return {
        data: queryResults[routeId],
        isFetched: isRouteFetched(routeId),
      };
    },
    [getRouteId]
  );

  const hasQuery = React.useCallback(
    (query: any) => getKeyByValue(props.queries, query) !== undefined,
    [props.queries]
  );

  const hasMutation = React.useCallback(
    (mutation: any) => getKeyByValue(props.mutations, mutation) !== undefined,
    [props.mutations]
  );

  const fetch = React.useCallback(
    async (query: BasicQuery, variables: any, staticData?: any) => {
      const routeId = getRouteId(query as any, variables);
      if (staticData) {
        return dataWriter(staticData, routeId);
      }

      return getQueueOrCreate(routeId).push(async () =>
        query(variables, queryGetter).then(result =>
          dataWriter(result, routeId)
        )
      );
    },
    [getRouteId, queryGetter]
  );

  // TODO: remove any type
  const fetchIfNotExist: any = React.useCallback(
    (query: BasicQuery, variables: any) => {
      const routeId = getRouteId(query as any, variables);
      if (isRouteFetched(routeId)) {
        return Promise.resolve(getQueryResult(routeId));
      }
      const queue = getQueue(routeId);
      if (queue) {
        return queue.push(async () => fetchIfNotExist(query, variables));
      }

      return fetch(query, variables);
    },
    [getRouteId, fetch]
  );

  React.useEffect(() => {
    Object.keys(queryResults).forEach(routeId => {
      const oldData = getQueryResult(routeId);
      const schema = routeSchema.dataToSchema(oldData);
      const newData = routeSchema.schemaToData(
        schema,
        databaseContext.getObjects()
      );
      if (
        narrowObject(oldData).toString() !== narrowObject(newData).toString()
      ) {
        queryResults[routeId] = newData;
      }
    });
  }, [databaseContext]);

  const contextValue = React.useMemo<ApiCallContextType>(
    () => ({
      fetchIfNotExist,
      fetch,
      getRouteId,
      hasQuery,
      hasMutation,
      queryGetter,
    }),
    [fetchIfNotExist, fetch, getRouteId, hasQuery, hasMutation, queryGetter]
  );

  return (
    <ApiCallContext.Provider value={contextValue}>
      {props.children}
    </ApiCallContext.Provider>
  );
}

export { useApiCallContext };

export default ApiCallContextProvider;
