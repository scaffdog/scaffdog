import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { DefaultSeo } from 'next-seo';
import type { AppProps } from 'next/app';
import Head from 'next/head';

const space = {
  px: '1px',
  0.5: '0.25rem', // 4px
  1: '0.5rem', // 8px
  1.5: '0.75rem', // 12px
  2: '1rem', // 16px
  2.5: '1.25rem', // 20px
  3: '1.5rem', // 24px
  3.5: '1.75rem', // 28px
  4: '2rem', // 32px
  5: '2.5rem', // 40px
  6: '3rem', // 48px
  7: '3.5rem', // 56px
  8: '4rem', // 64px
  9: '4.5rem', // 72px
  10: '5rem', // 80px
  12: '6rem', // 96px
  14: '7rem', // 112px
  16: '8rem', // 128px
  20: '10rem', // 160px
  24: '12rem', // 192px
  28: '14rem', // 224px
  32: '16rem', // 256px
  36: '18rem', // 288px
  40: '20rem', // 320px
  44: '22rem', // 352px
  48: '24rem', // 384px
  52: '26rem', // 416px
  56: '28rem', // 448px
  60: '30rem', // 480px
  64: '32rem', // 512px
  72: '36rem', // 576px
  80: '40rem', // 640px
  96: '48rem', // 768px
};

const theme = extendTheme({
  styles: {
    global: {
      body: {
        '-webkit-font-smoothing': 'antialiased',
        '-moz-osx-font-smoothing': 'grayscale',
      },
    },
  },
  colors: {
    brand: {
      pink: '#ff5656',
      cyan: '#42e8dc',
      yellow: '#ffdd36',
      purple: '#ab68ff',
    },
  },
  space,
  sizes: {
    ...space,
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1440px',
    },
  },
  components: {
    Container: {
      baseStyle: {
        px: '1.5rem',
      },
      sizes: {
        md: {
          px: '2.5rem',
        },
      },
    },
    Button: {
      baseStyle: {
        borderRadius: 'md',
        fontWeight: 'bold',
      },
      sizes: {
        sm: {
          py: '0.5',
          px: '1.5',
          h: '4',
        },
        md: {
          py: '1',
          px: '2.5',
          h: '6',
        },
      },
    },
    Input: {
      sizes: {
        md: {
          field: {
            py: '2',
            px: '2',
            h: '5',
          },
        },
      },
      defaultProps: {
        focusBorderColor: 'purple.500',
      },
    },
    FormLabel: {
      baseStyle: {
        mb: '1',
        marginEnd: '1',
      },
    },
    Form: {
      baseStyle: {
        helperText: {
          mt: '1',
        },
      },
    },
  },
});

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <meta content="IE=edge" httpEquiv="X-UA-Compatible" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#319795" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </Head>

      <DefaultSeo
        defaultTitle="scaffdog - Markdown driven scaffolding tool."
        description="Markdown driven scaffolding tool. scaffdog speeds up the first steps of your creative activity."
        openGraph={{
          type: 'website',
          title: 'scaffdog - Markdown driven scaffolding tool.',
          description:
            'Markdown driven scaffolding tool. scaffdog speeds up the first steps of your creative activity.',
          site_name: 'scaffdog - documentation',
          url: 'https://scaff.dog',
          images: [
            {
              type: 'image/png',
              url: 'https://scaff.dog/ogp.png',
              alt: 'scaffdog - Markdown driven scaffolding tool.',
              width: 1280,
              height: 640,
            },
          ],
        }}
        twitter={{
          handle: '@wadackel',
          site: '@scaffdog',
          cardType: 'summary_large_image',
        }}
      />

      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
};

export default App;
