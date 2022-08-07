import type { RouteContext, RouteItem } from './types';

const flattenRoutes = (routes: RouteItem[]): RouteItem[] =>
  routes.flatMap((route) => [
    route,
    ...(route.children != null ? route.children : []),
  ]);

export const findRouteByPath = (
  path: string,
  routes: RouteItem[],
): RouteItem | null => {
  let result: RouteItem | null = null;
  for (const route of routes) {
    if (route.path === path) {
      return route;
    }
    if (route.children != null) {
      result = findRouteByPath(path, route.children);
    }
  }
  return result;
};

export const getRouteContext = (
  route: RouteItem,
  routes: RouteItem[],
): RouteContext => {
  const context: RouteContext = {
    previous: null,
    next: null,
    route,
  };

  const all = flattenRoutes(routes);

  for (let i = 0; i < all.length; i++) {
    const item = all[i];
    if (item.path === route.path) {
      context.previous = all[i - 1] ?? null;
      context.next = all[i + 1] ?? null;
      continue;
    }
  }

  return context;
};
