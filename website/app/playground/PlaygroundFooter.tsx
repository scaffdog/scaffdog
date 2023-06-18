import { Container, Flex, Icon, Text } from '@chakra-ui/react';
import { GitHubIcon } from '../../components/icons/GitHubIcon';
import { Link } from '../../components/Link';

export type Props = {};

export const PlaygroundFooter: React.FC<Props> = () => {
  return (
    <Container maxW="full" borderTopWidth={1} borderTopColor="gray.200">
      <Flex h="36px" justify="space-between" align="center">
        <Flex align="center" fontSize="xs">
          <Link
            href="https://github.com/scaffdog/scaffdog"
            display="inline-flex"
            alignItems="center"
            fontWeight="bold"
          >
            <Icon aria-hidden as={GitHubIcon} w="2" h="2" />

            <Text as="span" ml="0.5">
              scaffdog/scaffdog
            </Text>
          </Link>

          <Text as="span" ml="0.5">
            - scaffdog is Markdown driven scaffolding tool.
          </Text>
        </Flex>

        <Text fontSize="xs" fontWeight="bold">
          Made with 🖤 by{' '}
          <Link href="https://github.com/wadackel">@wadackel</Link>
        </Text>
      </Flex>
    </Container>
  );
};
