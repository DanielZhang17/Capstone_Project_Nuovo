"use client";
import { HiOutlineBell, HiOutlineHeart, HiOutlineUser } from "react-icons/hi2";
import { categories, TopLevelCategory } from '../constants/categoriesData';
import { Box, Flex, Text, Icon, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import DropdownMenu from "./DropdownMenu";

const NavBar: React.FC = () => {
  const router = useRouter();
  const [hoveredTopLevelCategory, setHoveredTopLevelCategory] = useState<TopLevelCategory | null>(null);
  const userRole = useAuth();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userRole) {  // Fetch only if the user is logged in
        setLoading(true);
        try {
          const token = localStorage.getItem("token"); // Assumes token is stored in local storage
          const response = await fetch("/api/user/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUserName(data.name); // Assuming the API returns the user's name as 'name'
          } else {
            console.error("Failed to fetch user profile information");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [userRole]);

  return (
    <Box as="nav" bg="white" boxShadow="sm" position="relative" zIndex="100" width="100%">
      
      {/* Logo */}
      <Flex align="center" fontSize="sm" gap="6" color="gray.600" justify="center" height="100px" p="4">
        <Box onClick={() => router.push('/')} cursor="pointer">
          <Text fontSize="3xl" fontWeight="extrabold" color="black">
            NUOVO
          </Text>
        </Box>
      </Flex>

      {/* Top level categories */}
      <Flex align="center" justify="space-between" p="2">
        <Flex align="center" gap="6" onMouseLeave={() => setHoveredTopLevelCategory(null)}>
          {Object.keys(categories).map((topLevel) => (
            <Box 
              key={topLevel} 
              onMouseEnter={() => setHoveredTopLevelCategory(topLevel as TopLevelCategory)} 
              p="4"
              cursor="pointer"
            >
              <Text fontWeight="medium">{topLevel}</Text>
            </Box>
          ))}
        </Flex>

        {/* Dropdown Menu with clickable routes */}
        {hoveredTopLevelCategory && categories[hoveredTopLevelCategory] && (
          <Box 
            position="absolute" 
            top="100%" 
            left="0" 
            width="100vw" 
            mt="-10px" 
            onMouseEnter={() => setHoveredTopLevelCategory(hoveredTopLevelCategory)} 
            onMouseLeave={() => setHoveredTopLevelCategory(null)}
          >
            <DropdownMenu primaryCategories={categories[hoveredTopLevelCategory]} />
          </Box>
        )}

        {/* Icons for Logged Out, User, Admin */}
        <Flex align="center" gap="4">
          {/* Loading Spinner while fetching user profile */}
          {loading && <Spinner size="sm" color="gray.500" />}

          {/* Logged out */} 
          {!userRole && !loading && (
            <>
              <Icon as={HiOutlineUser} fontSize="25px" cursor="pointer" onClick={() => router.push("/login")} />
              <Icon as={HiOutlineBell} fontSize="25px" cursor="pointer" onClick={() => router.push("/login")} />
              <Icon as={HiOutlineHeart} fontSize="25px" cursor="pointer" onClick={() => router.push("/login")} />
            </>
          )}

          {/* Logged in as User */}
          {userRole === "user" && !loading && (
            <>
              <Flex align="center" cursor="pointer" onClick={() => router.push("/profile/account-details-summary")}>
                <Icon as={HiOutlineUser} fontSize="25px" />
                {userName && (
                  <Text fontSize="md" ml="2" color="gray.600" fontWeight="medium">
                    {userName}
                  </Text>
                )}
              </Flex>
              <Icon as={HiOutlineBell} fontSize="25px" cursor="pointer" onClick={() => router.push("/profile/notification")} />
              <Icon as={HiOutlineHeart} fontSize="25px" cursor="pointer" onClick={() => router.push("/profile/wishlist")} />
            </>
          )}

          {/* Logged in as Admin */}
          {userRole === "admin" && !loading && (
            <>
              <Flex align="center" cursor="pointer" onClick={() => router.push("/admin/account")}>
                <Icon as={HiOutlineUser} fontSize="25px" />
                {userName && (
                  <Text fontSize="md" ml="2" color="gray.600" fontWeight="medium">
                    {userName}
                  </Text>
                )}
              </Flex>
              <Icon as={HiOutlineBell} fontSize="25px" cursor="pointer" onClick={() => router.push("/admin/brands")} />
              <Icon as={HiOutlineHeart} fontSize="25px" cursor="pointer" onClick={() => router.push("/admin/products")} />
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default NavBar;
