import {
  Box,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  ListItem,
  Text,
  UnorderedList,
  useDisclosure,
} from '@chakra-ui/react';
import { useScroll } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from '../hooks/usePathname';
import { sidebar } from '../routing/sidebar';
import { GitHubIcon } from './icons/GitHubIcon';
import { MenuIcon } from './icons/MenuIcon';
import { ScaffdogIcon } from './icons/ScaffdogIcon';
import { Link } from './Link';

const _NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => {
  return (
    <Link href={href} fontSize="sm" fontWeight="bold">
      {children}
    </Link>
  );
};

const _MenuLink: React.FC<{ active: boolean; href: string; title: string }> = ({
  active,
  href,
  title,
}) => {
  return (
    <Link
      display="block"
      py="0.5"
      px="1.5"
      borderRadius="full"
      fontWeight={active ? 'bold' : 'normal'}
      bg={active ? 'gray.100' : undefined}
      _hover={{ bg: 'gray.100', border: 'none' }}
      href={href}
    >
      {title}
    </Link>
  );
};

export type Props = {
  home?: boolean;
};

export const Header: React.FC<Props> = ({ home }) => {
  const router = useRouter();
  const pathname = usePathname();

  const ref = useRef<HTMLDivElement>(null);
  const [y, setY] = useState(0);
  const { scrollY } = useScroll({
    target: ref,
  });

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const handler = () => {
      onClose();
    };

    router.events.on('routeChangeComplete', handler);
    router.events.on('routeChangeError', handler);

    return () => {
      router.events.off('routeChangeComplete', handler);
      router.events.off('routeChangeError', handler);
    };
  }, [router, onClose]);

  useEffect(() => {
    return scrollY.onChange(() => {
      setY(scrollY.get());
    });
  }, [scrollY]);

  const progress = Math.min(1, y / 64);

  return (
    <Box
      ref={ref}
      as="header"
      pos="fixed"
      top="0"
      right="0"
      left="0"
      zIndex="sticky"
      boxShadow={`0 1px 2px 0 rgba(0, 0, 0, ${0.1 * progress})`}
      bg={`rgba(255, 255, 255, ${0.8 * progress})`}
      backdropFilter="auto"
      backdropBlur={`${8 * progress}px`}
    >
      <Container maxW="container.xl">
        <Flex h={{ base: '7', md: '9' }} justify="space-between" align="center">
          <Text as={home ? 'h1' : 'span'}>
            <Link
              href="/"
              display="flex"
              alignItems="center"
              transition="color 80ms"
              _hover={{
                color: 'gray.600',
              }}
            >
              <Icon
                aria-hidden
                as={ScaffdogIcon}
                display="block"
                transition="color 0.2s"
                w="4"
                h="4"
              />
              <Text
                as="span"
                display={{ base: 'none', md: 'block' }}
                ml="1"
                fontSize="lg"
                fontWeight="bold"
              >
                scaffdog
              </Text>
            </Link>
          </Text>

          <Box display={{ base: 'none', sm: 'block' }}>
            <HStack spacing="3">
              <_NavLink href="/docs">Get Started</_NavLink>
              <_NavLink href="/docs/templates">Docs</_NavLink>
              <_NavLink href="/playground">Playground</_NavLink>
              <Link href="https://github.com/scaffdog/scaffdog">
                <Icon
                  as={GitHubIcon}
                  display="block"
                  transition="color 80ms"
                  w="4"
                  h="4"
                  _hover={{ color: 'gray.600' }}
                />
              </Link>
            </HStack>
          </Box>

          <Box display={{ base: 'block', sm: 'none' }} flex="0 1 auto">
            <IconButton
              ref={menuButtonRef}
              aria-label="Open menu"
              icon={<Icon as={MenuIcon} />}
              p="0"
              w="6"
              minW="0"
              h="6"
              variant="ghost"
              borderRadius="full"
              colorScheme="blackAlpha"
              color="black"
              onClick={onOpen}
            />
          </Box>
        </Flex>
      </Container>

      <Drawer
        isOpen={isOpen}
        placement="right"
        finalFocusRef={menuButtonRef}
        onClose={onClose}
      >
        <DrawerOverlay />

        <DrawerContent>
          <DrawerCloseButton />

          <DrawerBody pt="8" pb="6" px="2">
            <UnorderedList ml="0" listStyleType="none">
              {sidebar.map((lv1, i) => {
                return (
                  <ListItem key={lv1.path} mt={i === 0 ? '0' : '1'}>
                    <_MenuLink
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
                            <_MenuLink
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
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};
