import {
  Box,
  Flex,
  Heading,
  Icon,
  ListItem,
  OrderedList,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import type { Frontmatter } from '../types/content';
import { PawPaintIcon } from './icons/PawPaintIcon';
import { Link } from './Link';

export type Props = {
  frontmatter: Frontmatter;
};

export const TableOfContent: React.FC<Props> = ({ frontmatter }) => {
  const [active, setActive] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const elements = frontmatter.headings.map(
        ({ id }) => document.getElementById(id)!,
      );

      let current = '';
      for (const el of elements) {
        if (el.getBoundingClientRect().top < 120) {
          current = el.getAttribute('id')!;
        }
      }
      setActive(current);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [frontmatter.headings]);

  return (
    <Box
      as="aside"
      display={{ base: 'none', xl: 'block' }}
      minW="3xs"
      py="2"
      pr="2"
      pl="3px"
      h="100%"
      overflowY="auto"
      overscrollBehavior="contain"
      sx={{ WebkitOverflowScrolling: 'touch' }}
    >
      <section>
        <Flex align="center">
          <Heading as="h2" fontSize="sm" textTransform="uppercase">
            On this page
          </Heading>

          <Icon as={PawPaintIcon} ml="1" w="2" h="2" />
        </Flex>

        <OrderedList mt="2" ml="0" listStyleType="none">
          {frontmatter.headings.map(({ id, level, text }) => (
            <ListItem key={id}>
              <Link
                href={`#${id}`}
                display="block"
                aria-current={id === active}
                py="1"
                pl={level === 3 ? '3' : 0}
                fontSize="sm"
                fontWeight={id === active ? 'bold' : 'normal'}
                color="gray.500"
              >
                {text}
              </Link>
            </ListItem>
          ))}
        </OrderedList>

        <Box
          as="aside"
          mt="3"
          pt="3"
          borderTopWidth={1}
          borderTopColor="gray.200"
        >
          <Link href={frontmatter.editUrl} fontSize="xs">
            Edit this page on GitHub
          </Link>
        </Box>
      </section>
    </Box>
  );
};
