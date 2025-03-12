'use client';
import { Box, Flex, Heading, Button, Input, Image, IconButton, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CloseIcon } from '@chakra-ui/icons';
import Sidebar from '../../../../components/AdminSidebar';
import NavBar from '../../../../components/NavBar';
import useAuth from '../../../../hooks/useAuth';

export default function ProductImages() {
  const toast = useToast();
  const userRole = useAuth();
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [images, setImages] = useState<string[]>([]);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [showInput, setShowInput] = useState(true);
  const [productName, setProductName] = useState<string>('');

  const fetchProductData = async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/products/${id}`);
      if (response.ok) {
        const product = await response.json();
        setImages(product.picture_urls || []);
        setProductName(product.name || '');
      } else {
        throw new Error("Failed to fetch images.");
      }
    } catch {
      toast({
        title: "Error Loading Images",
        description: "Could not load images for this product.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const handleImageUpload = async () => {
    if (newImage) {
      const formData = new FormData();
      formData.append('file', newImage);
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`/api/admin/products/${id}/upload_image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });

        if (response.ok) {
          setNewImage(null);
          toast({
            title: "Image Uploaded",
            description: "Your image has been uploaded successfully.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });

          await fetchProductData();
          setShowInput(false);
          setTimeout(() => setShowInput(true), 0);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed.");
        }
      } catch (error: any) {
        toast({
          title: "Upload Failed",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/admin/products/${id}/delete_image`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (response.ok) {
        toast({
          title: "Image Deleted",
          description: "Your image has been deleted successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        await fetchProductData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Deletion failed.");
      }
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (userRole !== 'admin') return null;

  return (
    <div>
      <NavBar />
      <Flex>
        <Sidebar />
        <Box ml="250px" p={8} width="100%">
          <Heading>Product Images</Heading>
          <Box mt={6}>
            Add up to 4 images for {productName}.
          </Box>
          <Box mt={6}>
            <Flex wrap="wrap" gap={4}>
              {images.map((url, index) => (
                <Box key={index} position="relative" boxSize="100px">
                  <Image src={url} alt={`Product image ${index + 1}`} boxSize="100px" />
                  <IconButton
                    icon={<CloseIcon />}
                    size="sm"
                    colorScheme="red"
                    position="absolute"
                    top="0"
                    right="0"
                    onClick={() => handleImageDelete(url)}
                    aria-label="Delete image"
                  />
                </Box>
              ))}
            </Flex>
            {showInput && (
              <Input 
                type="file" 
                onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setNewImage(e.target.files[0]);
                    }
                }} 
                mt={4} 
                mb={2}
              />
            )}
            <Flex gap={4} mt={4}>
              <Button 
                bg="black"
                color="white"
                _hover={{ bg: 'gray.700' }}
                onClick={handleImageUpload}
                isDisabled={images.length >= 4}
              >
                Upload Image
              </Button>
              <Button
                bg="black"
                color="white"
                _hover={{ bg: 'gray.700' }}
                onClick={() => router.push('/admin/products')}
              >
                Return to Products
              </Button>
            </Flex>
          </Box>
        </Box>
      </Flex>
    </div>
  );
}
