import dynamic from 'next/dynamic';

const MdxLayout = dynamic(() => import('./MdxLayout'));

export type Props = {
  frontmatter: any;
  children: React.ReactNode;
};

export const Layout: React.FC<Props> = ({ frontmatter, ...rest }) => {
  const slug = frontmatter?.slug ?? '';

  const layouts = {
    docs: <MdxLayout frontmatter={frontmatter} {...rest} />,
  };

  const layout = Object.entries(layouts).find(([p]) =>
    slug.startsWith(`/${p}`),
  );

  if (layout == null) {
    return null;
  }

  return layout[1];
};
