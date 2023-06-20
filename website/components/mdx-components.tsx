import * as Chakra from '@chakra-ui/react';
import NextImage from 'next/image';
import { useMemo } from 'react';
import { gzip } from '../utils/gzip';
import type { Language } from './Highlight';
import { Highlight } from './Highlight';
import { LinkedHeading } from './LinkedHeading';
import { PawPaintIcon } from './icons/PawPaintIcon';

const { Alert, Heading, Box, Button, Icon, chakra, Kbd } = Chakra;

const Strong: React.FC<any> = (props) => (
  <Box as="strong" fontWeight="bold" {...props} />
);

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

const Example: React.FC<any> = (props) => {
  const { input = {} } = props;
  const { className, children } = props.children.props.children.props as {
    className?: string;
    children: string;
  };

  const code = children?.trim() ?? '';
  const language = className?.replace('language-', '') as Language;

  const href = useMemo(() => {
    const params = new URLSearchParams();
    const source = `
# Example

\`\`\`
${code}
\`\`\`
    `.trim();
    const inputs = Object.entries(input).map(([key, value]) => ({
      key,
      value,
    }));
    params.set('code', gzip(source));
    params.set('input', gzip(JSON.stringify(inputs)));
    return `/playground?${params}`;
  }, [code, JSON.stringify(input)]);

  return (
    <Box position="relative">
      <Strong>Example:</Strong>
      <br />
      <Highlight code={code} language={language} />
      <Button
        as="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        variant="outline"
        size="xs"
        colorScheme="whiteAlpha"
        position="absolute"
        right={1}
        bottom={1}
        rightIcon={<Icon as={PawPaintIcon} />}
      >
        Try
      </Button>
    </Box>
  );
};

export const mdxComponents: Record<
  string,
  React.FC<any> | React.ComponentClass<any>
> = {
  ...(Chakra as any),
  Image: (props) => (
    <Box my="3">
      <NextImage
        width={700}
        height={400}
        {...props}
        sizes="100vw"
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'contain',
        }}
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
  strong: Strong,
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
  Example,
};
