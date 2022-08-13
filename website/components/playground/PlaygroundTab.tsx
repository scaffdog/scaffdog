import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { PlaygroundEditor } from './PlaygroundEditor';
import { PlaygroundInputEditor } from './PlaygroundInputEditor';

export type Props = {};

export const PlaygroundTab: React.FC<Props> = () => {
  return (
    <Tabs size="sm" h="100%" colorScheme="purple">
      <TabList h="40px">
        <Tab>Template</Tab>
        <Tab>Input</Tab>
      </TabList>

      <TabPanels h="calc(100vh - 56px - 40px - 36px)" overflow="auto">
        <TabPanel p="0" h="100%">
          <PlaygroundEditor />
        </TabPanel>

        <TabPanel h="100%">
          <PlaygroundInputEditor />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};
