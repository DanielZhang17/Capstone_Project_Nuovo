'use client';
import { Box, VStack, Link as ChakraLink, Heading } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserSidebar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token'); // 移除本地存储的token
    router.push('/'); // 重定向到登录页面
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
      <Heading size="md" mb={6}>User Panel</Heading>
      <VStack align="stretch" spacing={4}>
        <ChakraLink as={NextLink} href="/profile/account-details-summary" _hover={{ color: 'gray.500' }}>
          Details and Security
        </ChakraLink>
        <ChakraLink as={NextLink} href="/profile/followed-brands" _hover={{ color: 'gray.500' }}>
          Followed Brand
        </ChakraLink>
        <ChakraLink as={NextLink} href="/profile/wishlist" _hover={{ color: 'gray.500' }}>
          Wishlist
        </ChakraLink>
        <ChakraLink as={NextLink} href="/profile/notification" _hover={{ color: 'gray.500' }}>
          Notification
        </ChakraLink>
        <ChakraLink onClick={handleLogout} _hover={{ color: 'gray.500' }}>
          Logout
        </ChakraLink>
      </VStack>
    </Box>
  );
}
