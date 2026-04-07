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

import { quizQuestionsApi } from "../../../api/quizQuestionsApi";
import { quizzesApi } from "../../../api/quizzesApi";

import type {
  QuizQuestionDto,
  QuizQuestionEditDto,
} from "../../../types/quizQuestion";

type QuizLite = {
  id: number;
  title?: string | null;
};

export default function QuizQuestionEditPage() {
  const { id } = useParams();
  const questionId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<QuizQuestionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quizId, setQuizId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [points, setPoints] = useState("");
  const [orderIndex, setOrderIndex] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const [quizzes, setQuizzes] = useState<QuizLite[]>([]);
  const [qLoading, setQLoading] = useState(true);
  const [qErr, setQErr] = useState<string | null>(null);

  const quizLabel = (q: QuizLite) =>
    q.title?.trim() ? q.title : `Quiz #${q.id}`;

  useEffect(() => {
    const loadQuizzes = async () => {
      setQErr(null);
      try {
        setQLoading(true);
        const res = await quizzesApi.getQuizzes();
        setQuizzes((res.data ?? []) as QuizLite[]);
      } catch {
        setQErr("Nie udało się pobrać listy quizów.");
        setQuizzes([]);
      } finally {
        setQLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  const selectedQuiz = useMemo(() => {
    const id = Number(quizId);
    if (!id || Number.isNaN(id)) return null;
    return quizzes.find((q) => q.id === id) ?? null;
  }, [quizId, quizzes]);

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

      setQuizId(String(data.quizId ?? ""));
      setQuestionText(data.questionText ?? "");
      setQuestionType(data.questionType ?? "");
      setPoints(String(data.points ?? ""));
      setOrderIndex(String(data.orderIndex ?? ""));
    } catch {
      setError("Nie udało się pobrać danych pytania.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [questionId]);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!quizId.trim()) {
      setSaveErr("Quiz jest wymagany.");
      return;
    }
    if (!questionText.trim()) {
      setSaveErr("Treść pytania jest wymagana.");
      return;
    }
    if (!questionType.trim()) {
      setSaveErr("Typ pytania jest wymagany.");
      return;
    }
    if (!points.trim()) {
      setSaveErr("Punkty są wymagane.");
      return;
    }
    if (!orderIndex.trim()) {
      setSaveErr("Kolejność jest wymagana.");
      return;
    }

    try {
      setSaving(true);

      const dto: QuizQuestionEditDto = {
        id: questionId,
        quizId: Number(quizId),
        questionText: questionText.trim(),
        questionType: questionType.trim(),
        points: Number(points),
        orderIndex: Number(orderIndex),
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

      <Heading mb={2}>Edytuj pytanie</Heading>
      <Text color="gray.400" mb={6}>
        Edycja danych pytania quizu.
      </Text>

      {qErr && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {qErr}
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
                {item.isActive ? "AKTYWNE" : "NIEAKTYWNE"}
              </Badge>

              <Badge colorScheme="teal" maxW="100%" noOfLines={1}>
                Quiz:{" "}
                {item.quizTitle ??
                  (selectedQuiz ? quizLabel(selectedQuiz) : `#${item.quizId}`)}
              </Badge>
            </HStack>

            <Divider borderColor="gray.700" />

            <Stack spacing={4}>
              <HStack spacing={4} flexWrap="wrap" align="start">
                <FormControl maxW="520px" isDisabled={qLoading}>
                  <FormLabel>Quiz *</FormLabel>
                  {qLoading ? (
                    <HStack>
                      <Spinner size="sm" />
                      <Text color="gray.400">Ładowanie quizów...</Text>
                    </HStack>
                  ) : (
                    <Select
                      bg="gray.800"
                      borderColor="gray.700"
                      placeholder="Wybierz quiz..."
                      value={quizId}
                      onChange={(e) => setQuizId(e.target.value)}
                    >
                      {quizzes.map((q) => (
                        <option key={q.id} value={q.id}>
                          {quizLabel(q)}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormControl>

                <FormControl maxW="260px">
                  <FormLabel>Typ pytania *</FormLabel>
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
                    inputMode="decimal"
                  />
                </FormControl>

                <FormControl maxW="220px">
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
                <FormLabel>Treść pytania *</FormLabel>
                <Textarea
                  bg="gray.800"
                  borderColor="gray.700"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  minH="160px"
                />
              </FormControl>

              <HStack spacing={3}>
                <Button
                  colorScheme="yellow"
                  variant="outline"
                  onClick={save}
                  isLoading={saving}
                  isDisabled={qLoading || !!qErr}
                >
                  Zapisz zmiany
                </Button>
              </HStack>

              {saveMsg && <Box color="green.300">{saveMsg}</Box>}
              {saveErr && <Box color="red.300">{saveErr}</Box>}
            </Stack>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
