import { Box, ListItem, UnorderedList } from '@chakra-ui/react';
import { usePathname } from '../hooks/usePathname';
import { sidebar } from '../routing/sidebar';
import { Link } from './Link';

const NavLink: React.FC<{ active: boolean; href: string; title: string }> = ({
  active,
  href,
  title,
}) => (
  <Link
    href={href}
    display="block"
    py="0.5"
    px="1.5"
    borderRadius="full"
    fontWeight={active ? 'bold' : 'normal'}
    bg={active ? 'gray.100' : undefined}
    _hover={{ bg: 'gray.100', border: 'none' }}
  >
    {title}
  </Link>
);

export type Props = {};

export const Sidebar: React.FC<Props> = () => {
  const pathname = usePathname();

  return (
    <Box
      as="nav"
      display={{ base: 'none', md: 'block' }}
      py="2"
      pr="2"
      minW="2xs"
      h="100%"
      overflowY="auto"
      overscrollBehavior="contain"
      sx={{ WebkitOverflowScrolling: 'touch' }}
    >
      <UnorderedList ml="0" listStyleType="none">
        {sidebar.map((lv1, i) => {
          return (
            <ListItem key={lv1.path} mt={i === 0 ? '0' : '1'}>
              <NavLink
                active={pathname === lv1.path}
                href={lv1.path}
                title={lv1.title}
              />

              {lv1.children && (
                <UnorderedList
                  mt="1"
                  ml="1.5"
                  pl="1"
                  borderLeftWidth={1}
                  borderLeftColor="gray.200"
                  listStyleType="none"
                >
                  {lv1.children.map((lv2) => (
                    <ListItem key={lv2.path} mt="1">
                      <NavLink
                        active={pathname === lv2.path}
                        href={lv2.path}
                        title={lv2.title}
                      />
                    </ListItem>
                  ))}
                </UnorderedList>
              )}
            </ListItem>
          );
        })}
      </UnorderedList>
    </Box>
  );
};
