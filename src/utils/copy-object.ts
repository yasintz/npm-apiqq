import { objectForeach } from '.';

export function copyObject(object: any, key: string) {
  if (!object) {
    return {};
  }

  const newObject: Record<string, any> = {};
  objectForeach(object, (k, value) => {
    newObject[`${key}_${k}`] = value;
  });

  return newObject;
}
