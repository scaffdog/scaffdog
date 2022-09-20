import { Box, chakra } from '@chakra-ui/react';
import type { Language as PrrLanguage } from 'prism-react-renderer';
import PrrHighlight, { defaultProps } from 'prism-react-renderer';
import base from 'prism-react-renderer/themes/palenight';
// eslint-disable-next-line
// @ts-ignore
import Prism from 'prismjs/components/prism-core';

const theme = {
  ...base,
  plain: {
    ...base.plain,
    backgroundColor: '#0f001c',
    color: '#c2c5d9',
  },
};

export type Language = PrrLanguage;

export type Props = {
  language: Language;
  code: string;
};

export const Highlight: React.FC<Props> = ({ code, language }) => {
  return (
    <Box my="3" rounded="8px" bg="black" overflow="hidden" fontSize="sm">
      <PrrHighlight
        {...defaultProps}
        Prism={Prism}
        language={language}
        code={code}
        theme={theme}
      >
        {({ className, style, tokens, getTokenProps }) => (
          <chakra.pre
            className={className}
            style={style}
            overflowX="auto"
            p="3"
            lineHeight="tall"
            sx={{ WebkitOverflowScrolling: 'touch' }}
          >
            {tokens.map((line, i) => (
              <chakra.div key={i} display="table-row" px="2">
                <chakra.span display="table-cell">
                  {line.map((token, key) => (
                    <chakra.span
                      key={key}
                      {...getTokenProps({ token, key })}
                      fontStyle="normal !important"
                    />
                  ))}
                </chakra.span>
              </chakra.div>
            ))}
          </chakra.pre>
        )}
      </PrrHighlight>
    </Box>
  );
};
