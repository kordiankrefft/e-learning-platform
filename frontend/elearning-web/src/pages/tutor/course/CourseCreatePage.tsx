import { useEffect, useState } from "react";
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
} from "@chakra-ui/react";

import { coursesApi } from "../../../api/coursesApi";
import { courseCategoriesApi } from "../../../api/courseCategoriesApi";

import type { CourseCreateDto } from "../../../types/course";
import type { CourseCategoryDto } from "../../../types/courseCategory";

export default function CourseCreatePage() {
  const navigate = useNavigate();

  const [courseCategoryId, setCourseCategoryId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [status, setStatus] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const [listsLoading, setListsLoading] = useState(true);
  const [listsErr, setListsErr] = useState<string | null>(null);

  const [categories, setCategories] = useState<CourseCategoryDto[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setListsLoading(true);
        const catRes = await courseCategoriesApi.getCourseCategories();
        setCategories(catRes.data ?? []);
      } catch {
        setListsErr("Nie udało się pobrać kategorii.");
      } finally {
        setListsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const categoryLabel = (c: CourseCategoryDto) => {
    const anyC = c as any;
    return anyC.name?.trim() || anyC.title?.trim() || `Category #${c.id}`;
  };

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!title.trim()) {
      setSaveErr("Tytuł jest wymagany.");
      return;
    }

    if (!status.trim()) {
      setSaveErr("Status jest wymagany.");
      return;
    }

    try {
      setSaving(true);

      const dto: CourseCreateDto = {
        courseCategoryId: courseCategoryId ? Number(courseCategoryId) : null,
        title: title.trim(),
        shortDescription: shortDescription.trim() || null,
        longDescription: longDescription.trim() || null,
        difficultyLevel: difficultyLevel.trim() || null,
        status: status.trim(),

        thumbnailMediaId: null,
        tutorUserId: null,
      };

      await coursesApi.createCourse(dto);

      setSaveMsg("Utworzono kurs.");
      navigate("/tutor/courses");
    } catch {
      setSaveErr("Nie udało się utworzyć kursu.");
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

      <Heading mb={2}>Utwórz kurs (Tutor)</Heading>
      <Text color="gray.400" mb={6}>
        Nowy kurs zostanie przypisany automatycznie do Ciebie.
      </Text>

      {listsErr && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {listsErr}
        </Alert>
      )}

      {saveErr && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {saveErr}
        </Alert>
      )}

      {saveMsg && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          {saveMsg}
        </Alert>
      )}

      <Box bg="gray.900" borderRadius="xl" p={6} boxShadow="lg">
        <Stack spacing={5}>
          <Divider borderColor="gray.700" />

          {listsLoading ? (
            <HStack>
              <Spinner size="sm" />
              <Text color="gray.400">Ładowanie kategorii...</Text>
            </HStack>
          ) : (
            <FormControl maxW="320px">
              <FormLabel>Kategoria</FormLabel>
              <Select
                bg="gray.800"
                borderColor="gray.700"
                placeholder="— brak —"
                value={courseCategoryId}
                onChange={(e) => setCourseCategoryId(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {categoryLabel(c)}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}

          <FormControl>
            <FormLabel>Tytuł *</FormLabel>
            <Input
              bg="gray.800"
              borderColor="gray.700"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Opis krótki</FormLabel>
            <Input
              bg="gray.800"
              borderColor="gray.700"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Opis długi</FormLabel>
            <Textarea
              bg="gray.800"
              borderColor="gray.700"
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              minH="160px"
            />
          </FormControl>

          <HStack spacing={4}>
            <FormControl maxW="320px">
              <FormLabel>Poziom trudności</FormLabel>
              <Input
                bg="gray.800"
                borderColor="gray.700"
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
              />
            </FormControl>

            <FormControl maxW="320px">
              <FormLabel>Status *</FormLabel>
              <Input
                bg="gray.800"
                borderColor="gray.700"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />
            </FormControl>
          </HStack>

          <HStack spacing={3}>
            <Button
              colorScheme="yellow"
              variant="outline"
              onClick={save}
              isLoading={saving}
            >
              Utwórz
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
}
