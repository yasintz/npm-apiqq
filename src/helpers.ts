export type MaybeArray<T> = T | T[];

export interface RouteSchema {
  id: string;
  props?: {
    [key: string]: RouteSchema | RouteSchema[];
  };
}

export interface QueryGetterResult {
  data: any;
  isFetched: boolean;
}

export type QueryGetter = (query: Promise<any>, variables: any) => QueryGetterResult;

export type BasicQuery = (vars: any, queryGetter: QueryGetter) => Promise<any>;

export type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

export type FirstArgument<F extends Function> = ArgumentTypes<F>[0];
type ThenArg<T> = T extends Promise<infer U> ? U : T;

export type EndpointsResultType<F> = F extends (v: any) => Promise<any> ? ThenArg<ReturnType<F>> | null : F;

export type EndpointsVariablesType<F> = F extends Function ? ArgumentTypes<F>[0] : F;

export interface MutationContextProviderProps {}

export type RefetchQueryType = 'normal' | 'chain';

export type DataHandler<MR, T> = (mr: MR, prevResult: EndpointsResultType<T>) => EndpointsResultType<T>;

export interface RefetchQuery<T = any, MR = any> {
  query: T;
  variables?: EndpointsVariablesType<T>;
  type?: RefetchQueryType;
  dataHandler?: DataHandler<MR, T>;
}

export interface RefetchFactoryResult<T = any, MR = any> {
  variables?: EndpointsVariablesType<T>;
  type?: RefetchQueryType;
  dataHandler?: DataHandler<MR, T>;
}

export type MutationHandlerParams = {
  mutation: (vars: any, queryGetter: QueryGetter) => Promise<any>;
  variables: any;
  refetchQueries?: RefetchQuery[];
};

export interface MutationContextType {
  mutationHandler: (params: MutationHandlerParams) => Promise<any>;
}

export type BaseEndpointType = (vars: any) => Promise<any>;

export type UseMutationResult<Mutation> = {
  mutation: (vars?: EndpointsVariablesType<Mutation>) => Promise<EndpointsResultType<Mutation>>;
  loading: boolean;
  error: any;
  data: EndpointsResultType<Mutation>;
};

export type UseMutationOptions<T> = {
  refetchQueries?: RefetchQuery<any, EndpointsResultType<T>>[];
  variables?: EndpointsVariablesType<T>;
};

export interface ApiCallContextProviderProps {
  mutations: any;
  queries: any;
}

export interface ApiCallContextType {
  fetchIfNotExist: (query: BasicQuery, vars: any) => Promise<any>;
  fetch: (query: BasicQuery, vars: any, staticData?: any) => Promise<any>;
  getRouteId: (query: QueryHandlerParams['query'], variables?: Record<string, any>) => string;
  hasQuery: (q: any) => boolean;
  hasMutation: (q: any) => boolean;
  queryGetter: QueryGetter;
}

export interface DatabaseObjectContextProviderProps {}

export interface DatabaseObjectsContextType {
  setObjectsFromBackendResponse: (obj: any) => void;
  getObjects: () => Record<string, any>;
  getObject: (id: string) => any;
}

interface PaginationQueryRequiredVariables {
  pageNumber: number;
}

export type QueryHandlerParams<T = (v?: any) => Promise<any>> = {
  query: (vars: EndpointsVariablesType<T>) => Promise<EndpointsResultType<T>>;
  variables: EndpointsVariablesType<T>;
};

export interface QueryContextType {
  queryHandler: (params: QueryHandlerParams) => Promise<{ routeId: string; queryResult: any } & QueryHandlerParams>;
  refetchQueries: (params: RefetchQuery[], mutationResult: any) => Promise<any>;
  getDataByRouteId: (id: string) => any;
  staticDataParser: (
    params: QueryHandlerParams<(v?: any) => Promise<any>>,
  ) => (
    data: any,
  ) => {
    queryResult: any;
    query: (vars: any) => Promise<any>;
    variables: any;
    paginationVariables?: PaginationQueryRequiredVariables;
    routeId: string;
  };
}

export type BaseQuery = (v: any) => Promise<any>;

export type UseQueryResult<Query> = {
  data: EndpointsResultType<Query>;
  id: string;
  loading: boolean;
  error: any;
};

export type UseQueryOptions<T> = {
  skip?: boolean;
  defaultValue?: Partial<EndpointsResultType<T>>;
  variables?: EndpointsVariablesType<T>;
};

export interface PaginationQueryContextType {
  queryHandler: (
    params: QueryHandlerParams,
  ) => Promise<{ routeId: string; lastPageNumber: number; elementCountOfPage: number }>;
  refetchQueries: (params: RefetchQuery[]) => Promise<any>;
  getDataByRouteId: (id: string) => any;
}

export interface PaginationResult<Q> {
  first: boolean;
  last: boolean;
  nextPage: number;
  previusPageIndex: number;
  values: (EndpointsResultType<Q> & { pageIndex: number })[];
  totalElements: number;
  totalPage: number;
}

export type UsePaginationQueryResult<T> = {
  loading: boolean;
  getDataByPage: (pageNumber: number) => PaginationResult<T>;
  data: PaginationResult<T>;
  error: any;
};

export type UsePaginationQueryOptions<T> = PaginationQueryRequiredVariables & {
  skip?: boolean;
  // eslint-disable-next-line  @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  defaultValue?: Partial<PaginationResult<T>>;
  variables?: EndpointsVariablesType<T>;
};
