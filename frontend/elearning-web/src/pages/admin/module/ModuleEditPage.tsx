import { useEffect, useState } from "react";
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

import { modulesApi } from "../../../api/modulesApi";
import { coursesApi } from "../../../api/coursesApi";

import type { ModuleDto, ModuleEditDto } from "../../../types/module";
import type { CourseDto } from "../../../types/course";

export default function ModuleEditPage() {
  const { id } = useParams();
  const moduleId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<ModuleDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [orderIndex, setOrderIndex] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesErr, setCoursesErr] = useState<string | null>(null);

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

  const load = async () => {
    if (!moduleId || Number.isNaN(moduleId)) {
      setError("Nieprawidłowe ID modułu.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await modulesApi.getModule(moduleId);
      const data = res.data;

      setItem(data);

      setCourseId(String(data.courseId ?? ""));
      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setOrderIndex(String(data.orderIndex ?? 0));
    } catch {
      setError("Nie udało się pobrać danych modułu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [moduleId]);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!courseId.trim()) {
      setSaveErr("Kurs jest wymagany.");
      return;
    }
    if (!title.trim()) {
      setSaveErr("Tytuł jest wymagany.");
      return;
    }
    if (!orderIndex.trim()) {
      setSaveErr("Kolejność (orderIndex) jest wymagana.");
      return;
    }

    try {
      setSaving(true);

      const dto: ModuleEditDto = {
        id: moduleId,
        courseId: Number(courseId),
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        orderIndex: Number(orderIndex),
      };

      await modulesApi.editModule(moduleId, dto);

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

      <Heading mb={2}>Edytuj moduł</Heading>
      <Text color="gray.400" mb={6}>
        Edycja danych modułu.
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

              {item.courseTitle && (
                <Badge colorScheme="purple">Kurs: {item.courseTitle}</Badge>
              )}
            </HStack>

            <Divider borderColor="gray.700" />

            <Box>
              <Heading size="md" mb={3}>
                Dane
              </Heading>

              <Stack spacing={4}>
                <HStack spacing={4} flexWrap="wrap" align="start">
                  <FormControl maxW="520px" isDisabled={coursesLoading}>
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
                    <FormLabel>Kolejność *</FormLabel>
                    <Input
                      bg="gray.800"
                      borderColor="gray.700"
                      value={orderIndex}
                      onChange={(e) => setOrderIndex(e.target.value)}
                      inputMode="numeric"
                    />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Tytuł *</FormLabel>
                  <Input
                    bg="gray.800"
                    borderColor="gray.700"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Opis</FormLabel>
                  <Textarea
                    bg="gray.800"
                    borderColor="gray.700"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={1000}
                    minH="140px"
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
