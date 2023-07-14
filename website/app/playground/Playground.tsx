'use client';

import { Box, Flex } from '@chakra-ui/react';
import { RecoilRoot } from 'recoil';
import { useLayoutEffect } from 'react';
import { PlaygroundFooter } from './PlaygroundFooter';
import { PlaygroundHeader } from './PlaygroundHeader';
import { PlaygroundPreview } from './PlaygroundPreview';
import { PlaygroundTab } from './PlaygroundTab';

export const Playground: React.FC = () => {
  useLayoutEffect(() => {
    // eslint-disable-next-line no-console
    import('shadowrealm-api/dist/polyfill.js').catch(console.warn);
  }, []);

  return (
    <RecoilRoot>
      <Flex direction="column" h={{ base: 'auto', md: '100vh' }}>
        <Box flex="0 0 auto">
          <PlaygroundHeader />
        </Box>

        <Box
          flex="1 1 auto"
          minH={{ base: 'calc(100vh - 56px - 36px)', md: 'auto' }}
        >
          <Flex h="100%" direction={{ base: 'column', md: 'row' }}>
            <Box flex="1 1 50%" w={{ base: '100vw', md: '50vw' }}>
              <PlaygroundTab />
            </Box>

            <Box
              flex="1 1 50%"
              w={{ base: '100vw', md: '50vw' }}
              h={{ base: 'auto', md: 'calc(100vh - 56px - 36px)' }}
              borderLeftWidth={{ base: 0, md: 1 }}
              borderTopWidth={{ base: 1, md: 0 }}
              borderColor="gray.200"
            >
              <PlaygroundPreview />
            </Box>
          </Flex>
        </Box>

        <Box flex="0 0 auto">
          <PlaygroundFooter />
        </Box>
      </Flex>
    </RecoilRoot>
  );
};
