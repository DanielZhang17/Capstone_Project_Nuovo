import { Box, Flex, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

interface Subcategory {
  name: string;
  route: string;
}

interface PrimaryCategory {
  route: string;
  items: Subcategory[];
}

interface DropdownMenuProps {
  primaryCategories: Record<string, PrimaryCategory>;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ primaryCategories }) => {
  const router = useRouter();

  const navigate = (path: string) => {
    router.push(path);
  };

  return (
    <Box bg="white" boxShadow="md" p="4" width="100vw">
      <Flex justify="flex-start" flexWrap="wrap" pl="12">
        {Object.entries(primaryCategories).map(([primaryName, primaryCategory]) => (
          <Box key={primaryName} mb="3" mr="120">
            <Text
              fontWeight="semibold"
              mb="2"
              cursor="pointer"
              onClick={() => navigate(primaryCategory.route)}
              _hover={{ textDecoration: "underline", color: "blue.500" }}
            >
              {primaryName}
            </Text>
            <Flex direction="column">
              {primaryCategory.items.map((subcat) => (
                <Text
                  key={subcat.route}
                  cursor="pointer"
                  onClick={() => navigate(`${primaryCategory.route}/${subcat.route}`)}
                  _hover={{ textDecoration: "underline", color: "blue.500" }}
                >
                  {subcat.name}
                </Text>
              ))}
            </Flex>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default DropdownMenu;
