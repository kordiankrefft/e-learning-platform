import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatHelpText,
  Button,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  Spinner,
  HStack,
  Text,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { coursesApi } from "../api/coursesApi";
import { coursePricingPlansApi } from "../api/coursePricingPlansApi";
import { userCourseEnrollmentsApi } from "../api/userCourseEnrollmentsApi";
import { userCourseAccessesApi } from "../api/userCourseAccessesApi";
import { useAuth } from "../context/AuthContext";
import type { CourseDto } from "../types/course";
import type { CoursePricingPlanDto } from "../types/coursePricingPlan";

function CoursePricingPage() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();

  const { isAuthenticated, hasRole } = useAuth();

  const [course, setCourse] = useState<CourseDto | null>(null);
  const [pricingPlans, setPricingPlans] = useState<CoursePricingPlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState(false);

  useEffect(() => {
    const loadCourseAndPricingPlans = async () => {
      try {
        setLoading(true);
        setError(false);

        const parsedCourseId = Number(courseId);

        const courseResponse = await coursesApi.getCourse(parsedCourseId);
        setCourse(courseResponse.data);

        const pricingPlansResponse =
          await coursePricingPlansApi.getCoursePricingPlans();

        const allPricingPlans = pricingPlansResponse.data ?? [];

        const filteredPricingPlans = allPricingPlans.filter(
          (pricingPlan) =>
            pricingPlan.isActive && pricingPlan.courseId === parsedCourseId
        );

        setPricingPlans(filteredPricingPlans);
      } catch (error) {
        console.error("Błąd ładowania planów cenowych:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadCourseAndPricingPlans();
  }, [courseId]);

  const handleSelectPricingPlan = async (pricingPlanId: number) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!hasRole("Student")) {
      setPurchaseError(true);
      return;
    }

    try {
      setPurchaseLoading(true);
      setPurchaseError(false);

      const parsedCourseId = Number(courseId);

      await userCourseEnrollmentsApi.createUserCourseEnrollment({
        courseId: parsedCourseId,
        status: "Active",
      });

      await userCourseAccessesApi.createUserCourseAccess({
        courseId: parsedCourseId,
        coursePricingPlanId: pricingPlanId,
      });

      navigate("/my-courses");
    } catch (error) {
      console.error("Błąd podczas wykupu kursu:", error);
      setPurchaseError(true);
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6}>
        <Box>
          <Heading>Plany cenowe</Heading>
          <Text color="gray.400" mt={2}>
            {course?.title || "Kurs"}
          </Text>
        </Box>

        <Button
          size="sm"
          variant="ghost"
          _hover={{ bg: "yellow.100" }}
          onClick={() => navigate(-1)}
        >
          ← Wróć
        </Button>
      </HStack>

      {loading && (
        <HStack py={10} justify="center">
          <Spinner size="lg" />
          <Text color="gray.500">Ładowanie planów...</Text>
        </HStack>
      )}

      {error && (
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          <AlertTitle>Błąd ładowania planów cenowych.</AlertTitle>
        </Alert>
      )}

      {purchaseError && (
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          <AlertTitle>
            Nie udało się wykupić kursu (wymagana rola - Student).
          </AlertTitle>
        </Alert>
      )}

      {!loading && !error && pricingPlans.length === 0 && (
        <Text color="gray.400">Brak planów cenowych dla tego kursu.</Text>
      )}

      {!loading && !error && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {pricingPlans.map((pricingPlan) => (
            <Stat
              key={pricingPlan.id}
              bg="gray.800"
              p={6}
              borderRadius="xl"
              boxShadow="md"
              transition="0.15s"
              _hover={{ transform: "translateY(-3px)", boxShadow: "lg" }}
            >
              <VStack align="start" spacing={3}>
                <StatLabel fontSize="lg" fontWeight="bold" color="white">
                  {pricingPlan.name}
                </StatLabel>

                <StatHelpText color="gray.300" noOfLines={4}>
                  {pricingPlan.description || "Brak opisu planu"}
                </StatHelpText>

                <StatHelpText color="gray.400">
                  Dostęp:{" "}
                  {pricingPlan.accessDurationDays
                    ? `${pricingPlan.accessDurationDays} dni`
                    : "bez limitu"}
                </StatHelpText>

                <Button
                  mt={2}
                  size="sm"
                  bg="yellow.400"
                  color="black"
                  fontWeight="bold"
                  borderRadius="full"
                  _hover={{ bg: "yellow.300" }}
                  isLoading={purchaseLoading}
                  loadingText="Przetwarzanie..."
                  onClick={() => handleSelectPricingPlan(pricingPlan.id)}
                >
                  Wybierz plan →
                </Button>
              </VStack>
            </Stat>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default CoursePricingPage;
