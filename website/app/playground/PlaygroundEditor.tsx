import { Box } from '@chakra-ui/react';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism.css';
import { useCallback } from 'react';
import Editor from 'react-simple-code-editor';
import { usePlaygroundSourceState } from '../../states/playground';

export type Props = {};

export const PlaygroundEditor: React.FC<Props> = () => {
  const [source, setSource] = usePlaygroundSourceState();

  const handleChange = useCallback(
    (next: string) => {
      setSource(next);
    },
    [setSource],
  );

  return (
    <Box
      pt="2"
      pb="2"
      pl="2"
      h="100%"
      sx={{
        '& > *': {
          minH: '100%',
          overflow: 'auto',
          fontFamily: 'mono',
          fontSize: 'sm',
        },
        '& textarea:focus': {
          outline: 'none',
        },
      }}
    >
      <Editor
        value={source}
        highlight={(v) => {
          return highlight(v, languages.markdown, 'markdown');
        }}
        onValueChange={handleChange}
      />
    </Box>
  );
};
