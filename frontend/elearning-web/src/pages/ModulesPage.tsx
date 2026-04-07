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
  Badge,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { modulesApi } from "../api/modulesApi";
import { coursesApi } from "../api/coursesApi";
import { lessonsApi } from "../api/lessonsApi";
import { lessonProgressApi } from "../api/lessonProgressesApi";

import type { ModuleDto } from "../types/module";
import type { CourseDto } from "../types/course";
import type { LessonDto } from "../types/lesson";
import type { LessonProgressDto } from "../types/lessonProgress";

type ModuleUnlockInfo = {
  totalLessons: number;
  completedLessons: number;
  isUnlocked: boolean;
};

function CourseModulesPage() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();

  const [course, setCourse] = useState<CourseDto | null>(null);
  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [unlockByModuleId, setUnlockByModuleId] = useState<
    Record<number, ModuleUnlockInfo>
  >({});

  const parsedCourseId = useMemo(() => Number(courseId), [courseId]);

  useEffect(() => {
    const loadCourseAndModules = async () => {
      try {
        setLoading(true);
        setError(false);

        if (!parsedCourseId || Number.isNaN(parsedCourseId)) {
          setError(true);
          return;
        }

        const [courseResponse, modulesResponse] = await Promise.all([
          coursesApi.getCourse(parsedCourseId),
          modulesApi.getCourseModules(parsedCourseId),
        ]);

        setCourse(courseResponse.data ?? null);

        const allModules = modulesResponse.data ?? [];
        const activeModules = allModules.filter(
          (moduleItem) => moduleItem.isActive
        );

        setModules(activeModules);
      } catch (error) {
        console.error("Błąd ładowania modułów:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    void loadCourseAndModules();
  }, [parsedCourseId]);

  const sortedModules = useMemo(() => {
    return [...modules].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [modules]);

  const [myProgress, setMyProgress] = useState<LessonProgressDto[]>([]);
  const [progressLoading, setProgressLoading] = useState(true);

  useEffect(() => {
    const loadMyProgress = async () => {
      try {
        setProgressLoading(true);
        const res = await lessonProgressApi.getAll();
        setMyProgress(res.data ?? []);
      } catch (e) {
        console.error("Błąd ładowania lesson progress:", e);
        setMyProgress([]);
      } finally {
        setProgressLoading(false);
      }
    };

    void loadMyProgress();
  }, []);

  const progressByLessonId = useMemo(() => {
    const map = new Map<number, number>();
    for (const progress of myProgress) {
      if (!progress.isActive) continue;
      map.set(progress.lessonId, Number(progress.progressPercent));
    }
    return map;
  }, [myProgress]);

  // Dla każdego modułu pobieramy jego lekcje i liczymy czy odblokowany
  useEffect(() => {
    const computeUnlocks = async () => {
      if (sortedModules.length === 0) {
        setUnlockByModuleId({});
        return;
      }

      try {
        // pobieramy lekcje wszystkich modułów równolegle
        const results = await Promise.all(
          sortedModules.map(async (module) => {
            const res = await lessonsApi.getModuleLessons(module.id);
            const allLessons: LessonDto[] = res.data ?? [];
            const activeLessons = allLessons.filter(
              (lesson) => lesson.isActive
            );

            const total = activeLessons.length;

            const completed = activeLessons.filter((lesson) => {
              const percent = progressByLessonId.get(lesson.id) ?? 0;
              return percent >= 100;
            }).length;

            const unlocked = total > 0 && completed === total;

            return {
              moduleId: module.id,
              info: {
                totalLessons: total,
                completedLessons: completed,
                isUnlocked: unlocked,
              },
            };
          })
        );

        const next: Record<number, ModuleUnlockInfo> = {};
        for (const r of results) {
          next[r.moduleId] = r.info;
        }
        setUnlockByModuleId(next);
      } catch (e) {
        console.error("Błąd liczenia unlocków modułów:", e);
        const fallback: Record<number, ModuleUnlockInfo> = {};
        for (const module of sortedModules) {
          fallback[module.id] = {
            totalLessons: 0,
            completedLessons: 0,
            isUnlocked: false,
          };
        }
        setUnlockByModuleId(fallback);
      }
    };

    if (!progressLoading) {
      void computeUnlocks();
    }
  }, [sortedModules, progressByLessonId, progressLoading]);

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" align="start" mb={6}>
        <Box>
          <Heading>Moduły</Heading>
          <Text color="gray.400" mt={2}>
            {course?.title ?? "Kurs"}
          </Text>
        </Box>

        <Button
          size="sm"
          variant="ghost"
          _hover={{ bg: "yellow.100" }}
          onClick={() => navigate("/my-courses")}
        >
          ← Wróć do moich kursów
        </Button>
      </HStack>

      {(loading || progressLoading) && (
        <HStack py={10} justify="center">
          <Spinner size="lg" />
          <Text color="gray.500">Ładowanie modułów...</Text>
        </HStack>
      )}

      {error && (
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          <AlertTitle>Błąd ładowania modułów.</AlertTitle>
        </Alert>
      )}

      {!loading && !error && sortedModules.length === 0 && (
        <Text color="gray.400">Brak modułów w tym kursie.</Text>
      )}

      {!loading && !error && sortedModules.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {sortedModules.map((moduleItem) => {
            const unlockInfo = unlockByModuleId[moduleItem.id];
            const total = unlockInfo?.totalLessons ?? 0;
            const completed = unlockInfo?.completedLessons ?? 0;
            const isUnlocked = unlockInfo?.isUnlocked ?? false;

            return (
              <Stat
                key={moduleItem.id}
                bg="gray.800"
                p={6}
                borderRadius="xl"
                boxShadow="md"
                transition="0.15s"
                _hover={{ transform: "translateY(-3px)", boxShadow: "lg" }}
              >
                <VStack align="start" spacing={3}>
                  <HStack justify="space-between" w="full" align="start">
                    <StatLabel
                      fontSize="lg"
                      fontWeight="bold"
                      color="white"
                      noOfLines={2}
                    >
                      {moduleItem.title}
                    </StatLabel>

                    <Badge
                      colorScheme="yellow"
                      variant="subtle"
                      borderRadius="full"
                      px={2}
                    >
                      #{moduleItem.orderIndex}
                    </Badge>
                  </HStack>

                  <StatHelpText color="gray.300" noOfLines={4}>
                    {moduleItem.description ?? "Brak opisu modułu"}
                  </StatHelpText>

                  <StatHelpText color="gray.400">
                    Lekcje ukończone:{" "}
                    <b>{total === 0 ? "—" : `${completed}/${total}`}</b>
                    <br />
                    Quiz:{" "}
                    <b>{isUnlocked ? "Odblokowany ✅" : "Zablokowany 🔒"}</b>
                  </StatHelpText>

                  <Button
                    mt={2}
                    size="sm"
                    bg="yellow.400"
                    color="black"
                    fontWeight="bold"
                    borderRadius="full"
                    _hover={{ bg: "yellow.300" }}
                    onClick={() =>
                      navigate(`/modules/${moduleItem.id}/lessons`)
                    }
                  >
                    Otwórz moduł →
                  </Button>

                  <Button
                    mt={2}
                    size="sm"
                    bg="yellow.400"
                    color="black"
                    fontWeight="bold"
                    borderRadius="full"
                    _hover={{ bg: "yellow.300" }}
                    isDisabled={!isUnlocked}
                    onClick={() => navigate(`/modules/${moduleItem.id}/quiz`)}
                  >
                    Zdaj quiz kończący moduł →
                  </Button>

                  {!isUnlocked && total > 0 && (
                    <Text fontSize="sm" color="gray.400">
                      Ukończ wszystkie lekcje na <b>100%</b>, aby odblokować
                      quiz.
                    </Text>
                  )}

                  {total === 0 && (
                    <Text fontSize="sm" color="gray.400">
                      Brak lekcji w module — quiz pozostaje zablokowany.
                    </Text>
                  )}
                </VStack>
              </Stat>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default CourseModulesPage;
