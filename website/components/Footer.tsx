import { Box, Container, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { ScaffdogIcon } from './icons/ScaffdogIcon';
import { Link } from './Link';

const PrettyDog: React.FC = () => {
  const size = {
    base: '4',
    md: '6',
  };

  return (
    <HStack aria-hidden spacing="2" justify="center">
      <Icon as={ScaffdogIcon} w={size} h={size} color="brand.cyan" />
      <Icon as={ScaffdogIcon} w={size} h={size} color="brand.pink" />
      <Icon as={ScaffdogIcon} w={size} h={size} color="brand.yellow" />
    </HStack>
  );
};

export type Props = {};

export const Footer: React.FC<Props> = () => {
  return (
    <Box
      py={{
        base: '8',
        md: '14',
      }}
      borderTopWidth={1}
      borderTopColor="gray.200"
    >
      <Container maxW="container.xl">
        <Flex
          flexDirection={{
            base: 'column',
            md: 'row',
          }}
          justify="space-between"
        >
          <Box
            flex="1 0 33.33%"
            order={{ base: '2', md: '1' }}
            mt={{ base: '3', md: '0' }}
            textAlign={{ base: 'center', md: 'left' }}
          >
            <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold">
              Copyright © 2022{' '}
              <Link href="https://github.com/wadackel">wadackel</Link>
            </Text>

            <Text fontSize="xs">Released under the MIT License</Text>
          </Box>

          <Box flex="1 0 33.33%" order={{ base: 1, md: '2' }}>
            <PrettyDog />
          </Box>

          <Box
            flex="1 0 33.33%"
            order={3}
            display={{ base: 'none', md: 'block' }}
            textAlign="right"
          >
            <Text fontSize="md" fontWeight="bold">
              Built with Next.js
            </Text>

            <Text fontSize="xs">
              <Link href="https://github.com/scaffdog/scaffdog">
                Source Code
              </Link>
            </Text>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};
