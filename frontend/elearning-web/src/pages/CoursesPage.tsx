import { useEffect, useMemo, useState } from "react";
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Image,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { coursesApi } from "../api/coursesApi";
import type { CourseDto } from "../types/course";

function CoursesByCategoryPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseDto | null>(null);

  const parsedCategoryId = useMemo(() => Number(categoryId), [categoryId]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await coursesApi.getCourses();
        const allCourses = response.data ?? [];

        const filteredCourses = allCourses.filter(
          (course) =>
            course.isActive && course.courseCategoryId === parsedCategoryId
        );

        setCourses(filteredCourses);
      } catch (err) {
        console.error("Błąd ładowania kursów:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [parsedCategoryId]);

  const getThumbSrc = (course: CourseDto) => {
    const url = (course as any).thumbnailUrl as string | undefined | null;
    if (!url) return null;

    return url.startsWith("/") ? `${API_BASE_URL}${url}` : url;
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6}>
        <Heading>Kursy</Heading>
        <Button
          size="sm"
          variant="ghost"
          _hover={{ bg: "yellow.100" }}
          onClick={() => navigate("/categories")}
        >
          ← Wróć do kategorii
        </Button>
      </HStack>

      {loading && (
        <HStack py={10} justify="center">
          <Spinner size="lg" />
          <Text color="gray.500">Ładowanie kursów...</Text>
        </HStack>
      )}

      {error && (
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          <AlertTitle>Błąd ładowania kursów.</AlertTitle>
        </Alert>
      )}

      {!loading && !error && courses.length === 0 && (
        <Text color="gray.400">Brak kursów w tej kategorii.</Text>
      )}

      {/* Lista kursów */}
      {!loading && !error && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {courses.map((course) => {
            const thumbSrc = getThumbSrc(course);

            return (
              <Stat
                key={course.id}
                bg="gray.800"
                p={0}
                borderRadius="xl"
                boxShadow="md"
                overflow="hidden"
                transition="0.15s"
                _hover={{ transform: "translateY(-3px)", boxShadow: "lg" }}
              >
                {thumbSrc ? (
                  <Image
                    src={thumbSrc}
                    alt={course.title}
                    h="140px"
                    w="100%"
                    objectFit="cover"
                  />
                ) : (
                  <Box h="140px" w="100%" bg="gray.700" />
                )}

                <Box p={6}>
                  <VStack align="start" spacing={3}>
                    <StatLabel
                      fontSize="lg"
                      fontWeight="bold"
                      color="white"
                      noOfLines={2}
                    >
                      {course.title}
                    </StatLabel>

                    <StatHelpText color="gray.300" noOfLines={3}>
                      {course.shortDescription || "Brak krótkiego opisu kursu"}
                    </StatHelpText>

                    <Button
                      size="sm"
                      variant="link"
                      color="yellow.300"
                      _hover={{ color: "yellow.200" }}
                      onClick={() => setSelectedCourse(course)}
                    >
                      Czytaj więcej
                    </Button>

                    <StatHelpText color="gray.400">
                      Poziom: {course.difficultyLevel || "—"} <br />
                      Status: {course.status}
                    </StatHelpText>

                    <Button
                      mt={2}
                      size="sm"
                      bg="yellow.400"
                      color="black"
                      fontWeight="bold"
                      borderRadius="full"
                      _hover={{ bg: "yellow.300" }}
                      onClick={() => navigate(`/courses/${course.id}/pricing`)}
                    >
                      Wykup kurs →
                    </Button>
                  </VStack>
                </Box>
              </Stat>
            );
          })}
        </SimpleGrid>
      )}

      <Modal
        isOpen={selectedCourse !== null}
        onClose={() => setSelectedCourse(null)}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent bg="gray.900" color="white" borderRadius="xl">
          <ModalHeader>{selectedCourse?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text color="gray.300" whiteSpace="pre-wrap">
              {selectedCourse?.longDescription?.trim()
                ? selectedCourse.longDescription
                : "Brak długiego opisu kursu."}
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default CoursesByCategoryPage;
