'use client';
import { Box, Flex, Heading, Text, Button } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Sidebar from '../../../components/AdminSidebar';
import NavBar from '../../../components/NavBar';
import useAuth from '../../../hooks/useAuth';
import NextLink from 'next/link';

interface UserProfile {
  name: string;
  email: string;
}

export default function AdminAccount() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const userRole = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: UserProfile = await response.json();
      setUser(data);
    };

    if (userRole === 'admin') {
      fetchProfile();
    }
  }, [userRole]);

  if (userRole !== 'admin') return null;

  return (
    <div>
      <NavBar />
      <Flex>
        <Sidebar />
        <Box ml="250px" p={8} width="100%">
          <Heading mb={6}>Admin Account Details</Heading>
          <Text mb={4}><strong>Username:</strong> {user?.name}</Text>
          <Text mb={4}><strong>Email:</strong> {user?.email}</Text>

          <Flex mt={4} gap={4}>
            <Button as={NextLink} href="/admin/account/edit" bg="black" color="white" _hover={{ bg: "gray.700" }}>
              Edit Details
            </Button>
            <Button as={NextLink} href="/admin/account/change-password" bg="black" color="white" _hover={{ bg: "gray.700" }}>
              Change Password
            </Button>
          </Flex>
        </Box>
      </Flex>
    </div>
  );
}
