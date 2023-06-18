'use client';

import { useMDXComponent } from 'next-contentlayer/hooks';
import type { Doc } from '../../../.contentlayer/generated';
import { PageContainer } from '../../../components/PageContainer';
import { Pagination } from '../../../components/Pagination';
import { Sidebar } from '../../../components/Sidebar';
import { mdxComponents } from '../../../components/mdx-components';
import { sidebar } from '../../../routing/sidebar';
import { findRouteByPath, getRouteContext } from '../../../routing/utils';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';

export type Props = {
  doc: Doc;
};

export const Docs: React.FC<Props> = ({ doc }) => {
  const Component = useMDXComponent(doc.body.code);

  const route = findRouteByPath(doc.frontmatter.slug, sidebar);
  if (route == null) {
    throw new Error(`"${doc.frontmatter.slug}" is not exists`);
  }

  const context = getRouteContext(route, sidebar);

  return (
    <>
      <Header />

      <PageContainer
        frontmatter={doc.frontmatter}
        sidebar={<Sidebar />}
        pagination={
          <Pagination previous={context.previous} next={context.next} />
        }
      >
        <Component components={mdxComponents as never} />
      </PageContainer>

      <Footer />
    </>
  );
};
