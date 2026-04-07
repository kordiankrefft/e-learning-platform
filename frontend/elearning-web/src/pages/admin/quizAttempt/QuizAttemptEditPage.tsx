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
  Select,
} from "@chakra-ui/react";

import { quizAttemptsApi } from "../../../api/quizAttemptsApi";
import type {
  QuizAttemptDto,
  QuizAttemptEditDto,
} from "../../../types/quizAttempt";

export default function QuizAttemptEditPage() {
  const { id } = useParams();
  const attemptId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<QuizAttemptDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [submittedAt, setSubmittedAt] = useState(""); // datetime-local
  const [scoreTotal, setScoreTotal] = useState("");
  const [scorePercent, setScorePercent] = useState("");
  const [passed, setPassed] = useState<"" | "true" | "false">("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const toDateTimeLocalValue = (value?: string | Date | null) => {
    if (!value) return "";
    const d = typeof value === "string" ? new Date(value) : value;
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  const formatDateTime = (value?: string | Date | null) => {
    if (!value) return "—";
    const dt = typeof value === "string" ? new Date(value) : value;
    return dt.toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" });
  };

  const load = async () => {
    if (!attemptId || Number.isNaN(attemptId)) {
      setError("Nieprawidłowe ID podejścia.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await quizAttemptsApi.getById(attemptId);
      const data = res.data;

      setItem(data);

      setSubmittedAt(
        data.submittedAt ? toDateTimeLocalValue(data.submittedAt as any) : ""
      );
      setScoreTotal(data.scoreTotal != null ? String(data.scoreTotal) : "");
      setScorePercent(
        data.scorePercent != null ? String(data.scorePercent) : ""
      );
      setPassed(data.passed == null ? "" : data.passed ? "true" : "false");
    } catch {
      setError("Nie udało się pobrać szczegółów podejścia.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [attemptId]);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    try {
      setSaving(true);

      const dto: QuizAttemptEditDto = {
        id: attemptId,
        submittedAt: submittedAt ? new Date(submittedAt).toISOString() : null,
        scoreTotal: scoreTotal.trim() ? Number(scoreTotal) : null,
        scorePercent: scorePercent.trim() ? Number(scorePercent) : null,
        passed: passed === "" ? null : passed === "true",
      };

      await quizAttemptsApi.edit(attemptId, dto);

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

      <Heading mb={2}>Szczegóły podejścia</Heading>
      <Text color="gray.400" mb={6}>
        Podgląd i ewentualna korekta wyniku podejścia do quizu.
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
                {item.isActive ? "AKTYWNY" : "NIEAKTYWNY"}
              </Badge>
              <Badge colorScheme="purple">Quiz: {item.quizTitle}</Badge>
              <Badge colorScheme="yellow">Użytkownik: {item.userName}</Badge>
            </HStack>

            <Divider borderColor="gray.700" />

            <Box>
              <Text color="gray.300">
                <b>Start:</b> {formatDateTime(item.startedAt as any)}
              </Text>
              <Text color="gray.300" mt={2}>
                <b>Złożono:</b>{" "}
                {item.submittedAt
                  ? formatDateTime(item.submittedAt as any)
                  : "—"}
              </Text>
            </Box>

            <Divider borderColor="gray.700" />

            <Box>
              <Heading size="md" mb={3}>
                Wynik
              </Heading>

              <Stack spacing={4}>
                <HStack spacing={4} flexWrap="wrap">
                  <FormControl maxW="280px">
                    <FormLabel>Złożono (data)</FormLabel>
                    <Input
                      type="datetime-local"
                      bg="gray.800"
                      borderColor="gray.700"
                      value={submittedAt}
                      onChange={(e) => setSubmittedAt(e.target.value)}
                    />
                  </FormControl>

                  <FormControl maxW="220px">
                    <FormLabel>Wynik (pkt)</FormLabel>
                    <Input
                      bg="gray.800"
                      borderColor="gray.700"
                      value={scoreTotal}
                      onChange={(e) => setScoreTotal(e.target.value)}
                      inputMode="decimal"
                    />
                  </FormControl>

                  <FormControl maxW="220px">
                    <FormLabel>Wynik (%)</FormLabel>
                    <Input
                      bg="gray.800"
                      borderColor="gray.700"
                      value={scorePercent}
                      onChange={(e) => setScorePercent(e.target.value)}
                      inputMode="decimal"
                    />
                  </FormControl>

                  <FormControl maxW="220px">
                    <FormLabel>Zaliczone</FormLabel>
                    <Select
                      bg="gray.800"
                      borderColor="gray.700"
                      value={passed}
                      onChange={(e) =>
                        setPassed(e.target.value as "" | "true" | "false")
                      }
                    >
                      <option value="">—</option>
                      <option value="true">tak</option>
                      <option value="false">nie</option>
                    </Select>
                  </FormControl>
                </HStack>

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
          </Stack>
        </Box>
      )}
    </Box>
  );
}
