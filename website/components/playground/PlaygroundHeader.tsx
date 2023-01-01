import {
  Box,
  Button,
  Container,
  Flex,
  Icon,
  Link,
  Text,
} from '@chakra-ui/react';
import { useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { usePlaygroundCompile } from '../../states/playground';
import { PawPaintIcon } from '../icons/PawPaintIcon';
import { ScaffdogIcon } from '../icons/ScaffdogIcon';

export type Props = {};

export const PlaygroundHeader: React.FC<Props> = () => {
  const compile = usePlaygroundCompile();

  useHotkeys(
    'meta+enter, ctrl+enter',
    () => {
      compile();
    },
    {
      enableOnFormTags: ['input', 'textarea'],
    },
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      compile();
    },
    [compile],
  );

  return (
    <Container maxW="full" borderBottomWidth={1} borderBottomColor="gray.200">
      <Flex h="56px" justify="space-between" align="center">
        <Box>
          <Link
            href="/"
            display="flex"
            alignItems="center"
            transition="color 80ms"
            _hover={{
              color: 'gray.600',
            }}
          >
            <Icon
              aria-hidden
              as={ScaffdogIcon}
              display="block"
              transition="color 0.2s"
              w="4"
              h="4"
            />
            <Text as="span" ml="1" fontSize="sm" fontWeight="bold">
              Back to documentation
            </Text>
          </Link>
        </Box>

        <Box>
          <Button
            rightIcon={<Icon as={PawPaintIcon} />}
            h="5"
            borderRadius="full"
            color="white"
            bg="black"
            _hover={{ bg: 'gray.600' }}
            _active={{ bg: 'gray.400' }}
            onClick={handleClick}
          >
            Generate
          </Button>
        </Box>
      </Flex>
    </Container>
  );
};
