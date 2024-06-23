/**
 * Takes a URL and returns an object with the query string parameters, multiple of the same key will be an array
 */
export function getQueryParams(url: string): Record<string, string | string[]> {
  const search = new URL(url).searchParams;
  const params: Record<string, string | string[]> = {};
  search.forEach((value, key) => {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        params[key] = [...params[key], value];
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  });
  return params;
}
