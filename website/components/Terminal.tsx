import { Box, chakra, Flex } from '@chakra-ui/react';

export type Props = {
  children: React.ReactNode;
};

export const Terminal: React.FC<Props> = ({ children }) => {
  return (
    <Box
      borderRadius="lg"
      bg="#0f001c"
      color="#9fa3be"
      fontSize="sm"
      fontFamily="mono"
      lineHeight="tall"
    >
      <Flex p="2">
        <Box w="1.5" h="1.5" borderRadius="full" bg="brand.pink" />
        <Box ml="6px" w="1.5" h="1.5" borderRadius="full" bg="brand.yellow" />
        <Box ml="6px" w="1.5" h="1.5" borderRadius="full" bg="brand.cyan" />
      </Flex>

      <chakra.pre
        pt="1.5"
        px="3"
        pb="3"
        overflowX="auto"
        sx={{ WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </chakra.pre>
    </Box>
  );
};
