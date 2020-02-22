import React from 'react';
import narrowObject from 'narrow-object';
import {
  BaseEndpointType,
  UseMutationOptions,
  UseMutationResult,
  EndpointsVariablesType,
} from '../helpers';
import { useApiCallContext } from '../contexts/api-call';
import { useMutationContext } from '../contexts/mutation';

function useMutation<T extends BaseEndpointType>(
  mutationFunction: T,
  userOptions: UseMutationOptions<T> = {}
): UseMutationResult<T> {
  const { hasMutation } = useApiCallContext();
  if (!hasMutation(mutationFunction)) {
    throw new Error('You Should Must Be Mutation');
  }

  const { mutationHandler } = useMutationContext();
  const [state, setState] = React.useState({
    data: null,
    error: null,
    loading: false,
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const options = React.useMemo(() => ({ variables: {}, ...userOptions }), [
    narrowObject(userOptions).toString(),
  ]);
  const mutation = React.useCallback(
    (variables?: EndpointsVariablesType<T>) => {
      setState({ ...state, error: null, loading: true });

      return mutationHandler({
        mutation: mutationFunction,
        variables: { ...options.variables, ...variables },
        refetchQueries: options.refetchQueries,
      })
        .then(data => {
          setState({
            loading: false,
            data,
            error: null,
          });

          return data;
        })
        .catch(error => {
          setState({ ...state, error, loading: false });
          throw error;
        });
    },
    [
      mutationHandler,
      mutationFunction,
      options.refetchQueries,
      options.variables,
      state,
    ]
  );

  return React.useMemo(
    () => ({
      ...state,
      mutation,
    }),
    [mutation, state]
    // TODO: remove any type
  ) as any;
}

export default useMutation;
