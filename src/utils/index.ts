import {
  MaybeArray,
  RefetchFactoryResult,
  RefetchQuery,
  EndpointsResultType,
} from '../helpers';

/* eslint-disable @typescript-eslint/no-explicit-any */

function isArray<T>(o: MaybeArray<T>): o is Array<T> {
  return Array.isArray(o);
}
const isObject = (o: any) =>
  !isArray(o) && typeof o === 'object' && o !== null && o !== undefined;

function objectKeys<K extends string>(obj: Record<K, any>): K[] {
  return Object.keys(obj) as K[];
}
function objectForeach<K extends string, V>(
  obj: Record<K, V>,
  callback: (key: K, value: V) => void
) {
  Object.keys(obj).forEach(key => callback(key as K, obj[key as K]));
}

function getKeyByValue(obj: any, value: any): string {
  return Object.keys(obj).find(key => obj[key] === value) as string;
}

async function asyncMap(array: (() => Promise<any>)[]): Promise<any> {
  if (array.length === 0) {
    return Promise.resolve();
  }
  if (array.length === 1) {
    return array[0]();
  }
  for (let index = 0; index < array.length; index++) {
    // eslint-disable-next-line no-await-in-loop
    await array[index]();
  }

  return Promise.resolve();
}

function getRouteByEndpoint(queries: any, query: any) {
  return getKeyByValue(queries, query);
}

function refetchFactory<M, T>(
  query: T,
  {
    variables,
    dataHandler,
    type,
  }: RefetchFactoryResult<T, EndpointsResultType<M>> = {}
): RefetchQuery<T> {
  return {
    query,
    // TODO: PREV: variables: { ...variables },
    variables,
    dataHandler: dataHandler || (d => d),
    type: type || 'normal',
  };
}
function deepMergeIdObjects(cache: any, newData: any): any {
  const modifiedData: Record<string, any> = {};
  objectKeys(newData).forEach(id => {
    modifiedData[id] = { ...cache[id], ...newData[id] };
  });

  return { ...cache, ...modifiedData };
}

export {
  isObject,
  getKeyByValue,
  objectKeys,
  objectForeach,
  asyncMap,
  isArray,
  getRouteByEndpoint,
  refetchFactory,
  deepMergeIdObjects,
};
