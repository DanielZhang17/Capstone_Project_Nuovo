'use client';
import {
  Box,
  Flex,
  Heading,
  Spinner,
  Text,
  VStack,
  Link as ChakraLink,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Sidebar from '../../../components/AdminSidebar';
import NavBar from '../../../components/NavBar';
import useAuth from '../../../hooks/useAuth';
import NextLink from 'next/link';
import { FiUsers, FiHeart, FiEye, FiExternalLink } from 'react-icons/fi';

type MetricItem = {
  id: string;
  name: string;
  count?: number;
  click_count?: number;
  click_through_count?: number;
};

type MetricsData = {
  top_brands_followed: MetricItem[];
  top_items_wishlisted: MetricItem[];
  top_products_clicks: MetricItem[];
  top_products_clickthroughs: MetricItem[];
};

export default function Metrics() {
  const userRole = useAuth();
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('/api/admin/metrics', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch metrics');

        const data: MetricsData = await response.json();
        setMetrics(data);
      } catch (err) {
        setError('Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };

    if (userRole === 'admin') fetchMetrics();
  }, [userRole]);

  if (userRole !== 'admin') return null;

  return (
    <div>
      <NavBar />
      <Flex>
        <Sidebar />
        <Box ml="250px" p={8} width="100%">
          <Heading color="gray.700" mb={6}>Metrics Dashboard</Heading>
          <Box mt={6}>
            {loading ? (
              <Spinner size="lg" color="gray.500" />
            ) : error ? (
              <Text color="red.500">{error}</Text>
            ) : (
              metrics && (
                <Accordion allowToggle>
                  
                  {/* Top Brands Followed */}
                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box as="span" flex="1" textAlign="left" fontWeight="bold" color="gray.600">
                          <Icon as={FiUsers} mr={2} /> Top Brands Followed
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <TableContainer>
                        <Table variant="simple" colorScheme="gray" size="md">
                          <Thead>
                            <Tr>
                              <Th>Brand</Th>
                              <Th isNumeric>Followers</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {metrics.top_brands_followed.map((brand) => (
                              <Tr key={brand.id}>
                                <Td>
                                  <ChakraLink
                                    as={NextLink}
                                    href={`/brand/brand-details/${brand.id}`}
                                    color="blue.500"
                                    _hover={{ textDecoration: 'underline' }}
                                  >
                                    {brand.name}
                                  </ChakraLink>
                                </Td>
                                <Td isNumeric>{brand.count}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </AccordionPanel>
                  </AccordionItem>

                  {/* Top Items Wishlisted */}
                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box as="span" flex="1" textAlign="left" fontWeight="bold" color="gray.600">
                          <Icon as={FiHeart} mr={2} /> Top Items Wishlisted
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <TableContainer>
                        <Table variant="simple" colorScheme="gray" size="md">
                          <Thead>
                            <Tr>
                              <Th>Item</Th>
                              <Th isNumeric>Wishlists</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {metrics.top_items_wishlisted.map((item) => (
                              <Tr key={item.id}>
                                <Td>
                                  <ChakraLink
                                    as={NextLink}
                                    href={`/product/${item.id}`}
                                    color="blue.500"
                                    _hover={{ textDecoration: 'underline' }}
                                  >
                                    {item.name}
                                  </ChakraLink>
                                </Td>
                                <Td isNumeric>{item.count}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </AccordionPanel>
                  </AccordionItem>

                  {/* Top Products by Page Visits */}
                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box as="span" flex="1" textAlign="left" fontWeight="bold" color="gray.600">
                          <Icon as={FiEye} mr={2} /> Top Products by Page Visits
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <TableContainer>
                        <Table variant="simple" colorScheme="gray" size="md">
                          <Thead>
                            <Tr>
                              <Th>Product</Th>
                              <Th isNumeric>Page Visits</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {metrics.top_products_clicks.map((product) => (
                              <Tr key={product.id}>
                                <Td>
                                  <ChakraLink
                                    as={NextLink}
                                    href={`/product/${product.id}`}
                                    color="blue.500"
                                    _hover={{ textDecoration: 'underline' }}
                                  >
                                    {product.name}
                                  </ChakraLink>
                                </Td>
                                <Td isNumeric>{product.click_count}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </AccordionPanel>
                  </AccordionItem>

                  {/* Top Products by Clickthroughs */}
                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box as="span" flex="1" textAlign="left" fontWeight="bold" color="gray.600">
                          <Icon as={FiExternalLink} mr={2} /> Top Products by Clickthroughs
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <TableContainer>
                        <Table variant="simple" colorScheme="gray" size="md">
                          <Thead>
                            <Tr>
                              <Th>Product</Th>
                              <Th isNumeric>Clickthroughs</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {metrics.top_products_clickthroughs.map((product) => (
                              <Tr key={product.id}>
                                <Td>
                                  <ChakraLink
                                    as={NextLink}
                                    href={`/product/${product.id}`}
                                    color="blue.500"
                                    _hover={{ textDecoration: 'underline' }}
                                  >
                                    {product.name}
                                  </ChakraLink>
                                </Td>
                                <Td isNumeric>{product.click_through_count}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              )
            )}
          </Box>
        </Box>
      </Flex>
    </div>
  );
}
