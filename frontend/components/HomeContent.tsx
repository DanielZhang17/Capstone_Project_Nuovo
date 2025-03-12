'use client';

import { FC, useEffect, useState } from 'react';
import Filter from './FilterGroup';
import SearchBar from './SearchBar';
import HorizontalFilter from './HorizontalFilter';
import ProductList from './ProductList';
// import { Box, Image, Text } from "@chakra-ui/react";


interface HomeContentProps {
  selectedSort: string;
  setSelectedSort: (value: string) => void;
  brandName?: string; // Optional brand name
  mainCategory?: string; // Optional main category
  subCategory?: string; // Optional subcategory
}

interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: string;
  status: string; // Added status
  brand: string;  // Added brand
}

interface Filters {
  mainCategory: string;
  subCategory: string;
  color: string[];
  brandName: string[];
  size: string[];
  minPrice: string;
  maxPrice: string;
  keyword: string;
  sortByPopularity: boolean;
  sortByPrice: string;
  sortByNew: string;
}

const HomeContent: FC<HomeContentProps> = ({ selectedSort, setSelectedSort, brandName, mainCategory, subCategory }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters | null>(null);
  const productsPerPage = 18; 
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 1. Initial Load to Fetch All Products for Search Bar
  const fetchAllProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/products`);
      if (!response.ok) throw new Error(`Failed to fetch products: ${response.statusText}`);

      const data: any[] = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid data format: expected an array of products');

      const fetchedProducts: Product[] = data.map((product: any) => ({
        id: product.product_id,
        name: product.name,
        description: `This product is ${product.color} in color, suitable for ${product.gender}.`,
        imageUrl: product.first_image,
        price: product.price,
        status: product.status,    // Map status
        brand: product.brand        // Map brand
      }));

      setAllProducts(fetchedProducts); // Store all products for search
      // setProducts(fetchedProducts); // Initial display of all products
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Products Based on Passed Props (mainCategory, subCategory, brandName)
  const fetchFilteredProducts = async () => {
    setLoading(true);
    setError(null);
    setProducts([]); 
    try {
      const queryParams = new URLSearchParams();
      if (brandName) queryParams.append('brand_name', brandName);
      if (mainCategory) queryParams.append('main_category', mainCategory);
      if (subCategory) queryParams.append('sub_category', subCategory);

      const response = await fetch(`/api/products?${queryParams.toString()}`);
      if (!response.ok) throw new Error(`Failed to fetch products: ${response.statusText}`);

      const data: any[] = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid data format: expected an array of products');

      const fetchedProducts: Product[] = data.map((product: any) => ({
        id: product.product_id,
        name: product.name,
        description: `This product is ${product.color} in color, suitable for ${product.gender}.`,
        imageUrl: product.first_image,
        price: product.price,
        status: product.status,
        brand: product.brand 
      }));
      // console.log(fetchedProducts);

      setProducts(fetchedProducts); // Update products based on category or brand filters
      // console.log(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // 3. Apply Additional Filters for User-Defined Filtering
  const applyFilter = async (currentFilters: Partial<Filters>) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();

      // Main Category and Sub Category filters
      if (currentFilters.mainCategory && currentFilters.mainCategory.length > 0) {
        currentFilters.mainCategory.forEach((category) => queryParams.append('main_category', currentFilters.mainCategory));
      }
      if (currentFilters.subCategory && currentFilters.subCategory.length > 0) {
        currentFilters.subCategory.forEach((subCategory) => queryParams.append('sub_category', currentFilters.subCategory));
      }

      // Color filter
      if (currentFilters.color && currentFilters.color.length > 0) {
        currentFilters.color.forEach((color) => queryParams.append('color', currentFilters.color));
      }

      // Brand Name filter
      if (currentFilters.brandName && currentFilters.brandName.length > 0) {
        currentFilters.brandName.forEach((brand) => queryParams.append('brand_name', currentFilters.brandName));
      }

      // Size filter
      if (currentFilters.size && currentFilters.size.length > 0) {
        currentFilters.size.forEach((size) => queryParams.append('size', size));
      }

      // Price filters
      if (currentFilters.minPrice) queryParams.append('min_price', currentFilters.minPrice);
      if (currentFilters.maxPrice) queryParams.append('max_price', currentFilters.maxPrice);

      // Status filters (NEW, On Sale, Re-Stock)
      if (currentFilters.status && currentFilters.status.length > 0) {
        currentFilters.status.forEach((status) => queryParams.append('status', currentFilters.status));
      }

      // Stock filter (In stock, Re-stock, Out of Stock)
      if (currentFilters.stock) queryParams.append('stock', currentFilters.stock);

      // Sorting options
      if (currentFilters.sortByPopularity) queryParams.append('sort_by_popularity', String(currentFilters.sortByPopularity));
      if (currentFilters.sortByPrice) queryParams.append('sort_by_price', currentFilters.sortByPrice);
      if (currentFilters.sortByNew) queryParams.append('sort_by_new', currentFilters.sortByNew);

      // Fetch products with the generated query parameters
      const response = await fetch(`/api/products?${queryParams.toString()}`);
      if (!response.ok) throw new Error(`Failed to fetch products: ${response.statusText}`);

      const data: any[] = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid data format: expected an array of products');

      const fetchedProducts: Product[] = data.map((product: any) => ({
        id: product.product_id,
        name: product.name,
        description: `This product is ${product.color} in color, suitable for ${product.gender}.`,
        imageUrl: product.first_image,
        price: product.price,
        status: product.status,
        brand: product.brand 
      }));

      setProducts(fetchedProducts); // Update products based on user-defined filters
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Initial Load for All Products
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Load products whenever mainCategory, subCategory, or brandName changes
  useEffect(() => {
    fetchFilteredProducts();
  }, [mainCategory, subCategory, brandName]);

  // Apply filters when user-defined filters are updated
  useEffect(() => {
    if (filters) {
      applyFilter(filters);
    }
  }, [filters]);

  const handleSearch = (keyword: string) => {
    const filtered = allProducts.filter(product =>
      product.name.toLowerCase().includes(keyword.toLowerCase())
    );
    setProducts(filtered);
  };

  const handleSaveFilters = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1); 
  };

  const handleSetSelectedSort = (sort: string) => {
    const newFilters: Filters = {
      ...filters,
      sortByPrice: sort === 'price_asc' ? 'asc' : sort === 'price_desc' ? 'desc' : '',
      sortByNew: sort === 'new' ? 'desc' : '',
    } as Filters;
    setFilters(newFilters);
    setSelectedSort(sort);
  };

  const totalPages = Math.ceil(products.length / productsPerPage);

  const getPaginationButtons = () => {
    const buttons = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      if (currentPage <= 3) {
        buttons.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        buttons.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        buttons.push(1, '...', currentPage, '...', totalPages);
      }
    }
    return buttons;
  };

  return (
    <div className="home-content">
      <Filter onSaveFilters={handleSaveFilters} />
      <div className="main-content">
        <div className="top-bar">
          <SearchBar productList={allProducts} onSearch={handleSearch} />
          <HorizontalFilter selectedSort={selectedSort} setSelectedSort={handleSetSelectedSort} />
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{ }</p>
        ) : (
          <ProductList products={products.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)} />
        )}

        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {getPaginationButtons().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
              className={currentPage === page ? 'active' : ''}
              disabled={typeof page !== 'number'}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      <style jsx>{`
        .home-content {
          display: flex;
        }
        .main-content {
          width: 80%;
          padding: 20px;
        }
        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .pagination {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 20px;
        }
        .pagination button {
          padding: 5px 10px;
          cursor: pointer;
        }
        .pagination button.active {
          font-weight: bold;
        }
        .pagination button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export default HomeContent;