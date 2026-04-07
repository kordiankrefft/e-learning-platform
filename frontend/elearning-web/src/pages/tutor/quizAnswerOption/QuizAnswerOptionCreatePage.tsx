import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Switch,
  Spinner,
} from "@chakra-ui/react";

import { quizQuestionsApi } from "../../../api/quizQuestionsApi";
import { quizAnswerOptionsApi } from "../../../api/quizAnswerOptionsApi";

import type { QuizQuestionDto } from "../../../types/quizQuestion";
import type { QuizAnswerOptionCreateDto } from "../../../types/quizAnswerOption";

export default function QuizAnswerOptionCreatePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const questionIdFromUrl = useMemo(() => {
    const raw = params.get("questionId");
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params]);

  const [questions, setQuestions] = useState<QuizQuestionDto[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  const [quizQuestionId, setQuizQuestionId] = useState<string>(
    questionIdFromUrl != null ? String(questionIdFromUrl) : ""
  );

  const [answerText, setAnswerText] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [orderIndex, setOrderIndex] = useState<string>("1");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setQuestionsLoading(true);
        setSaveErr(null);

        const res = await quizQuestionsApi.getAll();
        const data: QuizQuestionDto[] = res.data ?? [];

        data.sort((a, b) => a.quizId - b.quizId || a.orderIndex - b.orderIndex);

        setQuestions(data);
      } catch {
        setSaveErr("Nie udało się pobrać pytań (do wyboru pytania).");
        setQuestions([]);
      } finally {
        setQuestionsLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    const qid = Number(quizQuestionId);
    if (!Number.isFinite(qid) || qid <= 0) {
      setSaveErr("Wybierz pytanie.");
      return;
    }

    if (!answerText.trim()) {
      setSaveErr("Treść odpowiedzi jest wymagana.");
      return;
    }

    const oi = Number(orderIndex);
    if (!Number.isFinite(oi) || oi <= 0) {
      setSaveErr("Kolejność musi być liczbą > 0.");
      return;
    }

    try {
      setSaving(true);

      const dto: QuizAnswerOptionCreateDto = {
        quizQuestionId: qid,
        answerText: answerText.trim(),
        isCorrect,
        orderIndex: oi,
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

      <Heading mb={2}>Utwórz opcję odpowiedzi (Tutor)</Heading>
      <Text color="gray.400" mb={6}>
        Opcja odpowiedzi zostanie dodana do wybranego pytania.
      </Text>

      {saveErr && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {saveErr}
        </Alert>
      )}

      {saveMsg && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          {saveMsg}
        </Alert>
      )}

      <Box bg="gray.900" borderRadius="xl" p={6} boxShadow="lg">
        <Stack spacing={5}>
          <Divider borderColor="gray.700" />

          <FormControl>
            <FormLabel>Pytanie *</FormLabel>

            {questionsLoading ? (
              <Box py={2}>
                <Spinner size="sm" />
              </Box>
            ) : (
              <Select
                bg="gray.800"
                borderColor="gray.700"
                value={quizQuestionId}
                onChange={(e) => setQuizQuestionId(e.target.value)}
                placeholder="Wybierz pytanie"
              >
                {questions.map((qq) => (
                  <option key={qq.id} value={qq.id}>
                    Quiz #{qq.quizId} • {qq.questionText}
                  </option>
                ))}
              </Select>
            )}
          </FormControl>

          <FormControl>
            <FormLabel>Treść odpowiedzi *</FormLabel>
            <Textarea
              bg="gray.800"
              borderColor="gray.700"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              minH="120px"
            />
          </FormControl>

          <FormControl display="flex" alignItems="center" gap={3}>
            <Switch
              isChecked={isCorrect}
              onChange={(e) => setIsCorrect(e.target.checked)}
            />
            <FormLabel m="0">Poprawna</FormLabel>
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
              isDisabled={questionsLoading}
            >
              Utwórz
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
}
