'use client';

import { Box, Icon, SimpleGrid, Text } from '@chakra-ui/react';
import type { RouteItem } from '../routing/types';
import type { Props as LinkProps } from './Link';
import { Link } from './Link';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

const _Link: React.FC<LinkProps> = ({ rel, href, children, ...rest }) => {
  const previous = rel === 'prev';
  const sub = previous ? 'Previous' : 'Next';
  const align = previous ? 'left' : 'right';
  const icon = (
    <Icon
      aria-hidden
      as={previous ? ArrowLeftIcon : ArrowRightIcon}
      pos="relative"
      w="2.5"
      h="2.5"
      top="0.5"
      ml={previous ? '0' : '0.5'}
      mr={previous ? '0.5' : '0'}
    />
  );

  return (
    <Link
      rel={rel}
      href={href}
      flex="1 0 50%"
      p="1"
      ml={previous ? '-1' : '0'}
      mr={previous ? '0' : '-1'}
      borderRadius="md"
      textAlign={align}
      fontWeight="bold"
      _hover={{
        bg: 'gray.100',
        textDecoration: 'none',
      }}
      {...rest}
    >
      <Text as="span" display="block" color="gray.400" fontSize="xs">
        {sub}
      </Text>

      <Box as="span" justifyContent={align} fontSize="xl">
        {previous && icon}
        {children}
        {!previous && icon}
      </Box>
    </Link>
  );
};

export type Props = {
  previous: RouteItem | null;
  next: RouteItem | null;
};

export const Pagination: React.FC<Props> = ({ previous, next }) => {
  return (
    <SimpleGrid
      as="nav"
      columns={2}
      spacing={{ base: '1', md: '2' }}
      py="4"
      borderTopWidth={1}
      borderTopColor="gray.200"
    >
      {previous != null ? (
        <_Link rel="prev" href={previous.path}>
          {previous.title}
        </_Link>
      ) : (
        <span />
      )}

      {next != null ? (
        <_Link rel="next" href={next.path}>
          {next.title}
        </_Link>
      ) : (
        <span />
      )}
    </SimpleGrid>
  );
};
