'use client';

import { FC, useState } from 'react';
import { Box, Checkbox, Flex, Text, Input, useColorModeValue, Button, Collapse, SimpleGrid, Stack } from '@chakra-ui/react';

interface FilterProps {
  onSaveFilters: (filters: Filters) => void;
}

interface Filters {
  mainCategory: string[];
  subCategory: string[];
  color: string[];
  brandName: string[];
  size: string[];
  minPrice: string;
  maxPrice: string;
  sortByPopularity: boolean;
  sortByPrice: string;
  status: string[];
  stock: string | null;
}

const FilterGroup: FC<FilterProps> = ({ onSaveFilters }) => {
  const [filters, setFilters] = useState<Filters>({
    mainCategory: [],
    subCategory: [],
    color: [],
    brandName: [],
    size: [],
    minPrice: '',
    maxPrice: '',
    sortByPopularity: false,
    sortByPrice: '',
    status: [],
    stock: null,
  });

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories: Record<string, string[]> = {
    "Men's Shoes": ["Sneakers", "Dress Shoes", "Boots", "Sandals & Slides", "Loafers"],
    "Women's Shoes": ["Casual Shoes", "Sneakers", "Heels", "Flats", "Boots", "Sandals & Slides"],
    "Men's Clothing": ["T-Shirts", "Dress Shirts", "Casual Shirts", "Jackets & Coats", "Jeans", "Trousers", "Shorts", "Sweats and Hoodies"],
    "Women's Clothing": ["Tops", "Dresses", "Skirts", "Pants", "Blouses", "Jackets & Coats", "Activewear", "Loungewear", "Sweats and Hoodies"],
    "Bags & Backpacks": ["Handbags", "Backpacks", "Tote Bags", "Crossbody Bags", "Duffel Bags"],
    "Jewellery": ["Necklaces", "Bracelets", "Earrings", "Rings", "Watches"],
    "Hats & Headwear": ["Caps", "Beanies", "Sun Hats"],
    "Belts & Wallets": ["Belts", "Wallets", "Cardholders"],
    "Sunglasses & Eyewear": ["Sunglasses", "Accessories"],
  };

  const brands: string[] = [
    "Five By Flynn",
    "Venroy",
    "Alfie's Mission",
    "Asha Jasper",
    "The Snakehole",
    "Listen Clothing",
  ];

  const colors: string[] = ["Beige", "Black", "Brown", "Charcoal", "Mustard", "Teal", "Olive", "Silver", "Multi", "Khaki", "Blue", "White", "Red", "Cream", "Navy", "Orange", "Green", "Sand", "Camo", "Gold", "Indigo", "Petrol Blue", "Pink", "Yellow", "Stone", "Grey"];

  const filterContainerBg = useColorModeValue('white', '#f9f9f9');
  const filterContainerBorder = useColorModeValue('1px solid', 'none');
  const filterContainerBorderColor = useColorModeValue('gray.300', 'transparent');

  const handleSaveClick = () => {
    onSaveFilters(filters);
  };

  const handleMultiCheckboxChange = (filterName: keyof Filters, value: string) => {
    setFilters((prevFilters) => {
      const updatedFilter = prevFilters[filterName] as string[];
      const isChecked = updatedFilter.includes(value);
      return {
        ...prevFilters,
        [filterName]: isChecked
          ? updatedFilter.filter((item) => item !== value)
          : [...updatedFilter, value],
      };
    });
  };

  const handleMainCategoryClick = (category: string, subCategories: string[]) => {
    const isSelected = filters.mainCategory.includes(category);
    
    setFilters((prevFilters) => ({
      ...prevFilters,
      mainCategory: isSelected
        ? prevFilters.mainCategory.filter((item) => item !== category)
        : [...prevFilters.mainCategory, category],
      subCategory: isSelected
        ? prevFilters.subCategory.filter((sub) => !subCategories.includes(sub))
        : [...prevFilters.subCategory, ...subCategories],
    }));
    
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const toggleStatusFilter = (status: string) => {
    setFilters((prevFilters) => {
      const isStatusSelected = prevFilters.status.includes(status);
      return {
        ...prevFilters,
        status: isStatusSelected
          ? prevFilters.status.filter((s) => s !== status)
          : [...prevFilters.status, status],
      };
    });
  };

  return (
    <Box
      width="20%"
      padding="20px"
      marginTop="20px"
      marginLeft="20px"
      marginBottom="20px"
      backgroundColor={filterContainerBg}
      border={filterContainerBorder}
      borderColor={filterContainerBorderColor}
      borderRadius="10px"
    >
      {/* Status Filter Buttons */}
      <Box marginBottom="20px">
        <Text fontWeight="bold" marginBottom="10px">Product Status</Text>
        <Stack direction="row" spacing={4}>
          <Button
            variant={filters.status.includes("new") ? "solid" : "outline"}
            colorScheme="purple"
            onClick={() => toggleStatusFilter("new")}
          >
            NEW
          </Button>
          <Button
            variant={filters.status.includes("on sale") ? "solid" : "outline"}
            colorScheme="yellow"
            onClick={() => toggleStatusFilter("on sale")}
          >
            On Sale
          </Button>
          <Button
            variant={filters.stock === "re-stock" ? "solid" : "outline"}
            colorScheme="orange"
            onClick={() => setFilters((prevFilters) => ({
              ...prevFilters,
              stock: prevFilters.stock === "re-stock" ? null : "re-stock"
            }))}
          >
            Re-Stock
          </Button>
        </Stack>
      </Box>

      {/* Category Filter */}
      <Box marginBottom="20px">
        <Text fontWeight="bold" marginBottom="10px">Category</Text>
        {Object.entries(categories).map(([category, subCategories]) => (
          <Box key={category} marginBottom="10px">
            <Flex alignItems="center" marginBottom="5px">
              <Checkbox
                isChecked={filters.mainCategory.includes(category)}
                onChange={() => handleMainCategoryClick(category, subCategories)}
              />
              <Text fontSize="14px" fontWeight="500" marginLeft="10px">{category}</Text>
            </Flex>
            <Collapse in={expandedCategory === category} animateOpacity>
              {subCategories.map((subCategory) => (
                <Box key={subCategory} marginLeft="25px">
                  <Checkbox
                    isChecked={filters.subCategory.includes(subCategory)}
                    onChange={() => handleMultiCheckboxChange('subCategory', subCategory)}
                  >
                    {subCategory}
                  </Checkbox>
                </Box>
              ))}
            </Collapse>
          </Box>
        ))}
      </Box>

      {/* Brand Filter */}
      <Box marginBottom="20px">
        <Text fontWeight="bold" marginBottom="10px">Brand</Text>
        {brands.map((brand) => (
          <Box key={brand} marginBottom="10px">
            <Checkbox
              isChecked={filters.brandName.includes(brand)}
              onChange={() => handleMultiCheckboxChange('brandName', brand)}
            >
              {brand}
            </Checkbox>
          </Box>
        ))}
      </Box>

      {/* Price Filter */}
      <Box marginBottom="20px">
        <Text fontWeight="bold" marginBottom="10px">Price</Text>
        <Flex>
          <Input
            placeholder="Min Price"
            marginRight="10px"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          />
          <Input
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          />
        </Flex>
      </Box>

      {/* Color Filter - Three Column Layout */}
      <Box marginBottom="20px">
        <Text fontWeight="bold" marginBottom="10px">Color</Text>
        <SimpleGrid columns={3} spacing={2}>
          {colors.map((color) => (
            <Checkbox
              key={color}
              isChecked={filters.color.includes(color)}
              onChange={() => handleMultiCheckboxChange('color', color)}
            >
              {color}
            </Checkbox>
          ))}
        </SimpleGrid>
      </Box>

      <Button
        mt="10px"
        border="2px solid"
        borderColor="black"
        borderRadius="full"
        backgroundColor="transparent"
        color="black"
        fontWeight="bold"
        width="100%"
        _hover={{ backgroundColor: 'gray.100' }}
        onClick={handleSaveClick}
      >
        Save Filters
      </Button>
    </Box>
  );
};

export default FilterGroup;
