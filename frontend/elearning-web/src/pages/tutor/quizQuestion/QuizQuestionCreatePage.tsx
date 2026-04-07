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
  Spinner,
} from "@chakra-ui/react";

import { quizzesApi } from "../../../api/quizzesApi";
import { quizQuestionsApi } from "../../../api/quizQuestionsApi";

import type { QuizDto } from "../../../types/quiz";
import type { QuizQuestionCreateDto } from "../../../types/quizQuestion";

export default function QuizQuestionCreatePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const quizIdFromUrl = useMemo(() => {
    const raw = params.get("quizId");
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params]);

  const [quizzes, setQuizzes] = useState<QuizDto[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(true);

  const [quizId, setQuizId] = useState<string>(
    quizIdFromUrl != null ? String(quizIdFromUrl) : ""
  );

  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("singleChoice");
  const [points, setPoints] = useState<string>("1");
  const [orderIndex, setOrderIndex] = useState<string>("1");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setQuizzesLoading(true);
        setSaveErr(null);

        const res = await quizzesApi.getQuizzes();
        const data: QuizDto[] = res.data ?? [];

        data.sort((a, b) => {
          const am = a.moduleId ?? 0;
          const bm = b.moduleId ?? 0;
          return am - bm || (a.title ?? "").localeCompare(b.title ?? "");
        });

        setQuizzes(data);
      } catch {
        setSaveErr("Nie udało się pobrać quizów (do wyboru quizu).");
        setQuizzes([]);
      } finally {
        setQuizzesLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    const qid = Number(quizId);
    if (!Number.isFinite(qid) || qid <= 0) {
      setSaveErr("Wybierz quiz.");
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

      const dto: QuizQuestionCreateDto = {
        quizId: qid,
        questionText: questionText.trim(),
        questionType: questionType.trim(),
        points: pts,
        orderIndex: oi,
      };

      await quizQuestionsApi.create(dto);

      setSaveMsg("Utworzono pytanie.");
      navigate(-1);
    } catch {
      setSaveErr("Nie udało się utworzyć pytania.");
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

      <Heading mb={2}>Utwórz pytanie (Tutor)</Heading>
      <Text color="gray.400" mb={6}>
        Pytanie zostanie dodane do wybranego quizu.
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
            <FormLabel>Quiz *</FormLabel>

            {quizzesLoading ? (
              <Box py={2}>
                <Spinner size="sm" />
              </Box>
            ) : (
              <Select
                bg="gray.800"
                borderColor="gray.700"
                value={quizId}
                onChange={(e) => setQuizId(e.target.value)}
                placeholder="Wybierz quiz"
              >
                {quizzes.map((qz) => (
                  <option key={qz.id} value={qz.id}>
                    {qz.moduleTitle ??
                      (qz.moduleId ? `Moduł #${qz.moduleId}` : "—")}{" "}
                    • {qz.title}
                  </option>
                ))}
              </Select>
            )}
          </FormControl>

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
              placeholder="np. singleChoice, fillBlank..."
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
              isDisabled={quizzesLoading}
            >
              Utwórz
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
}
