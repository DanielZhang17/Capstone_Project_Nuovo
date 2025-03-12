import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Box,
  Flex,
  Image,
  InputGroup,
  Input,
  InputLeftElement,
  SimpleGrid,
  Text,
  Button,
  Heading,
  useToast,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { HiOutlineSquares2X2, HiOutlineBell, HiOutlineBellAlert } from 'react-icons/hi2';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import { logoBase64 } from './logoBase64';

interface Brand {
  id: string;
  name: string;
  description: string;
  logo: string;
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Group brands alphabetically
const groupBrandsByLetter = (brands) => {
  return brands.reduce((acc, brand) => {
    const firstLetter = brand.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(brand);
    // console.log(acc);
    return acc;
  }, {});
};

// Helper function to format base64 logo
const formatLogo = (logo, type = "png") => {
  return `data:image/${type};base64,${logo}`;
};

const BrandListingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showAllBrands, setShowAllBrands] = useState(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({});
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchBrands();
    fetchFollowedBrands(); // Fetch followed brands to set initial "Notifying" state
  }, []);

  // Fetch all brands
  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/brands');
      if (!response.ok) throw new Error('Failed to fetch brands');

      const data = await response.json();
      const brandArray = Object.values(data.brands).map((brand) => ({
        id: brand.brand_id,
        name: brand.name,
        logo: formatLogo(brand.logo, "png"),
        description: brand.description || 'Brand description unavailable.',
      }));

      setBrands(brandArray);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setError('Failed to load brands');
      toast({
        title: 'Error',
        description: 'Could not load brand data. Showing default brands.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch followed brands to initialize "Notifying" status
  const fetchFollowedBrands = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/user/profile/following', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch followed brands');

      const data = await response.json();
      const followedBrandIds = data.followingBrands.map((brand) => brand.brand_id);

      // Set "Notifying" status for followed brands
      const initialNotifications = {};
      followedBrandIds.forEach((id) => {
        initialNotifications[id] = true;
      });
      setNotifications(initialNotifications);
    } catch (error) {
      console.error('Error fetching followed brands:', error);
      toast({
        title: 'Error',
        description: 'Failed to load followed brands.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Follow a brand
  const followBrand = async (brandId) => {
    try {
      const response = await fetch(`/api/user/follow_brand/${brandId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to follow brand');
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // Unfollow a brand
  const unfollowBrand = async (brandId) => {
    try {
      const response = await fetch(`/api/user/unfollow_brand/${brandId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to unfollow brand');
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // Toggle notification (follow/unfollow)
  const handleNotificationToggle = async (brandId, brandName) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to receive notifications.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      router.push('/login');
      return;
    }

    const isNotifying = notifications[brandId];
    const success = isNotifying ? await unfollowBrand(brandId) : await followBrand(brandId);

    if (success) {
      setNotifications((prev) => ({ ...prev, [brandId]: !isNotifying }));
      toast({
        title: isNotifying ? 'Notification removed!' : 'Notification added!',
        description: isNotifying
          ? `You will no longer receive notifications for ${brandName}.`
          : `You will receive notifications for ${brandName}.`,
        status: isNotifying ? 'error' : 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Error',
        description: `Failed to update notifications for ${brandName}.`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleShowAllBrands = () => {
    setShowAllBrands(true);
    setSelectedLetter('');
  };

  const groupedBrands = groupBrandsByLetter(brands);
  const filteredBrands = showAllBrands
    ? { All: brands.filter(brand => brand.name.toLowerCase().includes(searchQuery.toLowerCase())) }
    : Object.keys(groupedBrands)
        .filter(letter => letter >= selectedLetter)
        .sort()
        .reduce((acc, letter) => {
          const filtered = groupedBrands[letter]?.filter(brand =>  
            brand.name.toLowerCase().includes(searchQuery.toLowerCase())
          ) || [];
          if (filtered.length > 0) {
            acc[letter] = filtered;
            // console.log(`Brands for letter ${letter}:`, filtered);
          }
          return acc;
        }, {});

  return (
    <>
      <NavBar />
      <Box p={5}>
        <Flex mb={6} wrap="wrap" justify="center">
          <Button
            onClick={handleShowAllBrands}
            variant="ghost"
            mx={1}
            mb={2}
            fontWeight="normal"
            aria-label="Show all brands"
            _hover={{ bg: "#e6e6e6" }}
            _active={{ bg: "#e6e6e6" }}
            bg={showAllBrands ? "#e6e6e6" : "transparent"}
          >
            <HiOutlineSquares2X2 size={20} />
          </Button>
          {alphabet.map((letter) => (
            <Button
              key={letter}
              onClick={() => {
                setSelectedLetter(letter);
                setShowAllBrands(false); 
                // console.log(`Selected letter: ${letter}`);
              }}
              variant="ghost"
              mx={1}
              mb={2}
              fontWeight="normal"
              _hover={{ bg: "#e6e6e6" }}
              _active={{ bg: "#e6e6e6" }}
              bg={selectedLetter === letter ? "#e6e6e6" : "transparent"}
            >
              {letter}
            </Button>
          ))}
        </Flex>

        <Flex h="80vh" align="flex-start">
          <Box w="25%" position="sticky" top="0" h="full">
            <Box w="70%" mx="auto" textAlign="center">
              <InputGroup mb={4}>
                <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.500" />} />
                <Input
                  placeholder="Search brands"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  borderRadius="md"
                  border="1px solid"
                  borderColor="black"
                  _focus={{ borderColor: 'black' }}
                  variant="outline"
                />
              </InputGroup>
              <Image src={logoBase64} alt="brand_info" borderRadius="md" mx="auto" />
            </Box>
          </Box>

          <Box 
            w="75%" 
            pl={5} 
            maxH="80vh" 
            overflowY="auto" 
            pr={4} 
            pb={10} 
            css={{
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              '-ms-overflow-style': 'none', // for Internet Explorer and Edge
              'scrollbar-width': 'none', // for Firefox
            }}
          >
            {Object.keys(filteredBrands).map((letter) => (
              <Box key={letter} mb={6}>
                <Heading as="h3" size="md" mb={4}>{letter}</Heading>
                <SimpleGrid columns={[1, 2, 3]} spacing={6}>
                  {filteredBrands[letter].map((brand) => {
                    const isNotifying = notifications[brand.id];
                    return (
                      <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={5} key={brand.id}>
                        <Link href={`/brand/brand-details/${brand.id}`} passHref>
                          <Image
                            src={brand.logo}
                            alt={`${brand.name} logo`}
                            mb={4}
                            boxSize="96px"
                            objectFit="cover"
                            cursor="pointer"
                          />
                        </Link>
                        <Flex alignItems="center" justifyContent="space-between" mb={2}>
                          <Text fontWeight="bold" fontSize="lg" mr={2}>{brand.name}</Text>
                          <Button
                            size="sm"
                            variant="solid"
                            bg={isNotifying ? "orange" : "#f8e164"}
                            _hover={{ bg: "#fcf097" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationToggle(brand.id, brand.name);
                            }}
                            leftIcon={isNotifying ? <HiOutlineBellAlert /> : <HiOutlineBell />}
                            minWidth="100px"
                            paddingX={4}
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                          >
                            {isNotifying ? "Notifying" : "Notify me"}
                          </Button>
                        </Flex>
                        <Text>{brand.description}</Text>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </Box>
            ))}
          </Box>
        </Flex>
      </Box>
      <Footer />
    </>
  );
};

export default BrandListingPage;
