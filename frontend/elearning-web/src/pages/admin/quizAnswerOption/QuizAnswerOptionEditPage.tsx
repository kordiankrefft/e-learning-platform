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
  Checkbox,
  Textarea,
  Select,
} from "@chakra-ui/react";

import { quizAnswerOptionsApi } from "../../../api/quizAnswerOptionsApi";
import { quizQuestionsApi } from "../../../api/quizQuestionsApi";

import type {
  QuizAnswerOptionDto,
  QuizAnswerOptionEditDto,
} from "../../../types/quizAnswerOption";
import type { QuizQuestionDto } from "../../../types/quizQuestion";

export default function QuizAnswerOptionEditPage() {
  const { id } = useParams();
  const optionId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<QuizAnswerOptionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quizQuestionId, setQuizQuestionId] = useState("");
  const [orderIndex, setOrderIndex] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  // questions dropdown
  const [questions, setQuestions] = useState<QuizQuestionDto[]>([]);
  const [qLoading, setQLoading] = useState(true);
  const [qErr, setQErr] = useState<string | null>(null);

  const questionLabel = (q: any) =>
    (q?.questionText as string | null) ??
    (q?.text as string | null) ??
    (q?.title as string | null) ??
    (q?.content as string | null) ??
    `Pytanie #${q?.id ?? "?"}`;

  useEffect(() => {
    const loadQuestions = async () => {
      setQErr(null);
      try {
        setQLoading(true);
        const res = await quizQuestionsApi.getAll();
        setQuestions(res.data ?? []);
      } catch {
        setQErr("Nie udało się pobrać listy pytań.");
        setQuestions([]);
      } finally {
        setQLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const selectedQuestion = useMemo(() => {
    const id = Number(quizQuestionId);
    if (!id || Number.isNaN(id)) return null;
    return questions.find((q) => q.id === id) ?? null;
  }, [quizQuestionId, questions]);

  const load = async () => {
    if (!optionId || Number.isNaN(optionId)) {
      setError("Nieprawidłowe ID opcji odpowiedzi.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await quizAnswerOptionsApi.getById(optionId);
      const data = res.data;

      setItem(data);

      setQuizQuestionId(String(data.quizQuestionId ?? ""));
      setOrderIndex(String(data.orderIndex ?? 0));
      setAnswerText(data.answerText ?? "");
      setIsCorrect(!!data.isCorrect);
    } catch {
      setError("Nie udało się pobrać danych opcji odpowiedzi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [optionId]);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!quizQuestionId.trim()) {
      setSaveErr("Pytanie jest wymagane.");
      return;
    }
    if (!orderIndex.trim()) {
      setSaveErr("Kolejność (orderIndex) jest wymagana.");
      return;
    }
    if (!answerText.trim()) {
      setSaveErr("Treść odpowiedzi jest wymagana.");
      return;
    }

    try {
      setSaving(true);

      const dto: QuizAnswerOptionEditDto = {
        id: optionId,
        quizQuestionId: Number(quizQuestionId),
        orderIndex: Number(orderIndex),
        answerText: answerText.trim(),
        isCorrect,
      };

      await quizAnswerOptionsApi.edit(optionId, dto);

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

      <Heading mb={2}>Edytuj opcję odpowiedzi</Heading>
      <Text color="gray.400" mb={6}>
        Edycja danych odpowiedzi do pytania quizu.
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
                {item.isActive ? "AKTYWNY" : "NIEAKTYWNY"}
              </Badge>
              <Badge colorScheme={item.isCorrect ? "green" : "gray"}>
                {item.isCorrect ? "POPRAWNA" : "NIEPOPRAWNA"}
              </Badge>

              {(item.quizQuestionText || selectedQuestion) && (
                <Badge colorScheme="teal" maxW="100%" noOfLines={1}>
                  Pytanie:{" "}
                  {item.quizQuestionText ??
                    (selectedQuestion
                      ? questionLabel(selectedQuestion as any)
                      : "—")}
                </Badge>
              )}
            </HStack>

            <Divider borderColor="gray.700" />

            <Stack spacing={4}>
              <HStack spacing={4} flexWrap="wrap" align="start">
                <FormControl maxW="640px" isDisabled={qLoading}>
                  <FormLabel>Pytanie *</FormLabel>

                  {qLoading ? (
                    <HStack>
                      <Spinner size="sm" />
                      <Text color="gray.400">Ładowanie pytań...</Text>
                    </HStack>
                  ) : (
                    <Select
                      bg="gray.800"
                      borderColor="gray.700"
                      placeholder="Wybierz pytanie..."
                      value={quizQuestionId}
                      onChange={(e) => setQuizQuestionId(e.target.value)}
                    >
                      {questions.map((q) => (
                        <option key={q.id} value={q.id}>
                          {questionLabel(q)}
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

                <FormControl maxW="260px" pt={7}>
                  <Checkbox
                    isChecked={isCorrect}
                    onChange={(e) => setIsCorrect(e.target.checked)}
                    colorScheme="yellow"
                  >
                    Poprawna odpowiedź
                  </Checkbox>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Treść odpowiedzi *</FormLabel>
                <Textarea
                  bg="gray.800"
                  borderColor="gray.700"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  minH="140px"
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
