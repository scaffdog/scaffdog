import { Box, chakra, Heading, Text } from '@chakra-ui/react';
import { Highlight, themes } from 'prism-react-renderer';
import { usePlaygroundCompileState } from '../../states/playground';
import { detectPrismLanguage } from '../../utils/highlight';

const theme = {
  ...themes.nightOwlLight,
  plain: {
    ...themes.nightOwlLight.plain,
    backgroundColor: '#f7fafc',
  },
};

export const _Highlight: React.FC<{ code: string; language: string }> = ({
  code,
  language,
}) => {
  return (
    <Box overflow="hidden" fontSize="sm">
      <Highlight language={language} code={code} theme={theme}>
        {({ className, style, tokens, getTokenProps }) => (
          <chakra.pre
            className={className}
            style={style}
            overflowX="auto"
            p="0"
            m="0 !important"
            lineHeight="tall"
            textShadow="none !important"
            sx={{ WebkitOverflowScrolling: 'touch' }}
          >
            {tokens.map((line, i) => (
              <chakra.div key={i} display="table-row" px="2">
                <chakra.span display="table-cell">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </chakra.span>
              </chakra.div>
            ))}
          </chakra.pre>
        )}
      </Highlight>
    </Box>
  );
};

export type Props = {};

export const PlaygroundPreview: React.FC<Props> = () => {
  const files = usePlaygroundCompileState();

  if (files == null) {
    return null;
  }

  return (
    <Box h="100%" overflowY="auto" fontSize="sm">
      {files.state === 'failure' && (
        <Box>
          <Heading as="div" p="2" fontSize="lg" color="pink.500">
            ScaffdogError:
          </Heading>
          <_Highlight language="clike" code={files.message} />
        </Box>
      )}

      {files.state === 'success' &&
        files.value.map((file) => (
          <Box key={file.path} mb="2">
            <Heading as="div" p="2" fontSize="lg" color="gray.700">
              {file.path}
              {file.skip && (
                <Text as="span" ml="1" color="gray.400" fontSize="0.85em">
                  (skip)
                </Text>
              )}
            </Heading>
            <_Highlight
              language={detectPrismLanguage(file.path)}
              code={file.content}
            />
          </Box>
        ))}
    </Box>
  );
};
