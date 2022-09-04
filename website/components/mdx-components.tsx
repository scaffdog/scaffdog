import NextImage from 'next/image';
import * as Chakra from '@chakra-ui/react';
import { LinkedHeading } from './LinkedHeading';
import type { Language } from './Highlight';
import { Highlight } from './Highlight';

const { Alert, Heading, Box, chakra, Kbd } = Chakra;

const Pre: React.FC<any> = ({ children, ...rest }) => (
  <chakra.div {...rest}>{children}</chakra.div>
);

const CodeBlock: React.FC<any> = (props) => {
  const { className, children } = props.children.props as {
    className?: string;
    children: string;
  };

  const code = children?.trim() ?? '';
  const language = className?.replace('language-', '') as Language;

  return <Highlight code={code} language={language} />;
};

export const mdxComponents: Record<string, React.FC<any>> = {
  ...(Chakra as any),
  Image: (props) => (
    <Box my="3">
      <NextImage
        layout="responsive"
        width={700}
        height={400}
        objectFit="contain"
        {...props}
      />
    </Box>
  ),
  h1: (props) => <Heading as="h1" fontSize="5xl" {...props} />,
  h2: (props) => <LinkedHeading mt="6" mb="2" fontSize="4xl" {...props} />,
  h3: (props) => (
    <LinkedHeading as="h3" mt="5" mb="2" fontSize="2xl" {...props} />
  ),
  h4: (props) => (
    <LinkedHeading as="h4" mt="4" mb="0.5" fontSize="xl" {...props} />
  ),
  h5: (props) => (
    <LinkedHeading as="h5" mt="3" mb="0.5" fontSize="md" {...props} />
  ),
  h6: (props) => (
    <LinkedHeading as="h6" mt="3" mb="0.5" fontSize="md" {...props} />
  ),
  strong: (props) => <Box as="strong" fontWeight="bold" {...props} />,
  code: (props) => (
    <chakra.code
      py="0.2em"
      px="0.2em"
      bg="gray.100"
      borderRadius="sm"
      fontSize="0.875em"
      {...props}
    />
  ),
  pre: (props) =>
    typeof props.children === 'string' ? (
      <Pre {...props} />
    ) : (
      <CodeBlock {...props} />
    ),
  a: (props) => (
    <chakra.a
      color="teal.400"
      textDecoration="none"
      _hover={{
        textDecoration: 'underline',
      }}
      {...props}
    />
  ),
  p: (props) => <chakra.p mt="2" lineHeight="taller" {...props} />,
  ul: (props) => (
    <chakra.ul
      mt="1.5"
      pl="3"
      lineHeight="taller"
      sx={{
        '> li': {
          my: '1',
          pl: '0.5',
        },
        '> li::marker': {
          color: 'gray.400',
        },
      }}
      {...props}
    />
  ),
  ol: (props) => (
    <chakra.ol
      mt="1.5"
      pl="3"
      lineHeight="taller"
      sx={{
        '> li': {
          my: '1',
          pl: '0.5',
        },
        '> li::marker': {
          color: 'gray.400',
        },
      }}
      {...props}
    />
  ),
  li: (props) => <chakra.li {...props} />,
  table: (props) => (
    <chakra.div my="3" overflowX="auto">
      <chakra.table textAlign="left" width="full" {...props} />
    </chakra.div>
  ),
  th: (props) => (
    <chakra.th
      py="1"
      px="1.5"
      bg="gray.50"
      fontWeight="bold"
      fontSize="sm"
      {...props}
    />
  ),
  td: (props) => (
    <chakra.td
      py="1"
      px="1.5"
      borderTopWidth={1}
      borderColor="gray.200"
      fontSize="sm"
      whiteSpace="normal"
      {...props}
    />
  ),
  // TODO
  blockquote: (props) => <chakra.blockquote {...props} />,
  kbd: Kbd,
  hr: (props) => <chakra.hr my="5" {...props} />,
  Alert,
};
