'use client';
import { Box, Flex, Heading, Table, Thead, Tbody, Tr, Th, Td, Link as ChakraLink, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import Sidebar from '../../../components/AdminSidebar';
import NavBar from '../../../components/NavBar';
import useAuth from '../../../hooks/useAuth';

interface User {
  name: string;
  email: string;
  followed_brand_count: number;
  wish_list_count: number;
  notifications_count: number;
}

export default function Users() {
  const userRole = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);

    if (userRole !== 'admin') {
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      if (!storedToken) return;

      try {
        const response = await fetch('/api/admin/users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        const jsonData = await response.json();
        setUsers(jsonData);
      } catch (fetchError) {
        console.error('Error fetching users:', fetchError);
        setError('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userRole]);

  const handleDeleteUser = async (email: string) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/user?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(prevUsers => prevUsers.filter(user => user.email !== email));

      toast({
        title: 'User deleted.',
        description: `User with email ${email} has been deleted.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user.');
    }
  };

  const confirmDeleteUser = (email: string) => {
    setUserToDelete(email);
    onOpen();
  };

  const onConfirmDelete = () => {
    if (userToDelete) {
      handleDeleteUser(userToDelete);
    }
    onClose();
  };

  if (loading) return null;
  if (!token || userRole !== 'admin') return null;

  return (
    <div>
      <NavBar />
      <Flex>
        <Sidebar />
        <Box ml="250px" p={8} width="100%">
          <Heading>Users</Heading>
          <Box mt={6}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!error && users.length === 0 && <p>No users available.</p>}
            {!error && (
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Followed Brands</Th>
                    <Th>Wish List</Th>
                    <Th>Notifications</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((user, index) => (
                    <Tr key={index}>
                      <Td>
                        <ChakraLink href={`/user/${user.name}`} color="black" _hover={{ textDecoration: 'underline' }}>
                          {user.name}
                        </ChakraLink>
                      </Td>
                      <Td>{user.email}</Td>
                      <Td>{user.followed_brand_count}</Td>
                      <Td>{user.wish_list_count}</Td>
                      <Td>{user.notifications_count}</Td>
                      <Td>
                        <ChakraLink as="button" onClick={() => confirmDeleteUser(user.email)} color="red.500" _hover={{ textDecoration: 'underline' }}>
                          Delete
                        </ChakraLink>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Box>
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Confirm Deletion</ModalHeader>
              <ModalBody>
                Are you sure you want to delete this user? This action cannot be undone.
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={onConfirmDelete}>
                  Delete
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      </Flex>
    </div>
  );
}
