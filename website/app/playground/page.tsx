import type { Metadata, NextPage } from 'next';
import { Playground } from './Playground';

export const metadata: Metadata = {
  title: 'Playground',
  description: 'scaffdog online playground.',
  openGraph: {
    title: 'Playground',
    description: 'scaffdog online playground.',
  },
};

const PlaygroundPage: NextPage = () => {
  return <Playground />;
};

export default PlaygroundPage;
