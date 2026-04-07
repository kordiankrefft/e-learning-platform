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

import { lessonContentBlocksApi } from "../../../api/lessonContentBlocksApi";
import { lessonsApi } from "../../../api/lessonsApi";

import type { LessonContentBlockCreateDto } from "../../../types/lessonContentBlock";
import type { LessonDto } from "../../../types/lesson";

export default function LessonContentBlockCreatePage() {
  const navigate = useNavigate();

  const [lessonId, setLessonId] = useState("");
  const [blockType, setBlockType] = useState("");
  const [orderIndex, setOrderIndex] = useState("");
  const [content, setContent] = useState("");

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
    if (!blockType.trim()) {
      setSaveErr("Typ bloku jest wymagany.");
      return;
    }
    if (!orderIndex.trim()) {
      setSaveErr("Kolejność (orderIndex) jest wymagana.");
      return;
    }

    try {
      setSaving(true);

      const dto: LessonContentBlockCreateDto = {
        lessonId: Number(lessonId),
        blockType: blockType.trim(),
        orderIndex: Number(orderIndex),
        content: content.trim() ? content : null,
      };

      await lessonContentBlocksApi.create(dto);

      setSaveMsg("Utworzono blok treści.");
      navigate("/admin/lesson-content-blocks");
    } catch {
      setSaveErr("Nie udało się utworzyć bloku treści.");
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

      <Heading mb={2}>Utwórz blok treści</Heading>
      <Text color="gray.400" mb={6}>
        Dodaj nowy blok treści do lekcji.
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

          <HStack spacing={4} flexWrap="wrap" align="start">
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
                  <Badge colorScheme="teal">
                    Lekcja: {selectedLesson.title}
                  </Badge>
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
            <FormLabel>Typ bloku *</FormLabel>
            <Input
              bg="gray.800"
              borderColor="gray.700"
              value={blockType}
              onChange={(e) => setBlockType(e.target.value)}
              maxLength={50}
              placeholder="np. Text, Video, Html..."
            />
          </FormControl>

          <FormControl>
            <FormLabel>Treść</FormLabel>
            <Textarea
              bg="gray.800"
              borderColor="gray.700"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              minH="180px"
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
