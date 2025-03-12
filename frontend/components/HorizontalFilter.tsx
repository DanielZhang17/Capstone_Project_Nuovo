'use client';

import { FC } from 'react';
import { FaCheck } from 'react-icons/fa';
import { useColorMode } from '@chakra-ui/react';

interface HorizontalFilterProps {
  selectedSort: string;
  setSelectedSort: (value: string) => void;
}

const HorizontalFilter: FC<HorizontalFilterProps> = ({ selectedSort, setSelectedSort }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  return (
    <div className="horizontal-filter">
      <button
        className={`${selectedSort === 'new' ? 'active' : ''} ${isDarkMode ? 'dark-mode' : ''}`}
        onClick={() => setSelectedSort('new')}
      >
        {selectedSort === 'new' && <FaCheck className="icon" />} Edited time
      </button>
      <button
        className={`${selectedSort === 'price_asc' ? 'active' : ''} ${isDarkMode ? 'dark-mode' : ''}`}
        onClick={() => setSelectedSort('price_asc')}
      >
        {selectedSort === 'price_asc' && <FaCheck className="icon" />} Price Ascending
      </button>
      <button
        className={`${selectedSort === 'price_desc' ? 'active' : ''} ${isDarkMode ? 'dark-mode' : ''}`}
        onClick={() => setSelectedSort('price_desc')}
      >
        {selectedSort === 'price_desc' && <FaCheck className="icon" />} Price Descending
      </button>
      <button
        className={`${selectedSort === 'rating' ? 'active' : ''} ${isDarkMode ? 'dark-mode' : ''}`}
        onClick={() => setSelectedSort('rating')}
      >
        {selectedSort === 'rating' && <FaCheck className="icon" />} Popularity
      </button>

      <style jsx>{`
        .horizontal-filter {
          display: flex;
          gap: 10px;
        }
        .horizontal-filter button {
          padding: 10px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s;
          background-color: #f0f0f0;
          color: #555;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .horizontal-filter button .icon {
          font-size: 12px;
        }
        .horizontal-filter button.active {
          background-color: #000;
          color: #fff;
        }
        .horizontal-filter button:hover {
          background-color: #e0e0e0;
        }
        
      `}</style>
    </div>
  );
};

export default HorizontalFilter;