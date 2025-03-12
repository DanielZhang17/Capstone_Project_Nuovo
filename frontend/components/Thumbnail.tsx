import { useState } from 'react';
import { Box, Flex, Image, IconButton } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

const Thumbnail = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const mainImageHeight = 480; // 80% of 600
  const mainImageWidth = 750;  // 80% of 800

  const handleLeftClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleRightClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <Box>
      {/* Main Image */}
      <Box mb="4" padding="2">
        <Image
          src={images[currentIndex]}
          alt="Selected Product"
          objectFit="contain"
          borderRadius="lg"
          w={`${mainImageWidth}px`}
          h={`${mainImageHeight}px`}
          transition="all 0.3s ease"
        />
      </Box>

      {/* Thumbnails only if more than one image */}
      {images.length > 1 && (
        <Flex justifyContent="center" alignItems="center">
          {/* Left Arrow */}
          <IconButton
            icon={<ChevronLeftIcon boxSize={8} color="gray.500" />}
            aria-label="Scroll left"
            variant="ghost"
            size="lg"
            mr={2}
            onClick={handleLeftClick}
          />

          {/* Thumbnails */}
          <Flex direction="row" gap="16px" alignItems="center">
            {images.map((img, index) => (
              <Image
                key={index}
                src={img}
                alt={`Thumbnail ${index + 1}`}
                width="80px"
                height="80px"
                objectFit="cover"
                cursor="pointer"
                border={currentIndex === index ? '1px solid #727272' : '1px solid #d8d8d8'}
                borderRadius="md"
                transition="all 0.3s ease"
                _hover={{
                  transform: 'scale(1.1)',
                  brightness: '110%',
                  border: '1px solid #727272',
                }}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </Flex>

          {/* Right Arrow */}
          <IconButton
            icon={<ChevronRightIcon boxSize={8} color="gray.500" />}
            aria-label="Scroll right"
            variant="ghost"
            size="lg"
            ml={2}
            onClick={handleRightClick}
          />
        </Flex>
      )}
    </Box>
  );
};

export default Thumbnail;