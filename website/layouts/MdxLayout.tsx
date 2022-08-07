import { PageContainer } from '../components/PageContainer';
import { Pagination } from '../components/Pagination';
import { Sidebar } from '../components/Sidebar';
import { sidebar } from '../routing/sidebar';
import { findRouteByPath, getRouteContext } from '../routing/utils';
import type { Frontmatter } from '../types/content';

type Props = {
  frontmatter: Frontmatter;
  children: React.ReactNode;
};

const MdxLayout: React.FC<Props> = ({ frontmatter, children }) => {
  const route = findRouteByPath(frontmatter.slug, sidebar);
  if (route == null) {
    throw new Error(`"${frontmatter.slug}" is not exists`);
  }

  const context = getRouteContext(route, sidebar);

  return (
    <PageContainer
      frontmatter={frontmatter}
      sidebar={<Sidebar />}
      pagination={
        <Pagination previous={context.previous} next={context.next} />
      }
    >
      {children}
    </PageContainer>
  );
};

export default MdxLayout;
