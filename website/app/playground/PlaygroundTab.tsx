import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useMounted } from '../../hooks/useMounted';
import {
  playgroundInputEntryListSchema,
  usePlaygroundInputState,
  usePlaygroundSourceState,
} from '../../states/playground';
import { ungzip } from '../../utils/gzip';
import { PlaygroundEditor } from './PlaygroundEditor';
import { PlaygroundInputEditor } from './PlaygroundInputEditor';

export type Props = {};

export const PlaygroundTab: React.FC<Props> = () => {
  const mounted = useMounted();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, setSource] = usePlaygroundSourceState();
  const [, setInput] = usePlaygroundInputState();

  useEffect(() => {
    const rawSource = searchParams.get('code');
    const rawInput = searchParams.get('input');
    if (
      rawSource != null &&
      rawSource !== '' &&
      rawInput != null &&
      rawInput !== ''
    ) {
      try {
        const source = ungzip(rawSource);
        const maybeInput = ungzip(rawInput);
        const input = playgroundInputEntryListSchema.validateSync(
          JSON.parse(maybeInput),
        );
        setSource(source);
        setInput(input);
      } catch (e) {
        router.replace('?');
      }
    }
  }, []);

  return (
    <Tabs isFitted size="sm" h="100%" colorScheme="purple">
      <TabList h="40px">
        <Tab>Template</Tab>
        <Tab>Input</Tab>
      </TabList>

      <TabPanels
        h={{
          base: 'auto',
          md: 'calc(100vh - 56px - 40px - 36px)',
        }}
        overflow="auto"
      >
        <TabPanel p="0" h="100%">
          {mounted && <PlaygroundEditor />}
        </TabPanel>

        <TabPanel h="100%">{mounted && <PlaygroundInputEditor />}</TabPanel>
      </TabPanels>
    </Tabs>
  );
};
