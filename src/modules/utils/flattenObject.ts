export function flattenObject(
  obj: any,
  prefix = '',
  res: Record<string, any> = {},
  seen = new WeakSet(),
): Record<string, any> {
  if (obj instanceof Map) {
    obj.forEach((value, key) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (
        typeof value === 'object' &&
        value !== null &&
        !(value instanceof Map)
      ) {
        flattenObject(value, newKey, res, seen);
      } else {
        res[newKey] = value;
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    if (seen.has(obj)) {
      throw new Error('Circular reference detected in the object');
    }
    seen.add(obj);

    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (
        typeof value === 'object' &&
        value !== null &&
        !(value instanceof Map)
      ) {
        flattenObject(value, newKey, res, seen);
      } else {
        res[newKey] = value;
      }
    });

    seen.delete(obj);
  } else {
    return obj;
  }
  return res;
}
