'use client';
import { Box, Flex, Heading, FormControl, FormLabel, Input, Select, Button, useToast } from '@chakra-ui/react';
import { categories, Subcategory } from '../../../../constants/categoriesData';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../../../../components/AdminSidebar';
import NavBar from '../../../../components/NavBar';
import useAuth from '../../../../hooks/useAuth';

interface Product {
  name: string;
  price: number;
  previous_price: number;
  main_category: string;
  sub_category: string;
  colour: string;
  brand_id: string;
  brand: string;
  product_url: string;
  status: string;
  stock: string;
  size: string[];
}

interface Brand {
  brand_id: string;
  name: string;
}

export default function CreateProduct() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [previous_price, setPreviousPrice] = useState<string>('');
  const [main_category, setMainCategory] = useState<string>('');
  const [sub_category, setSubCategory] = useState<string>('');
  const [colour, setColour] = useState<string>('');
  const [brand_id, setBrandId] = useState<string>('');
  const [brand, setBrandName] = useState<string>('');
  const [product_url, setProductUrl] = useState<string>('');
  const [status, setStatus] = useState<string>('New');
  const [stock, setStock] = useState<string>('In Stock');
  const [size, setSize] = useState<string>('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [mainCategoryOptions, setMainCategoryOptions] = useState<string[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<Subcategory[]>([]);
  const router = useRouter();
  const userRole = useAuth();
  const toast = useToast();

  // Load main categories from constants
  useEffect(() => {
    const options: string[] = [];
    Object.values(categories).forEach((topLevelCategories) =>
      Object.keys(topLevelCategories).forEach((category) => options.push(category))
    );
    setMainCategoryOptions(options);
  }, []);

  // Update sub-categories based on selected main category
  useEffect(() => {
    if (main_category) {
      Object.values(categories).forEach((topLevelCategories) => {
        if (topLevelCategories[main_category]) {
          setSubCategoryOptions(topLevelCategories[main_category].items);
        }
      });
    } else {
      setSubCategoryOptions([]);
    }
  }, [main_category]);

  // Populate brands from /api/brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands');
        const data = await response.json();
        setBrands(data.brands);
      } catch (error) {
        console.error('Error fetching brands:', error);
        toast({
          title: 'Failed to Load Brands',
          description: 'Unable to load brands. Please try refreshing the page.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    fetchBrands();
  }, []);

  // Update selected brand
  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBrandId = e.target.value;
    const selectedBrand = brands.find((brand) => brand.brand_id === selectedBrandId);
    if (selectedBrand) {
      setBrandId(selectedBrand.brand_id);
      setBrandName(selectedBrand.name);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    const newProduct: Product = {
      name,
      price: parseFloat(price),
      previous_price: parseFloat(previous_price),
      main_category,
      sub_category,
      colour,
      brand_id,
      brand,
      product_url,
      status,
      stock,
      size: size.split(',').map((s) => s.trim()),
    };

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProduct),
      });
      if (response.ok) {
        const data = await response.json();
        const productId = data.product_id;
        toast({
          title: 'Product Created',
          description: 'Product has been successfully created.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        router.push(`/admin/products/images/${productId}`);
      } else {
        toast({
          title: 'Creation Failed',
          description: 'Failed to create product. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while creating the product.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Error creating product:', error);
    }
    setIsSubmitting(false);
  };

  if (userRole !== 'admin') return null;

  return (
    <div>
      <NavBar />
      <Flex>
        <Sidebar />
        <Box ml="250px" p={8} width="100%">
          <Heading>Create Product</Heading>
          <Box mt={6}>
            <form onSubmit={handleSubmit}>
              <FormControl isRequired mb={4}>
                <FormLabel>Product Name</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Price</FormLabel>
                <Input
                  type="number"
                  min="0"
                  placeholder="Enter product price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Previous Price</FormLabel>
                <Input
                  type="number"
                  min="0"
                  placeholder="Enter previous price"
                  value={previous_price}
                  onChange={(e) => setPreviousPrice(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Main Category</FormLabel>
                <Select
                  placeholder="Select main category"
                  value={main_category}
                  onChange={(e) => setMainCategory(e.target.value)}
                >
                  {mainCategoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Sub Category</FormLabel>
                <Select
                  placeholder="Select sub category"
                  value={sub_category}
                  onChange={(e) => setSubCategory(e.target.value)}
                  isDisabled={!main_category}
                >
                  {subCategoryOptions.map((subcategory) => (
                    <option key={subcategory.route} value={subcategory.name}>
                      {subcategory.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Colour</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter colour"
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Brand</FormLabel>
                <Select
                  placeholder="Select brand"
                  value={brand_id}
                  onChange={handleBrandChange}
                >
                  {brands.map((brand) => (
                    <option key={brand.brand_id} value={brand.brand_id}>
                      {brand.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Product URL</FormLabel>
                <Input
                  type="url"
                  placeholder="Enter product URL"
                  value={product_url}
                  onChange={(e) => setProductUrl(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Status</FormLabel>
                <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option key="new" value="New">New</option>
                  <option key="old" value="Old">Old</option>
                  <option key="on_sale" value="On Sale">On Sale</option>
                  <option key="not_sale" value="Not Sale">Not Sale</option>
                </Select>
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Stock</FormLabel>
                <Select value={stock} onChange={(e) => setStock(e.target.value)}>
                  <option key="in_stock" value="In Stock">In Stock</option>
                  <option key="out_of_stock" value="Out of Stock">Out of Stock</option>
                  <option key="re_stock" value="Re-Stock">Re-Stock</option>
                </Select>
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Sizes</FormLabel>
                <Input
                  type="text"
                  placeholder="e.g., '41:1, 42:0, 43:1'"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                />
              </FormControl>

              <Flex gap={4}>
                <Button
                  bg="black"
                  color="white"
                  _hover={{ bg: 'gray.700' }}
                  type="submit"
                  isDisabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating Product...' : 'Update Product'}
                </Button>
                <Button
                  bg="black"
                  color="white"
                  _hover={{ bg: 'gray.700' }}
                  onClick={() => router.push('/admin/products')}
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
