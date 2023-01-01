import type { Merge } from 'type-fest';
import NextLink from 'next/link';
import type { LinkProps as ChakraLinkProps } from '@chakra-ui/react';
import { Link as ChakraLink } from '@chakra-ui/react';

export type Props = Merge<
  ChakraLinkProps,
  {
    href: string;
  }
>;

export const Link: React.FC<Props> = ({ href, children, ...rest }) => {
  return (
    <ChakraLink as={NextLink} {...rest} href={href}>
      {children}
    </ChakraLink>
  );
};
