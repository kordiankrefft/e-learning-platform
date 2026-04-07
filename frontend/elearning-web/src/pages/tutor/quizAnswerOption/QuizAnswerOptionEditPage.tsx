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
  Switch,
} from "@chakra-ui/react";

import { quizAnswerOptionsApi } from "../../../api/quizAnswerOptionsApi";
import type {
  QuizAnswerOptionDto,
  QuizAnswerOptionEditDto,
} from "../../../types/quizAnswerOption";

export default function QuizAnswerOptionEditPage() {
  const { id } = useParams();
  const optionId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<QuizAnswerOptionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [answerText, setAnswerText] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [orderIndex, setOrderIndex] = useState<string>("1");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

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
      setAnswerText(data.answerText ?? "");
      setIsCorrect(!!data.isCorrect);
      setOrderIndex(String(data.orderIndex ?? 1));
    } catch {
      setError("Nie udało się pobrać danych opcji odpowiedzi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [optionId]);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!item) {
      setSaveErr("Nie wczytano opcji odpowiedzi.");
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

      const dto: QuizAnswerOptionEditDto = {
        id: optionId,
        quizQuestionId: item.quizQuestionId,
        answerText: answerText.trim(),
        isCorrect,
        orderIndex: oi,
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

      <Heading mb={2}>Edytuj opcję odpowiedzi (Tutor)</Heading>
      <Text color="gray.400" mb={6}>
        Edycja danych opcji odpowiedzi
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
                Pytanie: {item.quizQuestionText}
              </Badge>
              <Badge colorScheme={item.isCorrect ? "green" : "gray"}>
                {item.isCorrect ? "POPRAWNA" : "NIEPOPRAWNA"}
              </Badge>
            </HStack>

            <Divider borderColor="gray.700" />

            <FormControl>
              <FormLabel>Treść pytania</FormLabel>
              <Textarea
                bg="gray.800"
                borderColor="gray.700"
                value={item.quizQuestionText ?? ""}
                isReadOnly
                minH="90px"
              />
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
