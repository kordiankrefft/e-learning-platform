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

import { lessonsApi } from "../../../api/lessonsApi";
import type { LessonDto, LessonEditDto } from "../../../types/lesson";

export default function LessonEditPage() {
  const { id } = useParams();
  const lessonId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<LessonDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("");
  const [orderIndex, setOrderIndex] = useState<string>("1");
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const load = async () => {
    if (!lessonId || Number.isNaN(lessonId)) {
      setError("Nieprawidłowe ID lekcji.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await lessonsApi.getLesson(lessonId);
      const data = res.data;

      setItem(data);
      setTitle(data.title ?? "");
      setSummary(data.summary ?? "");
      setStatus(data.status ?? "");
      setOrderIndex(String(data.orderIndex ?? 1));
      setEstimatedMinutes(
        data.estimatedMinutes == null ? "" : String(data.estimatedMinutes)
      );
    } catch {
      setError("Nie udało się pobrać danych lekcji.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!item) {
      setSaveErr("Nie wczytano lekcji.");
      return;
    }

    if (!title.trim()) {
      setSaveErr("Tytuł jest wymagany.");
      return;
    }

    const oi = Number(orderIndex);
    if (!Number.isFinite(oi) || oi <= 0) {
      setSaveErr("Kolejność musi być liczbą > 0.");
      return;
    }

    const minsRaw = estimatedMinutes.trim();
    const mins = minsRaw ? Number(minsRaw) : null;
    if (minsRaw && (!Number.isFinite(mins!) || mins! <= 0)) {
      setSaveErr("Szacowany czas musi być liczbą > 0 lub pusty.");
      return;
    }

    try {
      setSaving(true);

      const dto: LessonEditDto = {
        id: lessonId,
        moduleId: item.moduleId,
        title: title.trim() || null,
        summary: summary.trim() || null,
        status: status.trim() || null,
        orderIndex: oi,
        estimatedMinutes: mins,
      };

      await lessonsApi.editLesson(lessonId, dto);
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

      <Heading mb={2}>Edytuj lekcję (Tutor)</Heading>
      <Text color="gray.400" mb={6}>
        Edycja danych lekcji
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
        <Box bg="gray.900" borderRadius="xl" p={6} boxShadow="lg">
          <Stack spacing={5}>
            <HStack spacing={3} wrap="wrap">
              <Badge colorScheme="blue">ID: {item.id}</Badge>
              <Badge colorScheme={item.isActive ? "green" : "gray"}>
                {item.isActive ? "AKTYWNA" : "NIEAKTYWNA"}
              </Badge>
              <Badge colorScheme="purple">
                Moduł: {item.moduleTitle ?? `#${item.moduleId}`}
              </Badge>
            </HStack>

            <Divider borderColor="gray.700" />

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
              <FormLabel>Podsumowanie</FormLabel>
              <Textarea
                bg="gray.800"
                borderColor="gray.700"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                minH="140px"
              />
            </FormControl>

            <FormControl maxW="260px">
              <FormLabel>Status</FormLabel>
              <Input
                bg="gray.800"
                borderColor="gray.700"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />
            </FormControl>

            <FormControl maxW="220px">
              <FormLabel>Kolejność *</FormLabel>
              <Input
                bg="gray.800"
                borderColor="gray.700"
                value={orderIndex}
                onChange={(e) => setOrderIndex(e.target.value)}
              />
            </FormControl>

            <FormControl maxW="260px">
              <FormLabel>Szacowany czas (min)</FormLabel>
              <Input
                bg="gray.800"
                borderColor="gray.700"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                placeholder="np. 15"
              />
            </FormControl>

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
      )}
    </Box>
  );
}
