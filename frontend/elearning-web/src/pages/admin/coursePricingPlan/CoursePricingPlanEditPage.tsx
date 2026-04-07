import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Stack,
  HStack,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
} from "@chakra-ui/react";

import { coursePricingPlansApi } from "../../../api/coursePricingPlansApi";
import { coursesApi } from "../../../api/coursesApi";

import type {
  CoursePricingPlanDto,
  CoursePricingPlanEditDto,
} from "../../../types/coursePricingPlan";
import type { CourseDto } from "../../../types/course";

export default function CoursePricingPlanEditPage() {
  const { id } = useParams();
  const planId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<CoursePricingPlanDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [courseId, setCourseId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [accessDurationDays, setAccessDurationDays] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesErr, setCoursesErr] = useState<string | null>(null);

  const selectedCourse = useMemo(() => {
    const id = Number(courseId);
    if (!id || Number.isNaN(id)) return null;
    return courses.find((c) => c.id === id) ?? null;
  }, [courseId, courses]);

  const load = async () => {
    if (!planId || Number.isNaN(planId)) {
      setError("Nieprawidłowe ID planu cenowego.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await coursePricingPlansApi.getCoursePricingPlan(planId);
      const data = res.data;

      setItem(data);

      setCourseId(String(data.courseId ?? ""));
      setName(data.name ?? "");
      setDescription(data.description ?? "");
      setAccessDurationDays(
        data.accessDurationDays != null ? String(data.accessDurationDays) : ""
      );
    } catch {
      setError("Nie udało się pobrać danych planu cenowego.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [planId]);

  useEffect(() => {
    const loadCourses = async () => {
      setCoursesErr(null);
      try {
        setCoursesLoading(true);
        const res = await coursesApi.getCourses();
        setCourses(res.data ?? []);
      } catch {
        setCoursesErr("Nie udało się pobrać listy kursów.");
        setCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };

    loadCourses();
  }, []);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!courseId.trim()) {
      setSaveErr("Kurs jest wymagany.");
      return;
    }
    if (!name.trim()) {
      setSaveErr("Nazwa jest wymagana.");
      return;
    }

    try {
      setSaving(true);

      const dto: CoursePricingPlanEditDto = {
        id: planId,
        courseId: Number(courseId),
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        accessDurationDays: accessDurationDays.trim()
          ? Number(accessDurationDays)
          : null,
      };

      await coursePricingPlansApi.editCoursePricingPlan(planId, dto);

      setSaveMsg("Zapisano zmiany.");
      await load();
    } catch {
      setSaveErr("Nie udało się zapisać zmian.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box maxW="5xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6}>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Wróć
        </Button>
      </HStack>

      <Heading mb={2}>Edytuj plan cenowy</Heading>
      <Text color="gray.400" mb={6}>
        Edycja danych planu cenowego kursu.
      </Text>

      {coursesErr && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {coursesErr}
        </Alert>
      )}

      {loading && (
        <Box py={10} textAlign="center">
          <Spinner size="lg" />
        </Box>
      )}

      {error && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!loading && !error && item && (
        <Box
          bg="gray.900"
          borderRadius="xl"
          p={{ base: 5, md: 6 }}
          boxShadow="lg"
        >
          <Stack spacing={5}>
            <HStack spacing={3} wrap="wrap">
              <Badge colorScheme="blue">ID: {item.id}</Badge>
              <Badge colorScheme={item.isActive ? "green" : "gray"}>
                {item.isActive ? "AKTYWNY" : "NIEAKTYWNY"}
              </Badge>

              {selectedCourse?.title && (
                <Badge colorScheme="purple">Kurs: {selectedCourse.title}</Badge>
              )}
            </HStack>

            <Divider borderColor="gray.700" />

            <Box>
              <Heading size="md" mb={3}>
                Dane
              </Heading>

              <Stack spacing={4}>
                <HStack spacing={4} flexWrap="wrap" align="start">
                  <FormControl maxW="420px" isDisabled={coursesLoading}>
                    <FormLabel>Kurs *</FormLabel>

                    {coursesLoading ? (
                      <HStack>
                        <Spinner size="sm" />
                        <Text color="gray.400">Ładowanie kursów...</Text>
                      </HStack>
                    ) : (
                      <Select
                        bg="gray.800"
                        borderColor="gray.700"
                        placeholder="Wybierz kurs..."
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                      >
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </Select>
                    )}
                  </FormControl>

                  <FormControl maxW="260px">
                    <FormLabel>Dostęp (dni)</FormLabel>
                    <Input
                      bg="gray.800"
                      borderColor="gray.700"
                      value={accessDurationDays}
                      onChange={(e) => setAccessDurationDays(e.target.value)}
                      inputMode="numeric"
                    />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Nazwa *</FormLabel>
                  <Input
                    bg="gray.800"
                    borderColor="gray.700"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Opis</FormLabel>
                  <Textarea
                    bg="gray.800"
                    borderColor="gray.700"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    minH="140px"
                    maxLength={500}
                  />
                </FormControl>

                <HStack spacing={3}>
                  <Button
                    colorScheme="yellow"
                    variant="outline"
                    onClick={save}
                    isLoading={saving}
                    isDisabled={coursesLoading || !!coursesErr}
                  >
                    Zapisz zmiany
                  </Button>
                </HStack>

                {saveMsg && <Box color="green.300">{saveMsg}</Box>}
                {saveErr && <Box color="red.300">{saveErr}</Box>}
              </Stack>
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
