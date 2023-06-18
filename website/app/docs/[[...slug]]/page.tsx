import type { Metadata, NextPage } from 'next';
import type { Doc } from '../../../.contentlayer/generated';
import { allDocs } from '../../../.contentlayer/generated';
import { Docs } from './Docs';

const getDoc = (slug: string[] | undefined): Doc => {
  const doc = allDocs.find((doc) => {
    return slug == null || slug.length === 0
      ? doc._id === 'docs/index.mdx'
      : doc.slug.endsWith(slug.join('/'));
  });
  if (doc == null) {
    throw new Error(`"${slug}" does not exists in all documents.`);
  }
  return doc;
};

type Props = {
  params: {
    slug: string[] | undefined;
  };
};

export const generateStaticParams = () => {
  return allDocs.map((doc) => {
    const id = doc._id.replace('docs/', '').replace('.mdx', '');
    return {
      slug: id.split('/').flatMap((v) => (v === 'index' ? [] : v)),
    };
  });
};

export const generateMetadata = async ({
  params: { slug },
}: Props): Promise<Metadata> => {
  const doc = getDoc(slug);

  return {
    title: doc.title,
    description: doc.description,
    openGraph: {
      title: doc.title,
      description: doc.description,
    },
  };
};

const DocPage: NextPage<Props> = ({ params: { slug } }) => {
  const doc = getDoc(slug);

  return <Docs doc={doc} />;
};

export default DocPage;
