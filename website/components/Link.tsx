import type { LinkProps as ChakraLinkProps } from '@chakra-ui/react';
import { Link as ChakraLink } from '@chakra-ui/react';
import NextLink from 'next/link';

export type Props = ChakraLinkProps;

export const Link: React.FC<Props> = ({ href, children, ...rest }) => {
  return (
    <ChakraLink as={NextLink} {...rest} href={href}>
      {children}
    </ChakraLink>
  );
};
