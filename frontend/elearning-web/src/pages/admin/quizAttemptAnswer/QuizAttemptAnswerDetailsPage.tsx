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
} from "@chakra-ui/react";

import { quizAttemptAnswersApi } from "../../../api/quizAttemptAnswersApi";
import type { QuizAttemptAnswerDto } from "../../../types/quizAttemptAnswer";

export default function QuizAttemptAnswerDetailsPage() {
  const { id } = useParams();
  const answerId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<QuizAttemptAnswerDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!answerId || Number.isNaN(answerId)) {
      setError("Nieprawidłowe ID odpowiedzi.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await quizAttemptAnswersApi.getById(answerId);
      setItem(res.data);
    } catch {
      setError("Nie udało się pobrać szczegółów odpowiedzi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [answerId]);

  return (
    <Box maxW="5xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6}>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Wróć
        </Button>
      </HStack>

      <Heading mb={2}>Szczegóły odpowiedzi</Heading>
      <Text color="gray.400" mb={6}>
        Podgląd odpowiedzi udzielonej w podejściu do quizu.
      </Text>

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
                {item.isActive ? "AKTYWNA" : "NIEAKTYWNA"}
              </Badge>
              <Badge colorScheme="purple">
                Podejście ID: {item.quizAttemptId}
              </Badge>
              <Badge colorScheme="yellow">
                Pytanie: {item.quizQuestionText}
              </Badge>
            </HStack>

            <Divider borderColor="gray.700" />

            <Box>
              <Text color="gray.300">
                <b>Wybrana opcja:</b> {item.selectedOptionText ?? "—"}
              </Text>

              <Text color="gray.300" mt={3}>
                <b>Odpowiedź otwarta:</b>
              </Text>
              <Box
                mt={2}
                bg="gray.800"
                border="1px solid"
                borderColor="gray.700"
                borderRadius="md"
                p={4}
                whiteSpace="pre-wrap"
              >
                {item.openAnswerText ?? "—"}
              </Box>

              <Text color="gray.300" mt={4}>
                <b>Oceniono jako poprawna:</b>{" "}
                {item.isMarkedCorrect == null ? (
                  <Badge ml={2} colorScheme="gray">
                    —
                  </Badge>
                ) : (
                  <Badge
                    ml={2}
                    colorScheme={item.isMarkedCorrect ? "green" : "red"}
                  >
                    {item.isMarkedCorrect ? "tak" : "nie"}
                  </Badge>
                )}
              </Text>
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
