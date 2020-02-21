import * as React from 'react';
import { useObjectState } from '../utils/hooks';
import {
  DatabaseObjectsContextType,
  DatabaseObjectContextProviderProps,
} from '../helpers';
import { deepMergeIdObjects } from '../utils';

const initialValue: DatabaseObjectsContextType = {
  setObjectsFromBackendResponse: () => {},
  getObjects: () => ({}),
  getObject: () => ({}),
};

const DatabaseObjectContext = React.createContext<DatabaseObjectsContextType>(
  initialValue
);

function useDatabaseObjectsContext() {
  return React.useContext(DatabaseObjectContext);
}

function DatabaseObjectContextProvider(
  props: React.PropsWithChildren<DatabaseObjectContextProviderProps>
) {
  const [databaseObjects, setDatabaseObjects] = useObjectState(
    {} as Record<string, any>
  );
  const setObjects = React.useCallback(
    (seperatedData: any) => {
      setDatabaseObjects(deepMergeIdObjects(databaseObjects, seperatedData));
    },
    [databaseObjects, setDatabaseObjects]
  );
  const getObjects = React.useCallback(() => databaseObjects, [
    databaseObjects,
  ]);
  const getObject = React.useCallback((id: string) => databaseObjects[id], [
    databaseObjects,
  ]);
  const contextValues = React.useMemo(
    () => ({
      setObjectsFromBackendResponse: setObjects,
      getObjects,
      getObject,
    }),
    [getObjects, setObjects, getObject]
  );

  return (
    <DatabaseObjectContext.Provider value={contextValues}>
      {props.children}
    </DatabaseObjectContext.Provider>
  );
}

export { useDatabaseObjectsContext };

export default DatabaseObjectContextProvider;
