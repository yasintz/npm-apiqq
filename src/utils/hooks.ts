import React from 'react';

function usePrevious<T>(value: T, setInitial?: boolean): T | undefined {
  const ref = React.useRef<T | undefined>(setInitial ? value : undefined);

  React.useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

type UseObjectStateSetStateAction<T> = (
  newValue: Partial<T>,
  isCompletely?: boolean
) => void;

function useObjectState<T>(
  initialState: T
): [T, UseObjectStateSetStateAction<T>] {
  const [state, setState] = React.useState(initialState);
  const setMergedState = React.useCallback((newState, isCompletely) => {
    if (isCompletely) {
      setState(newState);
    } else {
      setState(prevState => ({ ...prevState, ...newState }));
    }
  }, []);

  return [state, setMergedState];
}

export { usePrevious, useObjectState };
