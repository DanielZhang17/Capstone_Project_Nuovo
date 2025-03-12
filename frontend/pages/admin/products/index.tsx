import { Box, Flex, Heading, Table, Thead, Tbody, Tr, Th, Td, Link as ChakraLink, useToast, Button } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import Sidebar from '../../../components/AdminSidebar';
import NavBar from '../../../components/NavBar';
import useAuth from '../../../hooks/useAuth';
import NextLink from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  main_category: string;
  sub_category: string;
  brand: string;
  status: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();
  const userRole = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products', { headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) throw new Error();
        
        const data = await response.json();
        setProducts(data.map((product: any) => ({
          id: product.product_id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          main_category: product.main_category,
          sub_category: product.sub_category,
          brand: product.brand,
          status: product.status,
        })));
      } catch {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (productId: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setProducts((prev) => prev.filter((product) => product.id !== productId));
        toast({ title: 'Product deleted', description: `Deleted product with ID ${productId}`, status: 'success', duration: 3000, isClosable: true });
      } else {
        toast({ title: 'Error', description: `Failed to delete product with ID ${productId}.`, status: 'error', duration: 3000, isClosable: true });
      }
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred while deleting the product.', status: 'error', duration: 3000, isClosable: true });
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
            <Heading>Products</Heading>
            <ChakraLink as={NextLink} href="/admin/products/create" _hover={{ textDecoration: 'none' }}>
              <Button bg="black" color="white" size="lg" _hover={{ bg: "gray.700" }}>Create Product</Button>
            </ChakraLink>
          </Flex>

          <Box mt={6}>
            {loading ? <p>Loading products...</p> :
             error ? <p style={{ color: 'red' }}>{error}</p> :
             products.length === 0 ? <p>No products available.</p> : (
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Price</Th>
                    <Th>Stock</Th>
                    <Th>Main Category</Th>
                    <Th>Sub Category</Th>
                    <Th>Brand</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {products.map((product) => (
                    <Tr key={product.id}>
                      <Td>
                        <ChakraLink as={NextLink} href={`/product/${product.id}`} color="black" _hover={{ textDecoration: 'underline' }}>
                          {product.name}
                        </ChakraLink>
                      </Td>
                      <Td>{product.price} USD</Td>
                      <Td>{product.stock}</Td>
                      <Td>{product.main_category}</Td>
                      <Td>{product.sub_category}</Td>
                      <Td>{product.brand}</Td>
                      <Td>{product.status}</Td>
                      <Td>
                        <ChakraLink as={NextLink} href={`/admin/products/update/${product.id}`} color="blue.500" _hover={{ textDecoration: 'underline' }}>
                          Update
                        </ChakraLink>
                        {' | '}
                        <ChakraLink as="button" onClick={() => handleDelete(product.id)} color="red.500" _hover={{ textDecoration: 'underline' }}>
                          Delete
                        </ChakraLink>
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
