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

import { coursesApi } from "../../../api/coursesApi";
import { courseCategoriesApi } from "../../../api/courseCategoriesApi";
import { mediaFilesApi } from "../../../api/mediaFilesApi";

import type { CourseDto, CourseEditDto } from "../../../types/course";
import type { CourseCategoryDto } from "../../../types/courseCategory";
import type { MediaFileDto } from "../../../types/mediaFile";

export default function CourseEditPage() {
  const { id } = useParams();
  const courseId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<CourseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [courseCategoryId, setCourseCategoryId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [status, setStatus] = useState("");
  const [thumbnailMediaId, setThumbnailMediaId] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const [listsLoading, setListsLoading] = useState(true);
  const [listsErr, setListsErr] = useState<string | null>(null);
  const [categories, setCategories] = useState<CourseCategoryDto[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFileDto[]>([]);

  const categoryLabel = (c: CourseCategoryDto) => {
    const anyC = c as any;
    return anyC.name?.trim() || anyC.title?.trim() || `Category #${c.id}`;
  };

  const load = async () => {
    if (!courseId || Number.isNaN(courseId)) {
      setError("Nieprawidłowe ID kursu.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await coursesApi.getCourse(courseId);
      const data = res.data;

      setItem(data);

      setCourseCategoryId(
        data.courseCategoryId != null ? String(data.courseCategoryId) : ""
      );
      setTitle(data.title ?? "");
      setShortDescription(data.shortDescription ?? "");
      setLongDescription(data.longDescription ?? "");
      setDifficultyLevel(data.difficultyLevel ?? "");
      setStatus(data.status ?? "");
      setThumbnailMediaId(
        data.thumbnailMediaId != null ? String(data.thumbnailMediaId) : ""
      );
    } catch {
      setError("Nie udało się pobrać danych kursu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [courseId]);

  useEffect(() => {
    const loadLists = async () => {
      setListsErr(null);
      try {
        setListsLoading(true);

        const [catRes, mediaRes] = await Promise.all([
          courseCategoriesApi.getCourseCategories(),
          mediaFilesApi.getAll(),
        ]);

        setCategories(catRes.data ?? []);
        setMediaFiles(mediaRes.data ?? []);
      } catch {
        setListsErr("Nie udało się pobrać list (kategorie/media).");
      } finally {
        setListsLoading(false);
      }
    };

    loadLists();
  }, []);

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

      const dto: CourseEditDto = {
        id: courseId,
        courseCategoryId: courseCategoryId ? Number(courseCategoryId) : null,
        title: title.trim(),
        shortDescription: shortDescription.trim()
          ? shortDescription.trim()
          : null,
        longDescription: longDescription.trim() ? longDescription.trim() : null,
        difficultyLevel: difficultyLevel.trim() ? difficultyLevel.trim() : null,
        status: status.trim(),
        thumbnailMediaId: thumbnailMediaId ? Number(thumbnailMediaId) : null,
      };

      await coursesApi.editCourse(courseId, dto);
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

      <Heading mb={2}>Edytuj kurs</Heading>
      <Text color="gray.400" mb={6}>
        Edycja danych kursu.
      </Text>

      {listsErr && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {listsErr}
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

              <Badge colorScheme="yellow">
                Tutor: {item.tutorUserName?.trim() || `#${item.tutorUserId}`}
              </Badge>

              {item.courseCategoryName && (
                <Badge colorScheme="purple">
                  Kategoria: {item.courseCategoryName}
                </Badge>
              )}

              {item.thumbnailName && (
                <Badge colorScheme="teal">
                  Miniaturka: {item.thumbnailName}
                </Badge>
              )}
            </HStack>

            <Text color="gray.400">
              <b>Utworzono:</b>{" "}
              {item.createdAt
                ? new Date(item.createdAt).toLocaleString("pl-PL", {
                    timeZone: "Europe/Warsaw",
                  })
                : "—"}
              {"  "}
              <b>Edytowano:</b>{" "}
              {item.updatedAt
                ? new Date(item.updatedAt).toLocaleString("pl-PL", {
                    timeZone: "Europe/Warsaw",
                  })
                : "—"}
            </Text>

            <Divider borderColor="gray.700" />

            <Box>
              <Heading size="md" mb={3}>
                Dane
              </Heading>

              <Stack spacing={4}>
                {listsLoading ? (
                  <HStack>
                    <Spinner size="sm" />
                    <Text color="gray.400">Ładowanie list...</Text>
                  </HStack>
                ) : (
                  <HStack spacing={4} flexWrap="wrap" align="start">
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

                    <FormControl maxW="360px">
                      <FormLabel>Miniaturka</FormLabel>
                      <Select
                        bg="gray.800"
                        borderColor="gray.700"
                        placeholder="— brak —"
                        value={thumbnailMediaId}
                        onChange={(e) => setThumbnailMediaId(e.target.value)}
                      >
                        {mediaFiles.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.fileName ?? `Miniaturka #${m.id}`}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </HStack>
                )}

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
                  <FormLabel>Opis krótki</FormLabel>
                  <Input
                    bg="gray.800"
                    borderColor="gray.700"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    maxLength={500}
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

                <HStack spacing={4} flexWrap="wrap">
                  <FormControl maxW="320px">
                    <FormLabel>Poziom trudności</FormLabel>
                    <Input
                      bg="gray.800"
                      borderColor="gray.700"
                      value={difficultyLevel}
                      onChange={(e) => setDifficultyLevel(e.target.value)}
                      maxLength={50}
                    />
                  </FormControl>

                  <FormControl maxW="320px">
                    <FormLabel>Status *</FormLabel>
                    <Input
                      bg="gray.800"
                      borderColor="gray.700"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      maxLength={50}
                    />
                  </FormControl>
                </HStack>

                <HStack spacing={3}>
                  <Button
                    colorScheme="yellow"
                    variant="outline"
                    onClick={save}
                    isLoading={saving}
                    isDisabled={listsLoading || !!listsErr}
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
