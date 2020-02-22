import * as React from 'react';
import routeSchema from 'route-schema';
import deepEqual from 'deep-equal';
import {
  QueryContextType,
  MaybeArray,
  RouteSchema,
  QueryHandlerParams,
  RefetchQuery,
} from '../helpers';
import { useDatabaseObjectsContext } from './objects';
import { useApiCallContext } from './api-call';
import { useObjectState } from '../utils/hooks';
import { deepMergeIdObjects, objectForeach, asyncMap } from '../utils';

interface QueryContextProviderProps {}

const initialValue: QueryContextType = {
  queryHandler: () =>
    Promise.resolve({
      routeId: '',
      query: async () => {},
      variables: {},
      queryResult: {},
    }),
  refetchQueries: () => Promise.resolve(0),
  getDataByRouteId: () => null,
  staticDataParser: () => () =>
    Promise.resolve({
      queryResult: null,
      query: () => Promise.resolve({} as any),
      variables: null,
      routeId: '',
    }) as any,
};

const QueryContext = React.createContext<QueryContextType>(initialValue);

function useQueryContext() {
  return React.useContext(QueryContext);
}

const backendObjectFunctions = routeSchema;

function QueryContextProvider(
  props: React.PropsWithChildren<QueryContextProviderProps>
) {
  const databaseContext = useDatabaseObjectsContext();
  const { fetchIfNotExist, fetch, getRouteId } = useApiCallContext();
  const [routeDataStore, setRouteDataStore] = useObjectState<
    Record<string, any>
  >({});
  const [routeSchemas, setRouteSchemas] = useObjectState<
    Record<string, MaybeArray<RouteSchema>>
  >({});

  const isRouteCacheTaken = React.useCallback(
    (routeId: string) =>
      Boolean(routeSchemas[routeId] && routeDataStore[routeId]),
    [routeDataStore, routeSchemas]
  );

  const getDataByRouteId = React.useCallback(
    (routeId: string) => {
      const result = routeDataStore[routeId];

      return result;
    },
    [routeDataStore]
  );

  const staticDataParser = React.useCallback(
    (params: QueryHandlerParams) => (data: any) => {
      const currenRouteId = getRouteId(params.query, params.variables);
      const newStorageObj: Record<string, any> = {};
      const newSchema = backendObjectFunctions.dataToSchema(data);

      const seperatedObj = backendObjectFunctions.separateData(data, true);
      if (seperatedObj !== null) {
        const idDatabaseNewValue = deepMergeIdObjects(
          databaseContext.getObjects(),
          seperatedObj
        );

        if (!deepEqual(idDatabaseNewValue, databaseContext.getObjects())) {
          databaseContext.setObjectsFromBackendResponse(seperatedObj);
        }
        if (isRouteCacheTaken(currenRouteId)) {
          const currentRoutePrevSchema = routeSchemas[currenRouteId];
          const isChangeCurrentRoute = !deepEqual(
            routeDataStore[currenRouteId],
            backendObjectFunctions.schemaToData(
              // TODO: export Scheme type from route-schema module
              currentRoutePrevSchema as any,
              databaseContext.getObjects()
            )
          );

          if (isChangeCurrentRoute) {
            newStorageObj[currenRouteId] = data;
          }
          if (!deepEqual(newSchema, currentRoutePrevSchema)) {
            setRouteSchemas({ [currenRouteId]: newSchema } as any);
          }
          if (
            !deepEqual(routeDataStore, { ...routeDataStore, ...newStorageObj })
          ) {
            setRouteDataStore(newStorageObj);
          }

          return { routeId: currenRouteId, ...params, queryResult: data };
        }
        setRouteDataStore({ [currenRouteId]: data });
        setRouteSchemas({ [currenRouteId]: newSchema } as any);
      }

      return { routeId: currenRouteId, ...params, queryResult: data };
    },
    [
      databaseContext,
      getRouteId,
      isRouteCacheTaken,
      routeDataStore,
      routeSchemas,
      setRouteDataStore,
      setRouteSchemas,
    ]
  );

  const updateStoreIfUsedIdsChange = React.useCallback(() => {
    const changedRoutes: string[] = [];
    const newStorageObj: Record<string, any> = {};
    const databaseObjects = databaseContext.getObjects();
    objectForeach(routeDataStore, routeId => {
      if (isRouteCacheTaken(routeId)) {
        const currentRoutePrevSchema = routeSchemas[routeId];
        const isChangeCurrentRoute = !deepEqual(
          routeDataStore[routeId],
          backendObjectFunctions.schemaToData(
              // TODO: export Scheme type from route-schema module
            currentRoutePrevSchema as any,
            databaseObjects
          )
        );

        if (isChangeCurrentRoute) {
          changedRoutes.push(routeId);
        }
      }
    });
    changedRoutes.forEach(route => {
      if (Object.keys(databaseObjects).length > 0) {
        newStorageObj[route] = backendObjectFunctions.schemaToData(
              // TODO: export Scheme type from route-schema module
          routeSchemas[route] as any,
          databaseObjects
        );
      }
    });
    if (!deepEqual(routeDataStore, { ...routeDataStore, ...newStorageObj })) {
      setRouteDataStore(newStorageObj);
    }
  }, [
    databaseContext,
    routeDataStore,
    routeSchemas,
    setRouteDataStore,
    isRouteCacheTaken,
  ]);

  const queryHandler = React.useCallback(
    (params: QueryHandlerParams) => {
      return fetchIfNotExist(params.query, params.variables).then(
        staticDataParser(params)
      );
    },
    [fetchIfNotExist, staticDataParser]
  );

  const refetchQueries = React.useCallback(
    (queries: Array<RefetchQuery> = [], mutationResult: any) => {
      const defaultValue = {
        type: 'normal',
        dataHandler: (m: any) => m,
        variables: {},
      };
      const queriesWithDefaultVals = queries
        .map(item => ({ ...defaultValue, ...item }))
        .filter(({ query, variables }) =>
          isRouteCacheTaken(getRouteId(query, variables))
        );
      const fetchingQueries = queriesWithDefaultVals.filter(
        ({ type }) => type === 'normal'
      );
      const chainQueries = queriesWithDefaultVals.filter(
        ({ type }) => type === 'chain'
      );

      return asyncMap([
        ...fetchingQueries.map(({ query, variables }) => () =>
          fetch(query, variables).then(staticDataParser({ query, variables }))
        ),
        ...chainQueries.map(({ query, variables, dataHandler }) => async () =>
          fetch(
            query,
            variables,
            dataHandler(
              mutationResult,
              getDataByRouteId(getRouteId(query, variables)).result
            )
          ).then(staticDataParser({ query, variables }))
        ),
      ]);
    },
    [fetch, getDataByRouteId, getRouteId, isRouteCacheTaken, staticDataParser]
  );

  React.useEffect(() => {
    updateStoreIfUsedIdsChange();
  }, [updateStoreIfUsedIdsChange]);

  const contextValues = React.useMemo<QueryContextType>(
    () => ({
      staticDataParser,
      queryHandler,
      refetchQueries,
      getDataByRouteId,
    }),
    [getDataByRouteId, queryHandler, refetchQueries, staticDataParser]
  );

  return (
    <QueryContext.Provider value={contextValues}>
      {props.children}
    </QueryContext.Provider>
  );
}

export { useQueryContext };

export default QueryContextProvider;
