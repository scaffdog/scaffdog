import {
  Box,
  Button,
  Container,
  Flex,
  Icon,
  Link,
  Stack,
  Text,
  VisuallyHidden,
  useClipboard,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { CopyIcon } from '../../components/icons/CopyIcon';
import { PawPaintIcon } from '../../components/icons/PawPaintIcon';
import { ScaffdogIcon } from '../../components/icons/ScaffdogIcon';
import {
  usePlaygroundCompile,
  usePlaygroundInputState,
  usePlaygroundSourceState,
} from '../../states/playground';
import { gzip } from '../../utils/gzip';

export type Props = {};

export const PlaygroundHeader: React.FC<Props> = () => {
  const router = useRouter();
  const compile = usePlaygroundCompile();
  const [source] = usePlaygroundSourceState();
  const [input] = usePlaygroundInputState();
  const { setValue: setClipboard, hasCopied, onCopy } = useClipboard('');

  const copyUrl = useCallback(() => {
    const url = new URL(window.location.href);

    const params = new URLSearchParams();
    params.set('code', gzip(source));
    params.set('input', gzip(JSON.stringify(input)));

    const pathname = `${url.pathname}?${params}`;

    router.replace(pathname);
    setClipboard(`${url.origin}${pathname}`);

    window.requestAnimationFrame(() => {
      onCopy();
    });
  }, [router, source, input, setClipboard, onCopy]);

  useHotkeys(
    'meta+s',
    (e) => {
      e.preventDefault();
      copyUrl();
    },
    {
      enableOnFormTags: ['input', 'textarea'],
    },
  );

  useHotkeys(
    'meta+enter, ctrl+enter',
    () => {
      compile();
    },
    {
      enableOnFormTags: ['input', 'textarea'],
    },
  );

  const handleCopyClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      copyUrl();
    },
    [copyUrl],
  );

  const handleGenerateClick = useCallback(
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
            <Text
              aria-hidden
              as="span"
              display={{ base: 'none', md: 'block' }}
              ml="1"
              fontSize="sm"
              fontWeight="bold"
            >
              Back to documentation
            </Text>
            <VisuallyHidden>Back to documentation</VisuallyHidden>
          </Link>
        </Box>

        <Stack direction="row" justify="center" spacing={1}>
          <Button
            rightIcon={<Icon as={CopyIcon} />}
            size={{ base: 'sm', md: 'md' }}
            h="5"
            variant="ghost"
            borderRadius="full"
            color="black"
            _hover={{ bg: 'gray.200' }}
            _active={{ bg: 'gray.100' }}
            onClick={handleCopyClick}
          >
            {hasCopied ? 'Copied!' : 'Copy URL'}
          </Button>

          <Button
            rightIcon={<Icon as={PawPaintIcon} />}
            size={{ base: 'sm', md: 'md' }}
            h="5"
            borderRadius="full"
            color="white"
            bg="black"
            _hover={{ bg: 'gray.600' }}
            _active={{ bg: 'gray.400' }}
            onClick={handleGenerateClick}
          >
            Generate
          </Button>
        </Stack>
      </Flex>
    </Container>
  );
};
