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

import { quizQuestionsApi } from "../../../api/quizQuestionsApi";
import type {
  QuizQuestionDto,
  QuizQuestionEditDto,
} from "../../../types/quizQuestion";

export default function QuizQuestionEditPage() {
  const { id } = useParams();
  const questionId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<QuizQuestionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [points, setPoints] = useState<string>("1");
  const [orderIndex, setOrderIndex] = useState<string>("1");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const load = async () => {
    if (!questionId || Number.isNaN(questionId)) {
      setError("Nieprawidłowe ID pytania.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await quizQuestionsApi.getById(questionId);
      const data = res.data;

      setItem(data);
      setQuestionText(data.questionText ?? "");
      setQuestionType(data.questionType ?? "");
      setPoints(String(data.points ?? 1));
      setOrderIndex(String(data.orderIndex ?? 1));
    } catch {
      setError("Nie udało się pobrać danych pytania.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [questionId]);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!item) {
      setSaveErr("Nie wczytano pytania.");
      return;
    }

    if (!questionText.trim()) {
      setSaveErr("Treść pytania jest wymagana.");
      return;
    }

    if (!questionType.trim()) {
      setSaveErr("QuestionType jest wymagany.");
      return;
    }

    const pts = Number(points);
    if (!Number.isFinite(pts) || pts <= 0) {
      setSaveErr("Punkty muszą być liczbą > 0.");
      return;
    }

    const oi = Number(orderIndex);
    if (!Number.isFinite(oi) || oi <= 0) {
      setSaveErr("Kolejność musi być liczbą > 0.");
      return;
    }

    try {
      setSaving(true);

      const dto: QuizQuestionEditDto = {
        id: questionId,
        quizId: item.quizId,
        questionText: questionText.trim(),
        questionType: questionType.trim(),
        points: pts,
        orderIndex: oi,
      };

      await quizQuestionsApi.edit(questionId, dto);
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

      <Heading mb={2}>Edytuj pytanie (Tutor)</Heading>
      <Text color="gray.400" mb={6}>
        Edycja danych pytania quizowego
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
                {item.isActive ? "AKTYWNE" : "NIEAKTYWNE"}
              </Badge>
              <Badge colorScheme="purple">
                Quiz: {item.quizTitle ?? `#${item.quizId}`}
              </Badge>
            </HStack>

            <Divider borderColor="gray.700" />

            <FormControl>
              <FormLabel>Treść pytania *</FormLabel>
              <Textarea
                bg="gray.800"
                borderColor="gray.700"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                minH="140px"
              />
            </FormControl>

            <FormControl maxW="320px">
              <FormLabel>QuestionType *</FormLabel>
              <Input
                bg="gray.800"
                borderColor="gray.700"
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
              />
            </FormControl>

            <FormControl maxW="220px">
              <FormLabel>Punkty *</FormLabel>
              <Input
                bg="gray.800"
                borderColor="gray.700"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
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
