'use client';
import { Box, Flex, Heading, Table, Thead, Tbody, Tr, Th, Td, Link as ChakraLink, useToast, Button, Text } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import Sidebar from '../../../components/AdminSidebar';
import NavBar from '../../../components/NavBar';
import useAuth from '../../../hooks/useAuth';
import NextLink from 'next/link';

interface Brand {
  id: string;
  name: string;
  followersCount: number;
}

export default function Brands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const toast = useToast();
  const userRole = useAuth();

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/brands', { 
          method: 'GET', 
          headers: { 'Content-Type': 'application/json' } 
        });
        if (!response.ok) throw new Error('Failed to fetch brands');
        
        // Parse the JSON data and log it to ensure it contains followers_count
        const data = await response.json();
        console.log("API response data:", data);

        // Map the data to the Brand array and log to verify
        const brandArray: Brand[] = Object.values(data.brands).map((brand: any) => ({
          id: brand.brand_id,
          name: brand.name,
          followersCount: brand.followers_list.length,
        }));
        console.log("Processed brands array:", brandArray);

        setBrands(brandArray);
      } catch (error) {
        setError('Failed to load brands');
        toast({
          title: 'Error loading brands',
          description: 'Could not fetch brands. Please try again later.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [toast]);

  const handleDelete = async (brandId: string) => {
    try {
      const response = await fetch(`/api/admin/brands/${brandId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 400) throw new Error('Cannot delete brand; it is associated with existing products');
      if (response.status === 403) throw new Error('Unauthorized: Only admins can delete brands');
      if (response.status === 404) throw new Error('Brand not found');
      if (!response.ok) throw new Error('Failed to delete brand');

      setBrands((prevBrands) => prevBrands.filter((brand) => brand.id !== brandId));
      toast({
        title: 'Brand deleted successfully',
        description: `Brand with ID ${brandId} has been deleted.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
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
          <Flex justifyContent="space-between" alignItems="center" mb={6}>
            <Heading>Brands</Heading>
            <ChakraLink as={NextLink} href="/admin/brands/create" _hover={{ textDecoration: 'none' }}>
              <Button bg="black" color="white" size="lg" _hover={{ bg: "gray.700" }}>Create Brand</Button>
            </ChakraLink>
          </Flex>
          <Box mt={6}>
            {loading && <p>Loading brands...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && brands.length === 0 && <p>No brands available.</p>}
            {!loading && !error && (
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Brand Name</Th>
                    <Th>Brand ID</Th>
                    <Th>Followers Count</Th> 
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {brands.map((brand: Brand) => (
                    <Tr key={brand.id}>
                      <Td>
                        <ChakraLink 
                          as={NextLink} 
                          href={`/brand/brand-details/${brand.id}`} 
                          color="black" 
                          _hover={{ textDecoration: 'underline' }}
                        >
                          {brand.name}
                        </ChakraLink>
                      </Td>
                      <Td>{brand.id}</Td>
                      <Td>{brand.followersCount}</Td>
                      <Td>
                        <Flex gap="2" alignItems="center">
                          <ChakraLink 
                            as={NextLink} 
                            href={`/admin/brands/update/${brand.id}`} 
                            color="blue.500" 
                            _hover={{ textDecoration: 'underline' }}
                          >
                            Update
                          </ChakraLink>
                          <Text as="span" mx="1" color="gray.500">|</Text>
                          <ChakraLink 
                            as="button" 
                            onClick={() => handleDelete(brand.id)} 
                            color="red.500" 
                            _hover={{ textDecoration: 'underline' }}
                          >
                            Delete
                          </ChakraLink>
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Box>
        </Box>
      </Flex>
    </div>
  );
}
