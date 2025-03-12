'use client';
import { Box, Flex, Heading, FormControl, FormLabel, Input, Button, Textarea, useToast } from '@chakra-ui/react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, ChangeEvent } from 'react';
import Sidebar from '../../../../components/AdminSidebar';
import NavBar from '../../../../components/NavBar';
import useAuth from '../../../../hooks/useAuth';

export default function UpdateBrand() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [newLogo, setNewLogo] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const userRole = useAuth();
  const toast = useToast();
  const brandId = params.id;

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        const response = await fetch(`/api/brands/${brandId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch brand');
        const data = await response.json();
        setName(data.name);
        setDescription(data.description);
        setLogo(`data:image/jpeg;base64,${data.logo}`);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to load brand data',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchBrandData();
  }, [brandId, toast]);

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 1MB',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setNewLogo(result.split(',')[1]);
        setLogo(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    const bodyData: { name: string; description: string; logo?: string } = { name, description };
    if (newLogo) {
      bodyData.logo = newLogo;
    }
    const response = await fetch(`/api/admin/brands/${brandId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyData),
    });
    if (response.ok) {
      router.push('/admin/brands');
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update brand',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
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
          <Heading>Update Brand</Heading>
          <Box mt={6}>
            <form onSubmit={handleSubmit}>
              <FormControl isRequired mb={4}>
                <FormLabel>Brand Name</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter brand name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Enter brand description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Logo (optional)</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                {logo && <img src={logo} alt="Logo Preview" style={{ marginTop: '10px', maxHeight: '150px' }} />}
              </FormControl>

              <Flex gap={4}>
                <Button
                  bg="black"
                  color="white"
                  _hover={{ bg: 'gray.700' }}
                  type="submit"
                  isDisabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating Brand...' : 'Update Brand'}
                </Button>
                <Button
                  bg="black"
                  color="white"
                  _hover={{ bg: 'gray.700' }}
                  onClick={() => router.push('/admin/brands')}
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
