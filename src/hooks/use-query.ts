import React from 'react';
import narrowObject, { narrowToString } from 'narrow-object';
import { BaseQuery, UseQueryOptions, UseQueryResult } from '../helpers';
import { usePrevious, useObjectState } from '../utils/hooks';
import { useApiCallContext } from '../contexts/api-call';
import { useQueryContext } from '../contexts/query';

function useQuery<T extends BaseQuery>(
  query: T,
  userOptions: UseQueryOptions<T> = {}
): UseQueryResult<T> {
  const { hasQuery } = useApiCallContext();
  if (!hasQuery(query)) {
    throw new Error('You Should Must Be query');
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const options = React.useMemo(() => ({ variables: {}, ...userOptions }), [
    narrowToString(narrowObject(userOptions)),
  ]);
  const prevOptions = usePrevious(options);
  const { queryHandler, getDataByRouteId } = useQueryContext();
  const [state, setState] = useObjectState({
    routeId: '',
    error: null,
    loading: !options.skip,
    isCompleted: false,
  });
  const getQuery = React.useCallback(() => {
    if (options.skip) {
      return;
    }
    if (
      narrowToString(narrowObject(prevOptions || {})) !==
      narrowToString(narrowObject(options))
    ) {
      if (state.loading === false || state.isCompleted === true) {
        setState({ loading: true, isCompleted: false });
      }

      queryHandler({
        query,
        variables: options.variables,
      })
        .then(({ routeId }) => {
          setState({
            routeId,
            loading: false,
            isCompleted: true,
          });
        })
        .catch(e => {
          setState({ error: e, loading: false });
          throw e;
        });
    }
  }, [
    options,
    prevOptions,
    state.loading,
    state.isCompleted,
    queryHandler,
    query,
    setState,
  ]);

  React.useEffect(() => {
    getQuery();
  }, [getQuery]);

  const data = React.useMemo(() => {
    if (state.routeId) {
      return getDataByRouteId(state.routeId);
    }

    return { result: options.defaultValue || null };
  }, [getDataByRouteId, options.defaultValue, state.routeId]);

  return React.useMemo(
    () => ({
      data: data.result,
      id: data.id,
      loading: state.loading,
      error: state.error,
    }),
    [data, state.error, state.loading]
  );
}

export default useQuery;
