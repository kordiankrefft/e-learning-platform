import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Text,
  Alert,
  AlertIcon,
  Stack,
  HStack,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Spinner,
  Badge,
} from "@chakra-ui/react";

import { modulesApi } from "../../../api/modulesApi";
import { coursesApi } from "../../../api/coursesApi";

import type { ModuleCreateDto } from "../../../types/module";
import type { CourseDto } from "../../../types/course";

export default function ModuleCreatePage() {
  const navigate = useNavigate();

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

  const selectedCourse = useMemo(() => {
    const id = Number(courseId);
    if (!id || Number.isNaN(id)) return null;
    return courses.find((c) => c.id === id) ?? null;
  }, [courseId, courses]);

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

      const dto: ModuleCreateDto = {
        courseId: Number(courseId),
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        orderIndex: Number(orderIndex),
      };

      await modulesApi.createModule(dto);

      setSaveMsg("Utworzono moduł.");
      navigate(-1);
    } catch {
      setSaveErr("Nie udało się utworzyć modułu.");
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

      <Heading mb={2}>Utwórz moduł</Heading>
      <Text color="gray.400" mb={6}>
        Dodaj nowy moduł do kursu.
      </Text>

      {coursesErr && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {coursesErr}
        </Alert>
      )}

      {saveErr && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {saveErr}
        </Alert>
      )}
      {saveMsg && (
        <Alert status="success" borderRadius="md" mb={4}>
          <AlertIcon />
          {saveMsg}
        </Alert>
      )}

      <Box
        bg="gray.900"
        borderRadius="xl"
        p={{ base: 5, md: 6 }}
        boxShadow="lg"
      >
        <Stack spacing={5}>
          <Divider borderColor="gray.700" />

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

              {selectedCourse && (
                <HStack mt={3} spacing={2} wrap="wrap">
                  {selectedCourse.courseCategoryName && (
                    <Badge colorScheme="purple">
                      {selectedCourse.courseCategoryName}
                    </Badge>
                  )}
                  {selectedCourse.tutorUserName && (
                    <Badge colorScheme="yellow">
                      Tutor: {selectedCourse.tutorUserName}
                    </Badge>
                  )}
                  <Badge colorScheme="teal">Kurs: {selectedCourse.title}</Badge>
                </HStack>
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
            <FormLabel>Tytuł modułu *</FormLabel>
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
              Utwórz
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
}
