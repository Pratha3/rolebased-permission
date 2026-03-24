export function normalizeId<T extends { _id?: string; id?: string }>(obj: T | null | undefined) {
  if (!obj) return obj as any;
  const { _id, id, ...rest } = obj as any;
  return { ...rest, id: _id ?? id } as T & { id: string };
}

export function normalizeList(list: any[] | undefined | null) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => normalizeId(item));
}