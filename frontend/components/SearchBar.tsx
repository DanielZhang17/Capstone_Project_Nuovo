'use client';

import { FC, useState, ChangeEvent, KeyboardEvent } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useColorModeValue, Input, InputGroup, InputLeftElement, Box, List, ListItem, Image, Text, Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';

interface Product {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
}

interface SearchBarProps {
  productList: Product[];
  onSearch: (keyword: string) => void;
}

const SearchBar: FC<SearchBarProps> = ({ productList, onSearch }) => {
  const [searchInput, setSearchInput] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const containerBgColor = useColorModeValue('white', 'black');
  const iconColor = useColorModeValue('black', 'white');
  const inputTextColor = useColorModeValue('black', 'white');
  const borderColor = useColorModeValue('#ccc', 'white');
  const router = useRouter();

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    if (value) {
      const matches = productList
        .filter(product => product.name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setFilteredProducts(matches);
    } else {
      setFilteredProducts([]);
    }
  };

  const handleProductClick = (productId: number) => {
    router.push(`/product/${productId}`);
    setSearchInput('');
    setFilteredProducts([]);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(searchInput);
      setSearchInput('');
      setFilteredProducts([]);
    }
  };

  return (
    <Box position="relative">
      <InputGroup backgroundColor={containerBgColor} borderColor={borderColor} border="1px solid" borderRadius="20px" padding="5px 10px" width="300px">
        <InputLeftElement pointerEvents="none">
          <FaSearch color={iconColor} />
        </InputLeftElement>
        <Input
          type="text"
          placeholder="Search"
          value={searchInput}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          backgroundColor={containerBgColor}
          color={inputTextColor}
          border="none"
          outline="none"
          _focus={{ boxShadow: 'none' }}
        />
      </InputGroup>

      {filteredProducts.length > 0 && (
        <List position="absolute" top="100%" mt="5px" bg="white" width="100%" border="1px solid" borderColor="gray.300" borderRadius="md" zIndex="10">
          {filteredProducts.map(product => (
            <ListItem key={product.id} onClick={() => handleProductClick(product.id)} cursor="pointer" _hover={{ bg: 'gray.100' }} padding="5px">
              <Flex align="center">
                <Image src={product.imageUrl} alt={product.name} boxSize="20px" borderRadius="5px" mr="10px" />
                <Box>
                  <Text fontWeight="bold">{product.name}</Text>
                  <Text fontSize="sm" color="gray.600">${product.price}</Text>
                </Box>
              </Flex>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default SearchBar;
