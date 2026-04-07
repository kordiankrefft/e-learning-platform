import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatHelpText,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  Spinner,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { courseCategoriesApi } from "../api/courseCategoriesApi";
import type { CourseCategoryDto } from "../types/courseCategory";

function CourseCategoriesPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<CourseCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await courseCategoriesApi.getCourseCategories();
        const data = response.data ?? [];

        setCategories(data.filter((item) => item.isActive));
      } catch (e) {
        console.error("Błąd ładowania kategorii:", e);
        setError("Błąd ładowania kategorii.");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <Heading mb={6}>Kategorie kursów</Heading>

      {loading && (
        <Box py={10} textAlign="center">
          <Spinner size="lg" />
        </Box>
      )}

      {error && (
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}

      {!loading && !error && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {categories.map((item) => (
            <Stat
              key={item.id}
              bg="gray.800"
              p={6}
              borderRadius="xl"
              boxShadow="md"
              transition="0.15s"
              _hover={{ transform: "translateY(-3px)", boxShadow: "lg" }}
            >
              <VStack align="start" spacing={3}>
                <StatLabel fontSize="lg" fontWeight="bold" color="white">
                  {item.name}
                </StatLabel>

                <StatHelpText color="gray.300" noOfLines={3}>
                  {item.description || "Brak opisu kategorii"}
                </StatHelpText>

                <Button
                  mt={2}
                  size="sm"
                  bg="yellow.400"
                  color="black"
                  fontWeight="bold"
                  borderRadius="full"
                  _hover={{ bg: "yellow.300" }}
                  onClick={() => navigate(`/categories/${item.id}/courses`)}
                >
                  Zobacz kursy →
                </Button>
              </VStack>
            </Stat>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default CourseCategoriesPage;
