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
} from "@chakra-ui/react";

import { coursesApi } from "../../../api/coursesApi";
import type { CourseDto, CourseEditDto } from "../../../types/course";

export default function CourseEditPage() {
  const { id } = useParams();
  const courseId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<CourseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [status, setStatus] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

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

      setTitle(data.title ?? "");
      setShortDescription(data.shortDescription ?? "");
      setLongDescription(data.longDescription ?? "");
      setDifficultyLevel(data.difficultyLevel ?? "");
      setStatus(data.status ?? "");
    } catch (e: any) {
      if (e?.response?.status === 403) {
        setError("Brak dostępu: możesz edytować tylko swoje kursy.");
      } else {
        setError("Nie udało się pobrać danych kursu.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [courseId]);

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
        courseCategoryId: item?.courseCategoryId ?? null,
        title: title.trim(),
        shortDescription: shortDescription.trim()
          ? shortDescription.trim()
          : null,
        longDescription: longDescription.trim() ? longDescription.trim() : null,
        difficultyLevel: difficultyLevel.trim() ? difficultyLevel.trim() : null,
        status: status.trim(),
        thumbnailMediaId: item?.thumbnailMediaId ?? null,
      };

      await coursesApi.editCourse(courseId, dto);
      setSaveMsg("Zapisano zmiany.");
      await load();
    } catch (e: any) {
      if (e?.response?.status === 403) {
        setSaveErr("Brak dostępu: możesz edytować tylko swoje kursy.");
      } else {
        setSaveErr("Nie udało się zapisać zmian.");
      }
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

      <Heading mb={2}>Edytuj kurs (Tutor)</Heading>
      <Text color="gray.400" mb={6}>
        Edycja danych kursu (tylko kursy, w których jesteś tutorem).
      </Text>

      {loading && (
        <Box py={10} textAlign="center">
          <Spinner size="lg" />
        </Box>
      )}

      {error && (
        <Alert status="error" borderRadius="md" mb={4}>
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
