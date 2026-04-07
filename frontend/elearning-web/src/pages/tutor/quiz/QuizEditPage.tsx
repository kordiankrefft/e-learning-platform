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

import { quizzesApi } from "../../../api/quizzesApi";
import type { QuizDto, QuizEditDto } from "../../../types/quiz";

export default function QuizEditPage() {
  const { id } = useParams();
  const quizId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<QuizDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<string>("");
  const [passThresholdPct, setPassThresholdPct] = useState<string>("");
  const [maxAttempts, setMaxAttempts] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const load = async () => {
    if (!quizId || Number.isNaN(quizId)) {
      setError("Nieprawidłowe ID quizu.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await quizzesApi.getQuiz(quizId);
      const data = res.data;

      setItem(data);
      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setTimeLimitSeconds(
        data.timeLimitSeconds == null ? "" : String(data.timeLimitSeconds)
      );
      setPassThresholdPct(
        data.passThresholdPct == null ? "" : String(data.passThresholdPct)
      );
      setMaxAttempts(data.maxAttempts == null ? "" : String(data.maxAttempts));
    } catch {
      setError("Nie udało się pobrać danych quizu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [quizId]);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!item) {
      setSaveErr("Nie wczytano quizu.");
      return;
    }

    if (!title.trim()) {
      setSaveErr("Tytuł jest wymagany.");
      return;
    }

    const tlsRaw = timeLimitSeconds.trim();
    const tls = tlsRaw ? Number(tlsRaw) : null;
    if (tlsRaw && (!Number.isFinite(tls!) || tls! <= 0)) {
      setSaveErr("Limit czasu (s) musi być liczbą > 0 lub pusty.");
      return;
    }

    const pctRaw = passThresholdPct.trim();
    const pct = pctRaw ? Number(pctRaw) : null;
    if (pctRaw && (!Number.isFinite(pct!) || pct! < 0 || pct! > 100)) {
      setSaveErr("Próg zaliczenia (%) musi być w zakresie 0–100 lub pusty.");
      return;
    }

    const maRaw = maxAttempts.trim();
    const ma = maRaw ? Number(maRaw) : null;
    if (maRaw && (!Number.isFinite(ma!) || ma! <= 0)) {
      setSaveErr("Maks. liczba prób musi być liczbą > 0 lub pusta.");
      return;
    }

    try {
      setSaving(true);

      const dto: QuizEditDto = {
        id: quizId,
        lessonId: item.lessonId ?? null,
        moduleId: item.moduleId ?? null,
        title: title.trim(),
        description: description.trim() || null,
        timeLimitSeconds: tls,
        passThresholdPct: pct,
        maxAttempts: ma,
      };

      await quizzesApi.editQuiz(quizId, dto);
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

      <Heading mb={2}>Edytuj quiz (Tutor)</Heading>
      <Text color="gray.400" mb={6}>
        Edycja danych quizu
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
                {item.isActive ? "AKTYWNY" : "NIEAKTYWNY"}
              </Badge>
              <Badge colorScheme="purple">
                Moduł:{" "}
                {item.moduleTitle ??
                  (item.moduleId ? `#${item.moduleId}` : "—")}
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
              <FormLabel>Opis</FormLabel>
              <Textarea
                bg="gray.800"
                borderColor="gray.700"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                minH="140px"
              />
            </FormControl>

            <FormControl maxW="260px">
              <FormLabel>Limit czasu (sekundy)</FormLabel>
              <Input
                bg="gray.800"
                borderColor="gray.700"
                value={timeLimitSeconds}
                onChange={(e) => setTimeLimitSeconds(e.target.value)}
                placeholder="np. 900"
              />
            </FormControl>

            <FormControl maxW="260px">
              <FormLabel>Próg zaliczenia (%)</FormLabel>
              <Input
                bg="gray.800"
                borderColor="gray.700"
                value={passThresholdPct}
                onChange={(e) => setPassThresholdPct(e.target.value)}
                placeholder="np. 70"
              />
            </FormControl>

            <FormControl maxW="260px">
              <FormLabel>Maks. liczba prób</FormLabel>
              <Input
                bg="gray.800"
                borderColor="gray.700"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                placeholder="np. 1"
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
