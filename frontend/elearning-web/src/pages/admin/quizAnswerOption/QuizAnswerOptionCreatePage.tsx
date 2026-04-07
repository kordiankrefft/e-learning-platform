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
  Checkbox,
  Textarea,
  Select,
  Spinner,
  Badge,
} from "@chakra-ui/react";

import { quizAnswerOptionsApi } from "../../../api/quizAnswerOptionsApi";
import { quizQuestionsApi } from "../../../api/quizQuestionsApi";

import type { QuizAnswerOptionCreateDto } from "../../../types/quizAnswerOption";
import type { QuizQuestionDto } from "../../../types/quizQuestion";

export default function QuizAnswerOptionCreatePage() {
  const navigate = useNavigate();

  const [quizQuestionId, setQuizQuestionId] = useState("");
  const [orderIndex, setOrderIndex] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

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

      const dto: QuizAnswerOptionCreateDto = {
        quizQuestionId: Number(quizQuestionId),
        orderIndex: Number(orderIndex),
        answerText: answerText.trim(),
        isCorrect,
      };

      await quizAnswerOptionsApi.create(dto);

      setSaveMsg("Utworzono opcję odpowiedzi.");
      navigate(-1);
    } catch {
      setSaveErr("Nie udało się utworzyć opcji odpowiedzi.");
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

      <Heading mb={2}>Utwórz opcję odpowiedzi</Heading>
      <Text color="gray.400" mb={6}>
        Dodaj odpowiedź do pytania quizu.
      </Text>

      {qErr && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {qErr}
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

              {selectedQuestion && (
                <HStack mt={3} spacing={2} wrap="wrap">
                  <Badge colorScheme="blue">
                    ID: {(selectedQuestion as any).id}
                  </Badge>
                  <Badge colorScheme="teal" maxW="100%" noOfLines={1}>
                    {questionLabel(selectedQuestion as any)}
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
              Utwórz
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
}
