'use client';

import { Box, Flex } from '@chakra-ui/react';
import type { NextPage } from 'next';
import { RecoilRoot } from 'recoil';
import { PlaygroundFooter } from './PlaygroundFooter';
import { PlaygroundHeader } from './PlaygroundHeader';
import { PlaygroundPreview } from './PlaygroundPreview';
import { PlaygroundTab } from './PlaygroundTab';

export const Playground: NextPage = () => {
  return (
    <RecoilRoot>
      <Flex direction="column" h="100vh">
        <Box flex="0 0 auto">
          <PlaygroundHeader />
        </Box>

        <Box flex="1 1 auto">
          <Flex h="100%">
            <Box flex="1 1 50%" w="50vw">
              <PlaygroundTab />
            </Box>

            <Box
              flex="1 1 50%"
              w="50vw"
              h="calc(100vh - 56px - 36px)"
              borderLeftWidth={1}
              borderLeftColor="gray.200"
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
