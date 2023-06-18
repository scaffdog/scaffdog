'use client';

import {
  Box,
  Container,
  Flex,
  Heading,
  Icon,
  Text,
  useTheme,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { useMemo } from 'react';
import type { Frontmatter } from '../types/content';
import { EditIcon } from './icons/EditIcon';
import { Link } from './Link';
import { TableOfContent } from './TableOfContent';

export type Props = React.PropsWithChildren<{
  frontmatter: Frontmatter;
  sidebar?: React.ReactNode;
  pagination?: React.ReactNode;
}>;

export const PageContainer: React.FC<Props> = ({
  frontmatter,
  sidebar,
  pagination,
  children,
}) => {
  const { sizes } = useTheme();

  const lastEdited = useMemo(
    () => new Date(frontmatter.lastEdited),
    [frontmatter.lastEdited],
  );

  return (
    <>
      <Container as="main" maxW="container.xl" mt="14">
        <Flex>
          <Box
            position="sticky"
            top="6rem"
            mb="10"
            flex="1 0 auto"
            h="calc(100vh - 6rem - 1rem)"
            alignSelf="start"
          >
            {sidebar}
          </Box>

          <Box
            flex="1 1 auto"
            w={{
              base: 'full',
              xl: `calc(${sizes.container.xl} - 2.5rem * 2 - ${sizes['2xs']} - ${sizes['3xs']})`,
            }}
            maxW={{
              base: `calc(100vw - 1.5rem * 2)`,
              md: `calc(100vw - 1.5rem * 2 - ${sizes['2xs']})`,
              xl: `calc(100vw - 2.5rem * 2 - ${sizes['2xs']} - ${sizes['3xs']})`,
            }}
            pl={{
              base: '0',
              md: '5',
            }}
            pr={{
              xl: '5',
            }}
          >
            <Heading as="h1" mb="3.5" fontSize="5xl">
              {frontmatter.title}
            </Heading>

            {children}

            <Flex
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'flex-end', md: 'center' }}
              justify="space-between"
              mt="12"
              mb="5"
            >
              <Link
                flex="0 1 auto"
                href={frontmatter.editUrl}
                fontSize="xs"
                textAlign={{ base: 'right', md: 'left' }}
                textDecoration="none"
                _hover={{
                  textDecoration: 'underline',
                }}
              >
                <Flex as="span" flex="1 0 auto" align="center">
                  <Icon as={EditIcon} aria-hidden mr="1" w="2" h="2" />
                  <span>Edit this page on GitHub</span>
                </Flex>
              </Link>

              <Text mt={{ base: '1', md: '0' }} align="right" fontSize="xs">
                Last edited on{' '}
                <time dateTime={lastEdited.toISOString()}>
                  {format(lastEdited, 'MMMM dd, yyyy')}
                </time>
              </Text>
            </Flex>

            {pagination}
          </Box>

          <Box
            position="sticky"
            top="6rem"
            flex="1 0 auto"
            mb="10"
            h="calc(100vh - 6rem - 1rem)"
            alignSelf="start"
          >
            <TableOfContent frontmatter={frontmatter} />
          </Box>
        </Flex>
      </Container>
    </>
  );
};
