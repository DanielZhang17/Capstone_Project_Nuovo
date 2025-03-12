'use client';
import { Box, Flex, Heading, FormControl, FormLabel, Input, Button } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/react';
import Sidebar from '../../../../components/AdminSidebar';
import NavBar from '../../../../components/NavBar';
import useAuth from '../../../../hooks/useAuth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const toast = useToast();
  const userRole = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirm password do not match.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const token = localStorage.getItem('token');

    const response = await fetch('/api/user/auth/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (response.ok) {
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push('/admin/account');
    } else {
      toast({
        title: "Change failed",
        description: "Error changing password. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (userRole !== 'admin') return null;

  return (
    <div>
      <NavBar />
      <Flex>
        <Sidebar />
        <Box ml="250px" p={8} width="100%">
          <Heading>Change Password</Heading>
          <Box mt={6}>
            <form onSubmit={handleSubmit}>
              <FormControl isRequired mb={4}>
                <FormLabel>Old Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Enter old password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>New Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </FormControl>

              <Flex gap={4}>
                <Button
                  bg="black"
                  color="white"
                  _hover={{ bg: 'gray.700' }}
                  type="submit"
                >
                  Change Password
                </Button>
                <Button
                  bg="black"
                  color="white"
                  _hover={{ bg: 'gray.700' }}
                  onClick={() => router.push('/admin/account')}
                >
                  Cancel
                </Button>
              </Flex>
            </form>
          </Box>
        </Box>
      </Flex>
    </div>
  );
}
