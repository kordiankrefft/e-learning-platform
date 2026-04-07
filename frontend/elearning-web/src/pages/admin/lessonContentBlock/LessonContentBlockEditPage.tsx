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

import { lessonContentBlocksApi } from "../../../api/lessonContentBlocksApi";
import { lessonsApi } from "../../../api/lessonsApi";

import type {
  LessonContentBlockDto,
  LessonContentBlockEditDto,
} from "../../../types/lessonContentBlock";
import type { LessonDto } from "../../../types/lesson";

export default function LessonContentBlockEditPage() {
  const { id } = useParams();
  const blockId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<LessonContentBlockDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const selectedLesson = useMemo(() => {
    const id = Number(lessonId);
    if (!id || Number.isNaN(id)) return null;
    return lessons.find((l) => l.id === id) ?? null;
  }, [lessonId, lessons]);

  const load = async () => {
    if (!blockId || Number.isNaN(blockId)) {
      setError("Nieprawidłowe ID bloku treści.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await lessonContentBlocksApi.getById(blockId);
      const data = res.data;

      setItem(data);

      setLessonId(String(data.lessonId ?? ""));
      setBlockType(data.blockType ?? "");
      setOrderIndex(String(data.orderIndex ?? 0));
      setContent(data.content ?? "");
    } catch {
      setError("Nie udało się pobrać danych bloku treści.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [blockId]);

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

      const dto: LessonContentBlockEditDto = {
        id: blockId,
        lessonId: Number(lessonId),
        blockType: blockType.trim(),
        orderIndex: Number(orderIndex),
        content: content.trim() ? content : null,
      };

      await lessonContentBlocksApi.update(blockId, dto);

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

      <Heading mb={2}>Edytuj blok treści</Heading>
      <Text color="gray.400" mb={6}>
        Edycja danych bloku treści lekcji.
      </Text>

      {lessonsErr && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {lessonsErr}
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

              {item.lessonTitle && (
                <Badge colorScheme="teal">Lekcja: {item.lessonTitle}</Badge>
              )}
              {selectedLesson?.moduleTitle && (
                <Badge colorScheme="purple">
                  Moduł: {selectedLesson.moduleTitle}
                </Badge>
              )}
            </HStack>

            <Divider borderColor="gray.700" />

            <Box>
              <Heading size="md" mb={3}>
                Dane
              </Heading>

              <Stack spacing={4}>
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
