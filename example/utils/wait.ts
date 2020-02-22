export function wait<T = undefined>(amount = 0, response: T): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(response), amount));
}
