export function stripUndefined<T>(obj: T): T {
  if (Array.isArray(obj)) return obj.map((v) => stripUndefined(v)) as unknown as T;
  if (obj && typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, any>)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, stripUndefined(v)]);
    return Object.fromEntries(entries) as T;
  }
  return obj;
}
