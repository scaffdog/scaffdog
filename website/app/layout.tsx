import type { Metadata } from 'next';
import { Providers } from './providers';

type Props = React.PropsWithChildren<{}>;

export const metadata: Metadata = {
  title: {
    absolute: 'scaffdog - Markdown driven scaffolding tool.',
    template: '%s | scaffdog',
  },
  description:
    'Markdown driven scaffolding tool. scaffdog speeds up the first steps of your creative activity.',
  openGraph: {
    type: 'website',
    title: {
      absolute: 'scaffdog - Markdown driven scaffolding tool.',
      template: '%s | scaffdog',
    },
    description:
      'Markdown driven scaffolding tool. scaffdog speeds up the first steps of your creative activity.',
    siteName: 'scaffdog - documentation',
    url: 'https://scaff.dog',
    images: {
      type: 'image/png',
      url: 'https://scaff.dog/ogp.png',
      alt: 'scaffdog - Markdown driven scaffolding tool.',
      width: 1280,
      height: 640,
    },
  },
  twitter: {
    creator: '@wadackel',
    site: '@scaffdog',
    card: 'summary_large_image',
  },
};

const RootLayout: React.FC<Props> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta content="IE=edge" httpEquiv="X-UA-Compatible" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#319795" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>

      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
