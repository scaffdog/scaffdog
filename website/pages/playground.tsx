import { Box, Flex } from '@chakra-ui/react';
import type { NextPage } from 'next';
import { RecoilRoot } from 'recoil';
import { PlaygroundFooter } from '../components/playground/PlaygroundFooter';
import { PlaygroundHeader } from '../components/playground/PlaygroundHeader';
import { PlaygroundPreview } from '../components/playground/PlaygroundPreview';
import { PlaygroundTab } from '../components/playground/PlaygroundTab';
import { Seo } from '../components/Seo';

const Playground: NextPage = () => {
  return (
    <RecoilRoot>
      <Seo title="Playground" description="scaffdog online playground." />

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

export default Playground;
