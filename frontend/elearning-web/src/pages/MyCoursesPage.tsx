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
  Divider,
  Image,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { coursesApi } from "../api/coursesApi";
import { userCourseEnrollmentsApi } from "../api/userCourseEnrollmentsApi";
import { userCourseAccessesApi } from "../api/userCourseAccessesApi";
import { quizzesApi } from "../api/quizzesApi";
import { modulesApi } from "../api/modulesApi";
import { issuedCertificatesApi } from "../api/issuedCertificatesApi";

import type { CourseDto } from "../types/course";
import type { UserCourseAccessDto } from "../types/userCourseAccess";
import type { UserCourseEnrollmentDto } from "../types/userCourseEnrollment";
import type { ModuleDto } from "../types/module";
import type { QuizDto } from "../types/quiz";

function MyCoursesPage() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [userCourseAccesses, setUserCourseAccesses] = useState<
    UserCourseAccessDto[]
  >([]);
  const [userCourseEnrollments, setUserCourseEnrollments] = useState<
    UserCourseEnrollmentDto[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [updatingEnrollmentId, setUpdatingEnrollmentId] = useState<
    number | null
  >(null);

  const [passedByCourseId, setPassedByCourseId] = useState<
    Record<number, boolean | null>
  >({});

  useEffect(() => {
    const loadMyCourses = async () => {
      try {
        setLoading(true);
        setError(false);

        const [coursesResponse, accessesResponse, enrollmentsResponse] =
          await Promise.all([
            coursesApi.getCourses(),
            userCourseAccessesApi.getMyUserCourseAccesses(),
            userCourseEnrollmentsApi.getMyUserCourseEnrollments(),
          ]);

        const loadedCourses = coursesResponse.data ?? [];
        const loadedAccesses = accessesResponse.data ?? [];
        const loadedEnrollments = enrollmentsResponse.data ?? [];

        setCourses(loadedCourses);
        setUserCourseAccesses(loadedAccesses);
        setUserCourseEnrollments(loadedEnrollments);

        const activeCourseIds = loadedEnrollments
          .filter(
            (enrollment) =>
              enrollment.isActive && enrollment.status !== "Completed"
          )
          .map((enrollment) => enrollment.courseId);

        const initialMap: Record<number, boolean | null> = {};
        for (const courseId of activeCourseIds) initialMap[courseId] = null;
        setPassedByCourseId(initialMap);

        await Promise.all(
          activeCourseIds.map(async (courseId) => {
            try {
              // pobierz moduły kursu (modulesApi)
              const modulesRes = await modulesApi.getCourseModules(courseId);
              const modules = (modulesRes.data ?? []).filter(
                (item: ModuleDto) => item.isActive
              );

              if (modules.length === 0) {
                setPassedByCourseId((prev) => ({ ...prev, [courseId]: false }));
                return;
              }

              const finalModule = [...modules].sort(
                (a, b) => a.orderIndex - b.orderIndex
              )[modules.length - 1];

              const quizRes = await quizzesApi.getModuleQuiz(finalModule.id);
              const quiz: QuizDto | null = quizRes.data ?? null;

              const passed = Boolean((quiz as any)?.studentPassed);

              setPassedByCourseId((prev) => ({ ...prev, [courseId]: passed }));
            } catch (e) {
              console.error("[MyCoursesPage] Final quiz check error:", {
                courseId,
                e,
              });
              // blokujemy "Ukończ"
              setPassedByCourseId((prev) => ({ ...prev, [courseId]: false }));
            }
          })
        );
      } catch (error) {
        console.error("Błąd ładowania moich kursów:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    void loadMyCourses();
  }, []);

  const courseById = useMemo(() => {
    const map = new Map<number, CourseDto>();
    for (const course of courses) {
      map.set(course.id, course);
    }
    return map;
  }, [courses]);

  const accessByCourseId = useMemo(() => {
    const map = new Map<number, UserCourseAccessDto>();
    for (const access of userCourseAccesses) {
      if (access.isActive) {
        map.set(access.courseId, access);
      }
    }
    return map;
  }, [userCourseAccesses]);

  const hasValidAccessToCourse = (access: UserCourseAccessDto | null) => {
    if (!access) return false;
    if (!access.isActive) return false;
    if (access.isRevoked) return false;

    const now = new Date();
    const accessStartDate = new Date(access.accessStart);

    if (accessStartDate > now) return false;

    if (access.accessEnd) {
      const accessEndDate = new Date(access.accessEnd);
      if (accessEndDate < now) return false;
    }

    return true;
  };

  const getThumbSrc = (course: CourseDto | null) => {
    if (!course?.thumbnailUrl) return null;
    return course.thumbnailUrl.startsWith("/")
      ? `${API_BASE_URL}${course.thumbnailUrl}`
      : course.thumbnailUrl;
  };

  const activeEnrollmentItems = useMemo(() => {
    return userCourseEnrollments
      .filter(
        (enrollment) => enrollment.isActive && enrollment.status !== "Completed"
      )
      .map((enrollment) => {
        const course = courseById.get(enrollment.courseId) ?? null;
        const access = accessByCourseId.get(enrollment.courseId) ?? null;
        return { enrollment, course, access };
      });
  }, [userCourseEnrollments, courseById, accessByCourseId]);

  const completedEnrollmentItems = useMemo(() => {
    return userCourseEnrollments
      .filter(
        (enrollment) => enrollment.isActive && enrollment.status === "Completed"
      )
      .map((enrollment) => {
        const course = courseById.get(enrollment.courseId) ?? null;
        const access = accessByCourseId.get(enrollment.courseId) ?? null;
        return { enrollment, course, access };
      });
  }, [userCourseEnrollments, courseById, accessByCourseId]);

  const markEnrollmentAsCompleted = async (
    enrollment: UserCourseEnrollmentDto
  ) => {
    try {
      setUpdatingEnrollmentId(enrollment.id);

      await userCourseEnrollmentsApi.completeMyUserCourseEnrollment(
        enrollment.id
      );

      setUserCourseEnrollments((previous) =>
        previous.map((item) =>
          item.id === enrollment.id
            ? {
                ...item,
                status: "Completed",
                completedAt: new Date().toISOString(),
              }
            : item
        )
      );
    } catch (error) {
      console.error("Błąd oznaczania kursu jako ukończony:", error);
      setError(true);
    } finally {
      setUpdatingEnrollmentId(null);
    }
  };

  const handleDownloadCertificate = async (courseId: number) => {
    try {
      const res = await issuedCertificatesApi.downloadForCourse(courseId);

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-course-${courseId}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download certificate error:", e);
      setError(true);
    }
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <Heading mb={6}>Moje kursy</Heading>

      {loading && (
        <HStack py={10} justify="center">
          <Spinner size="lg" />
          <Text color="gray.500">Ładowanie...</Text>
        </HStack>
      )}

      {error && (
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          <AlertTitle>Błąd ładowania moich kursów.</AlertTitle>
        </Alert>
      )}

      {!loading &&
        !error &&
        activeEnrollmentItems.length === 0 &&
        completedEnrollmentItems.length === 0 && (
          <Text color="gray.400">Nie masz jeszcze żadnych kursów.</Text>
        )}

      {!loading && !error && (
        <>
          <Heading size="md" mb={4}>
            Aktywne
          </Heading>

          {activeEnrollmentItems.length === 0 ? (
            <Text color="gray.400" mb={8}>
              Brak aktywnych kursów.
            </Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={10}>
              {activeEnrollmentItems.map(({ enrollment, course, access }) => {
                const hasAccess = hasValidAccessToCourse(access);
                const thumbSrc = getThumbSrc(course);

                const passedState = passedByCourseId[enrollment.courseId];
                const isCheckingPassed = passedState == null;
                const hasPassedFinalQuiz = passedState === true;

                const canComplete =
                  hasAccess && !isCheckingPassed && hasPassedFinalQuiz;

                return (
                  <Stat
                    key={enrollment.id}
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
                        alt={course?.title ?? "Course thumbnail"}
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
                          {course?.title ?? `Kurs ID: ${enrollment.courseId}`}
                        </StatLabel>

                        <StatHelpText color="gray.300">
                          Status: <b>{enrollment.status}</b>
                        </StatHelpText>

                        <StatHelpText color="gray.400">
                          Dostęp od:{" "}
                          {access?.accessStart
                            ? new Date(access.accessStart).toLocaleString(
                                "pl-PL"
                              )
                            : "—"}
                          <br />
                          Dostęp do:{" "}
                          {access?.accessEnd
                            ? new Date(access.accessEnd).toLocaleString("pl-PL")
                            : "bez limitu"}
                        </StatHelpText>

                        <HStack spacing={3}>
                          <Button
                            mt={2}
                            size="sm"
                            bg="yellow.400"
                            color="black"
                            fontWeight="bold"
                            borderRadius="full"
                            _hover={{ bg: "yellow.300" }}
                            onClick={() =>
                              navigate(
                                `/courses/${enrollment.courseId}/modules`
                              )
                            }
                          >
                            Przejdź do kursu →
                          </Button>

                          <Button
                            mt={2}
                            size="sm"
                            bg="yellow.400"
                            color="black"
                            fontWeight="bold"
                            borderRadius="full"
                            _hover={{ bg: "yellow.300" }}
                            isLoading={updatingEnrollmentId === enrollment.id}
                            loadingText="Zapisywanie..."
                            isDisabled={!canComplete}
                            onClick={() =>
                              markEnrollmentAsCompleted(enrollment)
                            }
                          >
                            Ukończ
                          </Button>
                        </HStack>

                        {!hasAccess && (
                          <Text fontSize="sm" color="red.300">
                            Dostęp wygasł lub został cofnięty.
                          </Text>
                        )}

                        {hasAccess && isCheckingPassed && (
                          <Text fontSize="sm" color="gray.400">
                            Sprawdzam, czy zdałeś quiz końcowy...
                          </Text>
                        )}

                        {hasAccess &&
                          !isCheckingPassed &&
                          !hasPassedFinalQuiz && (
                            <Text fontSize="sm" color="yellow.300">
                              Aby ukończyć kurs, zdaj quiz z ostatniego modułu.
                            </Text>
                          )}
                      </VStack>
                    </Box>
                  </Stat>
                );
              })}
            </SimpleGrid>
          )}

          <Divider borderColor="gray.700" mb={8} />

          <Heading size="md" mb={4}>
            Ukończone
          </Heading>

          {completedEnrollmentItems.length === 0 ? (
            <Text color="gray.400">Brak ukończonych kursów.</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {completedEnrollmentItems.map(
                ({ enrollment, course, access }) => {
                  const hasAccess = hasValidAccessToCourse(access);
                  const thumbSrc = getThumbSrc(course);

                  return (
                    <Stat
                      key={enrollment.id}
                      bg="gray.800"
                      p={0}
                      borderRadius="xl"
                      boxShadow="md"
                      overflow="hidden"
                      transition="0.15s"
                      _hover={{
                        transform: "translateY(-3px)",
                        boxShadow: "lg",
                      }}
                    >
                      {thumbSrc ? (
                        <Image
                          src={thumbSrc}
                          alt={course?.title ?? "Course thumbnail"}
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
                            {course?.title ?? `Kurs ID: ${enrollment.courseId}`}
                          </StatLabel>

                          <StatHelpText color="gray.300">
                            Status: <b>{enrollment.status}</b>
                          </StatHelpText>

                          <StatHelpText color="gray.400">
                            Ukończono:{" "}
                            {enrollment.completedAt
                              ? new Date(enrollment.completedAt).toLocaleString(
                                  "pl-PL"
                                )
                              : "—"}
                            <br />
                            Dostęp do:{" "}
                            {access?.accessEnd
                              ? new Date(access.accessEnd).toLocaleString(
                                  "pl-PL"
                                )
                              : "bez limitu"}
                          </StatHelpText>

                          <Button
                            size="sm"
                            variant="outline"
                            borderColor="yellow.400"
                            color="yellow.300"
                            _hover={{ bg: "yellow.400", color: "black" }}
                            isDisabled={!hasAccess}
                            onClick={() =>
                              handleDownloadCertificate(enrollment.courseId)
                            }
                          >
                            Pobierz certyfikat
                          </Button>

                          {!hasAccess && (
                            <Text fontSize="sm" color="red.300">
                              Dostęp wygasł lub został cofnięty.
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    </Stat>
                  );
                }
              )}
            </SimpleGrid>
          )}
        </>
      )}
    </Box>
  );
}

export default MyCoursesPage;
