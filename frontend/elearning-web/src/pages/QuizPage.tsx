import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  HStack,
  VStack,
  Button,
  Badge,
  Divider,
  RadioGroup,
  Radio,
  Stack,
  useToast,
} from "@chakra-ui/react";

import type { QuizAttemptDto } from "../types/quizAttempt";
import type { QuizAttemptAnswerCreateDto } from "../types/quizAttemptAnswer";
import type { QuizTakeDto, QuizTakeQuestionDto } from "../types/quizTake";

import { quizzesApi } from "../api/quizzesApi";
import { quizTakeApi } from "../api/quizTakeApi";
import { quizAttemptsApi } from "../api/quizAttemptsApi";
import { quizAttemptAnswersApi } from "../api/quizAttemptAnswersApi";

type RouteParams = {
  moduleId?: string;
};

type AnswerState = Record<
  number,
  {
    selectedOptionId: number | null;
  }
>;

function formatSeconds(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function QuizPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { moduleId } = useParams<RouteParams>();

  const parsedModuleId = useMemo(() => {
    const value = Number(moduleId);
    return Number.isFinite(value) ? value : null;
  }, [moduleId]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quizTake, setQuizTake] = useState<QuizTakeDto | null>(null);
  const [attempt, setAttempt] = useState<QuizAttemptDto | null>(null);

  const [answers, setAnswers] = useState<AnswerState>({});
  const [submitting, setSubmitting] = useState(false);

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const sortedQuestions = useMemo(() => {
    const list = quizTake?.questions ?? [];
    return [...list].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [quizTake]);

  const answeredCount = useMemo(() => {
    let count = 0;
    for (const questionItem of sortedQuestions) {
      const answerState = answers[questionItem.id];
      if (!answerState) continue;
      if (answerState.selectedOptionId != null) count++;
    }
    return count;
  }, [answers, sortedQuestions]);

  const totalCount = sortedQuestions.length;

  function updateSingleChoice(questionId: number, selectedOptionId: number) {
    setAnswers((previous) => {
      const current = previous[questionId] ?? { selectedOptionId: null };
      return {
        ...previous,
        [questionId]: { ...current, selectedOptionId },
      };
    });
  }

  async function loadQuiz() {
    if (parsedModuleId == null) {
      setError("Invalid moduleId in URL.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("[QuizPage] Step 1: GET /modules/:moduleId/quiz", {
        parsedModuleId,
      });

      const moduleQuizRes = await quizzesApi.getModuleQuiz(parsedModuleId);
      console.log("[QuizPage] Step 1 OK, response:", moduleQuizRes.data);

      const moduleQuiz = moduleQuizRes.data;

      if (!moduleQuiz?.id) {
        setError("No quiz found for this module.");
        return;
      }

      console.log("[QuizPage] Step 2: GET /quiz-take?quizId=...", {
        quizId: moduleQuiz.id,
      });

      const takeRes = await quizTakeApi.getQuizTake(moduleQuiz.id);
      console.log("[QuizPage] Step 2 OK, response:", takeRes.data);

      setQuizTake(takeRes.data);

      const initialAnswers: AnswerState = {};
      for (const questionItem of takeRes.data.questions ?? []) {
        initialAnswers[questionItem.id] = { selectedOptionId: null };
      }
      setAnswers(initialAnswers);

      const timeLimitSeconds = takeRes.data.timeLimitSeconds;
      if (timeLimitSeconds != null && timeLimitSeconds > 0) {
        setRemainingSeconds(timeLimitSeconds);
      } else {
        setRemainingSeconds(null);
      }

      console.log("[QuizPage] Step 3: POST /quiz-attempts create", {
        quizId: moduleQuiz.id,
      });

      const attemptRes = await quizAttemptsApi.create({
        quizId: moduleQuiz.id,
      });
      console.log("[QuizPage] Step 3 OK, response:", attemptRes.data);

      const attemptId = attemptRes.data?.attemptId;
      if (!attemptId) {
        throw new Error("QuizAttempt create returned no attemptId.");
      }

      setAttempt({ id: attemptId } as QuizAttemptDto);
    } catch (caughtError: any) {
      console.error("[QuizPage] Load error:", caughtError);

      const status = caughtError?.response?.status;
      const url = caughtError?.config?.url;
      const method = caughtError?.config?.method;
      const data = caughtError?.response?.data;

      console.error("[QuizPage] Axios debug:", { status, method, url, data });

      let backendMessage: string | null = null;

      if (typeof data === "string" && data.trim().length > 0) {
        backendMessage = data;
      } else if (data && typeof data === "object") {
        backendMessage =
          (typeof data.message === "string" ? data.message : null) ??
          (typeof data.title === "string" ? data.title : null) ??
          (typeof data.error === "string" ? data.error : null) ??
          null;

        if (!backendMessage && data.errors && typeof data.errors === "object") {
          const firstKey = Object.keys(data.errors)[0];
          const firstValue = firstKey ? data.errors[firstKey] : null;
          if (Array.isArray(firstValue) && typeof firstValue[0] === "string") {
            backendMessage = firstValue[0];
          }
        }
      }

      if (status === 400 && backendMessage) {
        setError(backendMessage);
        return;
      }

      setError(
        status
          ? `Failed to load quiz. HTTP ${status} (${method?.toUpperCase()} ${url})`
          : "Failed to load quiz."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadQuiz();
  }, [parsedModuleId]);

  useEffect(() => {
    if (remainingSeconds == null) return;

    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = window.setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous == null) return previous;
        return previous - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current != null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [remainingSeconds != null]);

  // auto-submit
  useEffect(() => {
    if (remainingSeconds == null) return;
    if (remainingSeconds > 0) return;

    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    toast({
      title: "Czas minął",
      description: "Wysyłam quiz automatycznie.",
      status: "warning",
      duration: 2500,
      isClosable: true,
    });

    void handleSubmit(true);
  }, [remainingSeconds]);

  async function handleSubmit(isAutoSubmit: boolean = false) {
    if (!attempt || !quizTake) return;

    const missing = sortedQuestions.filter((questionItem) => {
      const answerState = answers[questionItem.id];
      if (!answerState) return true;
      return answerState.selectedOptionId == null;
    });

    if (missing.length > 0 && !isAutoSubmit) {
      toast({
        title: "Uzupełnij wszystkie odpowiedzi",
        description: `Brakuje odpowiedzi: ${missing.length}`,
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);

    try {
      //zapis odpowiedzi (SingleChoice)
      for (const questionItem of sortedQuestions) {
        const answerState = answers[questionItem.id];
        if (!answerState) continue;

        const dto: QuizAttemptAnswerCreateDto = {
          quizQuestionId: questionItem.id,
          selectedOptionId: answerState.selectedOptionId,
          openAnswerText: null,
        };

        await quizAttemptAnswersApi.createForAttempt(attempt.id, dto);
      }

      //Submit quizu – backend liczy wynik
      const submitRes = await quizAttemptsApi.edit(attempt.id, {
        id: attempt.id,
        submittedAt: new Date().toISOString(),
        scoreTotal: null,
        scorePercent: null,
        passed: null,
      });

      const result = submitRes.data; // QuizAttemptDto

      const scorePercent = result.scorePercent ?? 0;
      const scoreEarned =
        result.scorePercent != null && result.scoreTotal != null
          ? Math.round((scorePercent / 100) * result.scoreTotal * 100) / 100
          : null;

      const passedText = result.passed
        ? "Zdałeś ✅ wróć do swoich kursów i kliknij Ukończ aby pobrać certyfikat."
        : "Nie zdałeś ❌";

      const descriptionLines: string[] = [];

      if (result.scorePercent != null && result.scoreTotal != null) {
        if (scoreEarned != null) {
          descriptionLines.push(
            `Wynik: ${result.scorePercent}% (${scoreEarned}/${result.scoreTotal} pkt)`
          );
        } else {
          descriptionLines.push(`Wynik: ${result.scorePercent}%`);
        }
      }

      toast({
        title: passedText,
        description: descriptionLines.join("\n") || "Quiz zakończony.",
        status: result.passed ? "success" : "error",
        duration: 3500,
        isClosable: true,
      });

      navigate(-1);
    } catch (caughtError: any) {
      console.error("[QuizPage] Submit error:", caughtError);

      const status = caughtError?.response?.status;
      const url = caughtError?.config?.url;
      const method = caughtError?.config?.method;
      const data = caughtError?.response?.data;

      console.error("[QuizPage] Submit axios debug:", {
        status,
        method,
        url,
        data,
      });

      toast({
        title: "Błąd zapisu",
        description:
          typeof data === "string"
            ? data
            : "Nie udało się zapisać odpowiedzi do quizu.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Box p={6}>
        <Spinner />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={4}>
        <Box>
          <Heading size="lg">{quizTake?.title ?? "Quiz"}</Heading>
          <Text opacity={0.8}>
            {quizTake?.description ??
              "Odpowiedz na pytania i kliknij „Zakończ”."}
          </Text>

          <HStack mt={2} spacing={3}>
            {quizTake?.timeLimitSeconds != null &&
              quizTake.timeLimitSeconds > 0 && (
                <Badge fontSize="0.9em">
                  Czas:{" "}
                  {formatSeconds(remainingSeconds ?? quizTake.timeLimitSeconds)}
                </Badge>
              )}

            {quizTake?.maxAttempts != null && (
              <Badge fontSize="0.9em">
                Max podejść: {quizTake.maxAttempts}
              </Badge>
            )}
          </HStack>
        </Box>

        <HStack>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← Wróć
          </Button>

          <Badge fontSize="0.9em">
            Odpowiedzi: {answeredCount}/{totalCount}
          </Badge>
        </HStack>
      </HStack>

      <VStack align="stretch" spacing={4}>
        {sortedQuestions.map((questionItem: QuizTakeQuestionDto) => {
          const answerState = answers[questionItem.id] ?? {
            selectedOptionId: null,
          };

          const sortedOptions = [...(questionItem.options ?? [])].sort(
            (firstItem, secondItem) =>
              firstItem.orderIndex - secondItem.orderIndex
          );

          return (
            <Box
              key={questionItem.id}
              bg="gray.800"
              borderRadius="xl"
              p={5}
              boxShadow="md"
            >
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="bold" fontSize="lg">
                  {questionItem.orderIndex}. {questionItem.questionText}
                </Text>
                <Badge variant="subtle" colorScheme="yellow">
                  {questionItem.points} pkt
                </Badge>
              </HStack>

              <RadioGroup
                value={answerState.selectedOptionId?.toString() ?? ""}
                onChange={(value) =>
                  updateSingleChoice(questionItem.id, Number(value))
                }
              >
                <Stack mt={3}>
                  {sortedOptions.map((optionItem) => (
                    <Radio key={optionItem.id} value={optionItem.id.toString()}>
                      {optionItem.answerText}
                    </Radio>
                  ))}
                </Stack>
              </RadioGroup>

              <Divider mt={4} opacity={0.2} />
            </Box>
          );
        })}
      </VStack>

      <HStack justify="flex-end" mt={6}>
        <Button
          bg="yellow.400"
          color="black"
          fontWeight="bold"
          borderRadius="full"
          _hover={{ bg: "yellow.300" }}
          isLoading={submitting}
          loadingText="Wysyłanie..."
          onClick={() => void handleSubmit(false)}
          isDisabled={totalCount === 0}
        >
          Zakończ quiz
        </Button>
      </HStack>
    </Box>
  );
}
