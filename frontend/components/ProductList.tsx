import { FC } from 'react';
import { useRouter } from 'next/router';
import { Badge } from '@chakra-ui/react';

interface ProductListProps {
  products: { id: number; name: string; description: string; imageUrl: string; price: string; status: string; brand: string }[];
}

const ProductList: FC<ProductListProps> = ({ products }) => {
  const router = useRouter();

  const handleProductClick = (id: number) => {
    router.push(`/product/${id}`);
  };

  const getStatusColorScheme = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'purple';
      case 'on sale':
        return 'orange';
      case 'not sale':
        return 'gray';
      case 'old':
        return 'blue';
      default:
        return 'green';
    }
  };

  return (
    <div className="product-list">
      {products.map((product) => (
        <div className="product-card" key={product.id} onClick={() => handleProductClick(product.id)}>
          <img src={product.imageUrl} alt={product.name} className="product-image" />
          <div className="product-info">
            <p className="brand">{product.brand}</p>
            <p className="name">{product.name}</p>
            <div className="price-badge">
              <p className="price">${product.price}</p>
              <Badge colorScheme={getStatusColorScheme(product.status)} fontSize="0.8em" p="1" borderRadius="md">
                {product.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      ))}

      <style jsx>{`
        .product-list {
          column-count: 6;
          column-gap: 10px;
        }
        .product-card {
          background-color: white;
          padding: 10px;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
          border-radius: 5px;
          margin-bottom: 15px;
          break-inside: avoid;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .product-card:hover {
          transform: scale(1.05);
        }
        .product-image {
          width: 100%;
          height: auto;
          border-radius: 5px;
          margin-bottom: 10px;
        }
        .product-info {
          text-align: left;
        }
        .brand {
          font-weight: bold;
          margin-bottom: 5px;
          color: #333;
        }
        .name {
          margin-bottom: 5px;
          color: #555;
        }
        .price-badge {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .price {
          font-weight: bold;
          color: #000;
          margin-right: 5px;
        }
      `}</style>
    </div>
  );
};

export default ProductList;
