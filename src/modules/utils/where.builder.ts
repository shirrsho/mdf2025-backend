function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildWhereBuilder(
  where: Record<string, any>,
): Record<string, any> {
  type Range = { min?: number; max?: number };
  const whereBuilder: Record<string, any> = {};

  for (const [key, value] of Object.entries(where)) {
    if (Array.isArray(value)) {
      whereBuilder[key] = { $in: value };
    } else if (typeof value === 'string') {
      whereBuilder[key] = { $regex: escapeRegex(value), $options: 'i' };
    } else if (typeof value === 'object' && value !== null) {
      const { min, max } = value as Range;
      whereBuilder[key] = {
        ...(min !== undefined ? { $gte: min } : {}),
        ...(max !== undefined ? { $lte: max } : {}),
      };
    } else {
      whereBuilder[key] = value;
    }
  }
  return whereBuilder;
}
