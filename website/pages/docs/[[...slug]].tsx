import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useMDXComponent } from 'next-contentlayer/hooks';
import type { Doc } from '../../.contentlayer/generated';
import { allDocs } from '../../.contentlayer/generated';
import { mdxComponents } from '../../components/mdx-components';
import { Layout } from '../../layouts';

type Props = {
  doc: Doc;
};

const Page: NextPage<Props> = ({ doc }) => {
  const Component = useMDXComponent(doc.body.code);

  return (
    <Layout frontmatter={doc.frontmatter}>
      <Component components={mdxComponents} />
    </Layout>
  );
};

export default Page;

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = allDocs.map((doc) => {
    const id = doc._id.replace('docs/', '').replace('.mdx', '');
    return {
      params: {
        slug: id.split('/').flatMap((v) => (v === 'index' ? [] : v)),
      },
    };
  });
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const slug = ctx.params?.slug as string[] | undefined;

  if (slug == null || slug.length === 0) {
    return {
      props: {
        doc: allDocs.find((doc) => doc._id === 'docs/index.mdx')!,
      },
    };
  }

  return {
    props: {
      doc: allDocs.find((doc) => doc.slug.endsWith(slug.join('/'))),
    },
  };
};
