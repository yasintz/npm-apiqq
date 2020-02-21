import * as React from 'react';
import routeSchema from 'route-schema';
import {
  MutationContextType,
  MutationContextProviderProps,
  MutationHandlerParams,
} from '../helpers';
import { useQueryContext } from './query';
import { useDatabaseObjectsContext } from './objects';
import { useApiCallContext } from './api-call';

const initialValue: MutationContextType = {
  mutationHandler: () => Promise.resolve(0),
};

const MutationContext = React.createContext(initialValue);

export const useMutationContext = () => React.useContext(MutationContext);

export { MutationContext };

function MutationContextProvider(
  props: React.PropsWithChildren<MutationContextProviderProps>
) {
  const queryContext = useQueryContext();
  const databaseObjectsContext = useDatabaseObjectsContext();
  const { queryGetter } = useApiCallContext();

  const mutationHandler = React.useCallback(
    ({ mutation, variables, refetchQueries }: MutationHandlerParams) => {
      return mutation(variables, queryGetter).then(mutationResult => {
        // TODO: update route scheme routeSchema.separateData(mutationResult, true);
        const seperatedData = routeSchema.separateData(mutationResult);
        if (seperatedData !== null) {
          databaseObjectsContext.setObjectsFromBackendResponse(seperatedData);
        }
        if (refetchQueries && refetchQueries.length) {
          queryContext.refetchQueries(refetchQueries, mutationResult);
        }

        return mutationResult;
      });
    },
    [databaseObjectsContext, queryContext, queryGetter]
  );

  const contextValues = React.useMemo(() => ({ mutationHandler }), [
    mutationHandler,
  ]);

  return (
    <MutationContext.Provider value={contextValues}>
      {props.children}
    </MutationContext.Provider>
  );
}

export default MutationContextProvider;
