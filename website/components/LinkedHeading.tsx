import type { HTMLChakraProps } from '@chakra-ui/react';
import { chakra } from '@chakra-ui/react';
import type { Merge } from 'type-fest';

export type Props = Merge<
  HTMLChakraProps<'h2'>,
  {
    id: string;
  }
>;

export const LinkedHeading: React.FC<Props> = ({ id, children, ...rest }) => {
  return (
    <chakra.h2
      id={id}
      fontWeight="bold"
      css={{ scrollMarginBlock: '5rem' }}
      data-group=""
      {...rest}
    >
      <span>{children}</span>

      <chakra.a
        href={`#${id}`}
        ml="1"
        fontWeight="normal"
        color="gray.400"
        opacity={0}
        _groupHover={{ opacity: 1 }}
        aria-label="Anchor"
      >
        #
      </chakra.a>
    </chakra.h2>
  );
};
