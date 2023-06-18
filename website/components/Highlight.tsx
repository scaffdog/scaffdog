import { Box, chakra } from '@chakra-ui/react';
import { Highlight as PrrHighlight, themes } from 'prism-react-renderer';
import Prism from 'prismjs';

require('prismjs/components/prism-markup');
require('prismjs/components/prism-clike');
require('prismjs/components/prism-css');
require('prismjs/components/prism-css-extras');
require('prismjs/components/prism-graphql');
require('prismjs/components/prism-sql');
require('prismjs/components/prism-markdown');
require('prismjs/components/prism-javascript');
require('prismjs/components/prism-js-extras');
require('prismjs/components/prism-js-templates');
require('prismjs/components/prism-typescript');
require('prismjs/components/prism-jsx');
require('prismjs/components/prism-tsx');
require('prismjs/components/prism-yaml');
require('prismjs/components/prism-json');
require('prismjs/components/prism-bash');
require('prismjs/components/prism-diff');

const theme = {
  ...themes.palenight,
  plain: {
    ...themes.palenight.plain,
    backgroundColor: '#0f001c',
    color: '#c2c5d9',
  },
};

export type Language = string;

export type Props = {
  language: Language;
  code: string;
};

export const Highlight: React.FC<Props> = ({ code, language }) => {
  return (
    <Box my="3" rounded="8px" bg="black" overflow="hidden" fontSize="sm">
      <PrrHighlight
        prism={Prism as any}
        language={language || 'clike'}
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
                      {...getTokenProps({ token, key })}
                      key={key}
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
