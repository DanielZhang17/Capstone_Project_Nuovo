import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Heading, Text, Image, Spinner, useToast, Stack, Flex } from '@chakra-ui/react';
import NavBar from '../../../components/NavBar';
import HomeContent from '../../../components/HomeContent';
import Footer from '../../../components/Footer';

interface BrandDetailsProps {
  id: string;
  name: string;
  description: string;
  logo: string;
  categories?: {
    id: string;
    name: string;
    products: { id: string; name: string }[];
  }[];
}

const BrandDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [brand, setBrand] = useState<BrandDetailsProps | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<string>('new');
  const toast = useToast();

  useEffect(() => {
    if (!id) return;

    const fetchBrandDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/brands/${id}`);
        if (!response.ok) throw new Error('Failed to fetch brand details');

        const data = await response.json();
        setBrand(data);
      } catch (error) {
        console.error('Error fetching brand details:', error);
        setError('Failed to load brand details');
        toast({
          title: 'Error',
          description: 'Could not load brand details.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBrandDetails();
  }, [id, toast]);

  if (loading) return <Spinner size="xl" />;
  if (error || !brand) return <Text>{error || 'Brand not found'}</Text>;

  return (
    <>
      <NavBar />
      <Box p={5} maxW="full" mx="auto">
        {/* Brand Name, Description, and Logo */}
        <Flex alignItems="center" justifyContent="space-between" mb={8}>
          <Box>
            <Heading as="h1" fontSize="4xl" mb={4}>
              {brand.name.toUpperCase()}
            </Heading>
            <Text fontSize="md">
              {brand.description}
            </Text>
          </Box>
          <Image src={`data:image/jpeg;base64,${brand.logo}`} alt={`${brand.name} logo`} boxSize="120px" />
        </Flex>

        {/* Add HomeContent here */}
        <HomeContent
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
          brandName={brand.name} // Assuming you get `brand.name` from the API call in your brand details page
        />
      </Box>
      <Footer />
    </>
  );
};

export default BrandDetails;