'use client';
import { Box, VStack, Link as ChakraLink, Heading } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the token from localStorage
    router.push('/'); // Redirect to login page
  };

  return (
    <Box
      width="250px"
      bg="white"
      color="black"
      height="100vh"
      p={4}
      position="fixed"
    >
      <Heading size="md" mb={6}>Admin Panel</Heading>
      <VStack align="stretch" spacing={4}>
        <ChakraLink as={NextLink} href="/admin/account" _hover={{ color: 'gray.500' }}>
          Account
        </ChakraLink>
        <ChakraLink as={NextLink} href="/admin/metrics" _hover={{ color: 'gray.500' }}>
          Metrics
        </ChakraLink>
        <ChakraLink as={NextLink} href="/admin/products" _hover={{ color: 'gray.500' }}>
          Products
        </ChakraLink>
        <ChakraLink as={NextLink} href="/admin/brands" _hover={{ color: 'gray.500' }}>
          Brands
        </ChakraLink>
        <ChakraLink as={NextLink} href="/admin/users" _hover={{ color: 'gray.500' }}>
          Users
        </ChakraLink>
        <ChakraLink onClick={handleLogout} _hover={{ color: 'gray.500' }}>
          Logout
        </ChakraLink>
      </VStack>
    </Box>
  );
}
