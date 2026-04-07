import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Heading,
  Text,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  Button,
  Stack,
  Badge,
  Divider,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { lessonsApi } from "../api/lessonsApi";
import type { LessonDto } from "../types/lesson";

function CourseLessonsPage() {
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();

  const [lessons, setLessons] = useState<LessonDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const parsedModuleId = useMemo(() => Number(moduleId), [moduleId]);

  useEffect(() => {
    const loadLessons = async () => {
      try {
        setLoading(true);
        setError(false);

        if (!parsedModuleId || Number.isNaN(parsedModuleId)) {
          setError(true);
          return;
        }

        const lessonsResponse = await lessonsApi.getModuleLessons(
          parsedModuleId
        );

        const allLessons = lessonsResponse.data ?? [];
        const activeLessons = allLessons.filter((lesson) => lesson.isActive);
        setLessons(activeLessons);
      } catch (error) {
        console.error("Błąd ładowania lekcji:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadLessons();
  }, [parsedModuleId]);

  const sortedLessons = useMemo(() => {
    return [...lessons].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [lessons]);

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" align="start" mb={6}>
        <Box>
          <Heading>Lekcje</Heading>
          <Text color="gray.400" mt={2}>
            Moduł #{Number.isFinite(parsedModuleId) ? parsedModuleId : "—"}
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
          <Text color="gray.500">Ładowanie lekcji...</Text>
        </HStack>
      )}

      {error && (
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          <AlertTitle>Błąd ładowania lekcji.</AlertTitle>
        </Alert>
      )}

      {!loading && !error && sortedLessons.length === 0 && (
        <Text color="gray.400">Brak lekcji w tym module.</Text>
      )}

      {!loading && !error && sortedLessons.length > 0 && (
        <Stack spacing={3}>
          {sortedLessons.map((lesson) => (
            <Box
              key={lesson.id}
              bg="gray.800"
              borderRadius="xl"
              p={5}
              boxShadow="md"
              transition="0.15s"
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
            >
              <HStack justify="space-between" align="start" spacing={4}>
                <HStack spacing={4} align="start">
                  <Badge
                    colorScheme="yellow"
                    variant="subtle"
                    borderRadius="full"
                    px={3}
                    mt={1}
                  >
                    {lesson.orderIndex}
                  </Badge>

                  <Box>
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      color="white"
                      noOfLines={2}
                    >
                      {lesson.title}
                    </Text>

                    <Text color="gray.300" mt={1} noOfLines={2}>
                      {lesson.summary ?? "Brak opisu lekcji"}
                    </Text>

                    <HStack spacing={3} mt={3} wrap="wrap">
                      <Text fontSize="sm" color="gray.400">
                        Status: <b>{lesson.status}</b>
                      </Text>

                      <Divider
                        orientation="vertical"
                        height="14px"
                        borderColor="gray.600"
                      />

                      <Text fontSize="sm" color="gray.400">
                        Szacowany czas ukończenia:{" "}
                        <b>
                          {lesson.estimatedMinutes
                            ? `${lesson.estimatedMinutes} min`
                            : "—"}
                        </b>
                      </Text>
                    </HStack>
                  </Box>
                </HStack>

                <Button
                  size="sm"
                  bg="yellow.400"
                  color="black"
                  fontWeight="bold"
                  borderRadius="full"
                  _hover={{ bg: "yellow.300" }}
                  onClick={() => navigate(`/lessons/${lesson.id}`)}
                >
                  Otwórz →
                </Button>
              </HStack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default CourseLessonsPage;
