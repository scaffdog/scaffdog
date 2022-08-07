export type RouteItem = {
  title: string;
  path: string;
  open?: boolean;
  children?: RouteItem[];
};

export type RoutePage = {
  id: string;
  html: string;
  title: string;
  toc: any;
};

export type RouteContext = {
  previous: RouteItem | null;
  next: RouteItem | null;
  route: RouteItem;
};
