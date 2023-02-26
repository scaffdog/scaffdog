import type { ButtonProps, HTMLChakraProps } from '@chakra-ui/react';
import {
  Box,
  Button,
  chakra,
  Container,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Text,
  useClipboard,
} from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import { Highlight } from '../components/Highlight';
import { CheckIcon } from '../components/icons/CheckIcon';
import { ChevronsDownIcon } from '../components/icons/ChevronsDownIcon';
import { CopyIcon } from '../components/icons/CopyIcon';
import { ScaffdogIcon } from '../components/icons/ScaffdogIcon';
import { Terminal } from '../components/Terminal';
import { Layout } from '../layouts/Layout';
import feature1src from '../public/top/feature1.png';
import feature2src from '../public/top/feature2.png';
import feature3src from '../public/top/feature3.png';
import feature4src from '../public/top/feature4.png';
import heroSrc from '../public/top/hero.png';
import playgroundSrc from '../public/top/playground.png';
import type { NextPageWithLayout } from './_app';

const _LinkButton: React.FC<ButtonProps & { href: string }> = ({
  href,
  ...rest
}) => (
  <Button
    as={NextLink}
    href={href}
    bg="black"
    color="white"
    _hover={{ bg: 'gray.600' }}
    _active={{ bg: 'gray.400' }}
    {...rest}
  />
);

const _Code: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <chakra.code
    py="0.2em"
    px="0.2em"
    bg="gray.100"
    borderRadius="sm"
    fontSize="0.875em"
  >
    {children}
  </chakra.code>
);

const Hero: React.FC = () => {
  const { hasCopied, onCopy } = useClipboard('npm install scaffdog');

  return (
    <>
      <Container
        pos="relative"
        zIndex={1}
        maxW="container.xl"
        pt={{
          base: '24',
          md: '20',
          lg: '32',
        }}
        minH={{
          base: 200,
          sm: '300',
          md: 400,
          lg: 637,
        }}
      >
        <Flex justify="space-between">
          <Box flex="0 1 auto">
            <Heading as="h1" fontSize={{ base: '5xl', lg: '7xl' }}>
              scaffdog
            </Heading>

            <Text
              mt="1"
              fontSize={{
                base: 'md',
                lg: '2xl',
              }}
              fontWeight="bold"
            >
              Markdown driven scaffolding tool.
              <br />
              scaffdog speeds up the first steps of your creative activity.
            </Text>

            <Flex mt="2.5" align="center">
              <_LinkButton href="/docs">Get Started</_LinkButton>

              <Box display={{ base: 'none', md: 'block' }}>
                <Button
                  ml="2.5"
                  rightIcon={
                    <Icon
                      as={hasCopied ? CheckIcon : CopyIcon}
                      w="3"
                      h="3"
                      color={hasCopied ? 'green.500' : undefined}
                    />
                  }
                  colorScheme="gray"
                  color="gray.600"
                  fontSize="sm"
                  fontFamily="mono"
                  onClick={onCopy}
                >
                  $ npm install scaffdog
                </Button>
              </Box>
            </Flex>
          </Box>

          <Box
            display={{
              base: 'none',
              lg: 'block',
            }}
            flexGrow={0}
            flexShrink={0}
            flexBasis={{
              base: '34rem',
              lg: '35%',
              xl: '38%',
            }}
          >
            <Icon as={ScaffdogIcon} w="3xs" h="3xs" />
          </Box>
        </Flex>
      </Container>

      <Box
        aria-hidden
        pos="absolute"
        top={0}
        right={0}
        left="50%"
        zIndex={0}
        w="100vw"
        maxW="1650px"
        h={{
          base: 200,
          sm: '300',
          md: 400,
          lg: 637,
        }}
        overflow="hidden"
        transform="translateX(-50%)"
      >
        <Box
          pos="absolute"
          top={0}
          right={0}
          bottom={0}
          left={0}
          w="100vw"
          maxW="1650px"
        >
          <Image
            priority
            fill
            src={heroSrc}
            alt=""
            quality={100}
            style={{
              objectFit: 'cover',
              userSelect: 'none',
            }}
          />
        </Box>
      </Box>
    </>
  );
};

const CodeCyan: React.FC<{ children: React.ReactNode }> = (props) => (
  <Text as="span" color="cyan.300" {...props} />
);

const CodeGreen: React.FC<{ children: React.ReactNode }> = (props) => (
  <Text as="span" color="green.300" {...props} />
);

const Learn: React.FC = () => {
  return (
    <>
      <Box mx="auto" maxW="770px">
        <Highlight
          language="markdown"
          code={`
---
name: 'component'
root: '.'
output: '.'
questions:
  name: 'Please enter a component name.'
---

# \`{{ inputs.name | pascal }}/index.ts\`

\`\`\`typescript
export * from './{{ inputs.name }}';
\`\`\`

# \`{{ inputs.name | pascal }}/{{ inputs.name | pascal }}.tsx\`

\`\`\`typescript
export type Props = React.PropsWithChildren<{}>;

export const {{ inputs.name | pascal }}: React.FC<Props> = ({ children }) => {
  return (
    <div>{children}</div>
  );
};
\`\`\`
        `.trim()}
        />

        <Flex justify="center" my="4">
          <Icon as={ChevronsDownIcon} w="5" h="5" />
        </Flex>

        <Terminal>
          $ scaffdog generate
          <br />
          <br />
          <CodeGreen>?</CodeGreen> Please select a document.{' '}
          <CodeCyan>component</CodeCyan>
          <br />
          <CodeGreen>i</CodeGreen> Output destination directory:{' '}
          <CodeCyan>&quot;.&quot;</CodeCyan>
          <br />
          <CodeGreen>?</CodeGreen> Please enter a component name.{' '}
          <CodeCyan>PrettyDog</CodeCyan>
          <br />
          <br />
          🐶 Generated <CodeGreen>2 files!</CodeGreen>
          <br />
          <br />
          {'    '}
          <CodeGreen>✓</CodeGreen> PrettyDog/index.ts
          <br />
          {'    '}
          <CodeGreen>✓</CodeGreen> PrettyDog/PrettyDog.tsx
        </Terminal>

        <Flex justify="center" my="4">
          <Icon as={ChevronsDownIcon} w="5" h="5" />
        </Flex>

        <Highlight
          language="tsx"
          code={`
// PrettyDog/index.ts
export * from './PrettyDog';

// PrettyDog/PrettyDog.tsx
export type Props = React.PropsWithChildren<{}>;

export const PrettyDog: React.FC<Props> = ({ children }) => {
  return (
    <div>{children}</div>
  );
};
        `.trim()}
        />
      </Box>

      <Box mt="4" textAlign="center">
        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold">
          Just one markdown file will generate multiple files.
        </Text>

        <_LinkButton mt="4" href="/docs/templates">
          Learn Template
        </_LinkButton>
      </Box>
    </>
  );
};

const Section: React.FC<HTMLChakraProps<'section'> & { title: string }> = ({
  title,
  children,
  ...rest
}) => {
  return (
    <Box as="section" {...rest}>
      <Heading as="h2" mb="6" fontSize={{ base: '4xl', md: '5xl' }}>
        {title}
      </Heading>

      {children}
    </Box>
  );
};

const FeatureEntry: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => {
  return (
    <div>
      <Box aria-hidden pos="relative" h="6">
        {icon}
      </Box>

      <Heading as="h3" mb="2" fontSize="2xl">
        {title}
      </Heading>

      {children}
    </div>
  );
};

const Features: React.FC = () => {
  return (
    <Section title="Features">
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing="5">
        <FeatureEntry
          icon={
            <Box ml="-2px">
              <Image
                aria-hidden
                src={feature1src}
                width={37}
                height={32}
                quality={100}
                alt=""
              />
            </Box>
          }
          title="Markdown driven"
        >
          <p>
            You can define a template with <_Code>{'<h1>'}</_Code> and code
            block. It will be a Documetable template ! Define meta information
            with extended syntax using Front Matter.
          </p>
        </FeatureEntry>

        <FeatureEntry
          icon={
            <Box ml="-8px">
              <Image
                aria-hidden
                src={feature2src}
                width={38}
                height={34}
                quality={100}
                alt=""
              />
            </Box>
          }
          title="Ready to use"
        >
          <p>
            You can quickly start using <_Code>{'$ scaffdog init'}</_Code>
            <br />
            Other useful commands are provided for immediate scaffolding.
          </p>
        </FeatureEntry>

        <FeatureEntry
          icon={
            <Box ml="-4px">
              <Image
                aria-hidden
                src={feature3src}
                width={34}
                height={36}
                quality={100}
                alt=""
              />
            </Box>
          }
          title="Intuitive template"
        >
          <p>
            It provides a simple yet powerful template engine inspired by
            ECMAScript and go text/template. Many built-in helper functions
            required to define templates are also provided.
            <br />
          </p>
        </FeatureEntry>

        <FeatureEntry
          icon={
            <Box ml="-3px">
              <Image
                aria-hidden
                src={feature4src}
                width={35}
                height={34}
                quality={100}
                alt=""
              />
            </Box>
          }
          title="Editor Integration"
        >
          <p>
            It provides useful integrations for using scaffdog, such as Prettier
            plugins and VS Code extensions for GUI operations.
          </p>
        </FeatureEntry>
      </SimpleGrid>
    </Section>
  );
};

const Play: React.FC = () => {
  return (
    <Section title="Playground">
      <Flex direction={{ base: 'column', md: 'row' }}>
        <Box order={{ base: '2', md: '1' }} flex="1 1 auto">
          <Text fontSize="lg" lineHeight="tall">
            An online playground is useful for experimenting with templates and
            checking syntax.
            <br />
            Enjoy the world of scaffdog!
          </Text>

          <_LinkButton mt="3" href="/playground">
            Go Playground
          </_LinkButton>
        </Box>

        <Box
          order={{ base: '1', md: '2' }}
          flex="0 1 auto"
          ml={{ base: '0', md: '5' }}
          mb={{ base: '5', md: '0' }}
          boxShadow="md"
          borderRadius={{ base: '8px', md: '26px' }}
          lineHeight="0"
        >
          <Image
            aria-hidden
            src={playgroundSrc}
            width={928}
            height={572}
            quality={100}
            alt=""
          />
        </Box>
      </Flex>
    </Section>
  );
};

const Home: NextPageWithLayout = () => {
  return (
    <>
      <Hero />

      <Container
        as="main"
        maxW="container.xl"
        mt={{
          base: '8',
          md: '14',
        }}
      >
        <Learn />

        <Box mt="16" />

        <Features />

        <Box mt="16" />

        <Play />
      </Container>

      <Box mt="16" />
    </>
  );
};

Home.getLayout = (page) => <Layout>{page}</Layout>;

export default Home;
