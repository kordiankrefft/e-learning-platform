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

import { lessonAttachmentsApi } from "../../../api/lessonAttachmentsApi";
import { lessonsApi } from "../../../api/lessonsApi";

import type { LessonAttachmentCreateDto } from "../../../types/lessonAttachment";
import type { LessonDto } from "../../../types/lesson";

export default function LessonAttachmentCreatePage() {
  const navigate = useNavigate();

  const [lessonId, setLessonId] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  // lessons dropdown
  const [lessons, setLessons] = useState<LessonDto[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [lessonsErr, setLessonsErr] = useState<string | null>(null);

  useEffect(() => {
    const loadLessons = async () => {
      setLessonsErr(null);
      try {
        setLessonsLoading(true);
        const res = await lessonsApi.getLessons();
        setLessons(res.data ?? []);
      } catch {
        setLessonsErr("Nie udało się pobrać listy lekcji.");
        setLessons([]);
      } finally {
        setLessonsLoading(false);
      }
    };

    loadLessons();
  }, []);

  const selectedLesson = useMemo(() => {
    const id = Number(lessonId);
    if (!id || Number.isNaN(id)) return null;
    return lessons.find((l) => l.id === id) ?? null;
  }, [lessonId, lessons]);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!lessonId.trim()) {
      setSaveErr("Lekcja jest wymagana.");
      return;
    }
    if (!fileName.trim()) {
      setSaveErr("Nazwa pliku jest wymagana.");
      return;
    }
    if (!fileUrl.trim()) {
      setSaveErr("URL pliku jest wymagany.");
      return;
    }

    try {
      setSaving(true);

      const dto: LessonAttachmentCreateDto = {
        lessonId: Number(lessonId),
        fileName: fileName.trim(),
        fileUrl: fileUrl.trim(),
        description: description.trim() ? description.trim() : null,
      };

      await lessonAttachmentsApi.create(dto);

      setSaveMsg("Utworzono załącznik.");
      navigate(-1);
    } catch {
      setSaveErr("Nie udało się utworzyć załącznika.");
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

      <Heading mb={2}>Utwórz załącznik lekcji</Heading>
      <Text color="gray.400" mb={6}>
        Dodaj nowy plik do lekcji.
      </Text>

      {lessonsErr && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {lessonsErr}
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

          <FormControl maxW="520px" isDisabled={lessonsLoading}>
            <FormLabel>Lekcja *</FormLabel>

            {lessonsLoading ? (
              <HStack>
                <Spinner size="sm" />
                <Text color="gray.400">Ładowanie lekcji...</Text>
              </HStack>
            ) : (
              <Select
                bg="gray.800"
                borderColor="gray.700"
                placeholder="Wybierz lekcję..."
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
              >
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </Select>
            )}

            {selectedLesson && (
              <HStack mt={3} spacing={2} wrap="wrap">
                {selectedLesson.moduleTitle && (
                  <Badge colorScheme="purple">
                    Moduł: {selectedLesson.moduleTitle}
                  </Badge>
                )}
                <Badge colorScheme="teal">Lekcja: {selectedLesson.title}</Badge>
              </HStack>
            )}
          </FormControl>

          <FormControl>
            <FormLabel>Nazwa pliku *</FormLabel>
            <Input
              bg="gray.800"
              borderColor="gray.700"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              maxLength={255}
            />
          </FormControl>

          <FormControl>
            <FormLabel>URL pliku *</FormLabel>
            <Input
              bg="gray.800"
              borderColor="gray.700"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              maxLength={500}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Opis</FormLabel>
            <Textarea
              bg="gray.800"
              borderColor="gray.700"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              minH="140px"
            />
          </FormControl>

          <HStack spacing={3}>
            <Button
              colorScheme="yellow"
              variant="outline"
              onClick={save}
              isLoading={saving}
              isDisabled={lessonsLoading || !!lessonsErr}
            >
              Utwórz
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
}
