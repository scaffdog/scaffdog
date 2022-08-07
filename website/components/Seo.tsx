import { NextSeo } from 'next-seo';

export type Props = {
  title: string;
  description: string;
};

export const Seo: React.FC<Props> = ({ title, description }) => {
  return (
    <NextSeo
      title={title}
      description={description}
      openGraph={{ title, description }}
      titleTemplate="%s - scaffdog"
    />
  );
};
