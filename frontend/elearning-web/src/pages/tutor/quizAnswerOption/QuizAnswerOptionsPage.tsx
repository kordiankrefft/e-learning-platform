import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Heading,
  HStack,
  Button,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import { quizAnswerOptionsApi } from "../../../api/quizAnswerOptionsApi";
import type { QuizAnswerOptionDto } from "../../../types/quizAnswerOption";

export default function QuizAnswerOptionsPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<QuizAnswerOptionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await quizAnswerOptionsApi.getAll();
        const data = res.data ?? [];

        data.sort(
          (a, b) =>
            a.quizQuestionId - b.quizQuestionId || a.orderIndex - b.orderIndex
        );

        setItems(data);
      } catch {
        setError("Nie udało się pobrać opcji odpowiedzi.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredItems = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;

    return items.filter((x) => {
      return (
        String(x.id).includes(s) ||
        String(x.orderIndex).includes(s) ||
        (x.quizQuestionText ?? "").toLowerCase().includes(s) ||
        (x.answerText ?? "").toLowerCase().includes(s) ||
        (x.isCorrect ? "tak" : "nie").includes(s)
      );
    });
  }, [items, q]);

  const handleDeactivate = async (id: number) => {
    try {
      await quizAnswerOptionsApi.delete(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setError("Nie udało się dezaktywować opcji odpowiedzi.");
    }
  };

  const handleExportExcel = () => {
    const rows = filteredItems.map((x) => ({
      ID: x.id,
      Pytanie: x.quizQuestionText ?? "",
      Kolejność: x.orderIndex ?? "",
      Odpowiedź: x.answerText ?? "",
      Poprawna: x.isCorrect ? "tak" : "nie",
      Aktywny: x.isActive ? "tak" : "nie",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AnswerOptions");

    const cols = Object.keys(rows[0] ?? {}).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...rows.map((r: any) => String(r[key] ?? "").length)
        ) + 2,
    }));
    (worksheet as any)["!cols"] = cols;

    const fileName = `tutor-quiz-answer-options-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={2} spacing={3} flexWrap="wrap">
        <Heading>Opcje odpowiedzi (Tutor)</Heading>

        <Button
          colorScheme="yellow"
          variant="outline"
          onClick={() => navigate(`/tutor/quiz-answer-options/new`)}
        >
          Utwórz
        </Button>
      </HStack>

      <Text color="gray.400" fontSize="md" mb={6}>
        Edytować i usuwać można tylko opcje odpowiedzi należące do pytań quizów
        zalogowanego tutora.
      </Text>

      <HStack mb={4} spacing={3} flexWrap="wrap" align="start">
        <Box flex="1" minW={{ base: "100%", md: "360px" }}>
          <Text color="gray.300" fontSize="sm" mb={1}>
            Szukaj
          </Text>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="id pytanie, odpowiedź, poprawność"
            bg="gray.800"
            borderColor="gray.700"
          />
        </Box>

        <Button
          size="sm"
          variant="outline"
          onClick={handleExportExcel}
          alignSelf="end"
        >
          Export excel
        </Button>
      </HStack>

      {error && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {loading && (
        <Box py={10} textAlign="center">
          <Spinner size="lg" />
        </Box>
      )}

      {!loading && !error && filteredItems.length === 0 && (
        <Box color="gray.400" py={8}>
          Brak opcji odpowiedzi do wyświetlenia.
        </Box>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <Box bg="gray.900" borderRadius="xl" overflow="hidden" boxShadow="lg">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Pytanie</Th>
                <Th>Kolejność</Th>
                <Th>Odpowiedź</Th>
                <Th>Poprawna</Th>
                <Th>Aktywny</Th>
                <Th textAlign="center">Akcje</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredItems.map((x) => (
                <Tr key={x.id}>
                  <Td>{x.id}</Td>
                  <Td maxW="380px" isTruncated>
                    {x.quizQuestionText ?? `Pytanie #${x.quizQuestionId}`}
                  </Td>
                  <Td>{x.orderIndex ?? "—"}</Td>
                  <Td maxW="340px" isTruncated>
                    {x.answerText ?? "—"}
                  </Td>
                  <Td>
                    <Badge colorScheme={x.isCorrect ? "green" : "gray"}>
                      {x.isCorrect ? "tak" : "nie"}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={x.isActive ? "green" : "gray"}>
                      {x.isActive ? "aktywny" : "nieaktywny"}
                    </Badge>
                  </Td>
                  <Td textAlign="right">
                    <HStack justify="flex-end">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() =>
                          navigate(`/tutor/quiz-answer-options/${x.id}`)
                        }
                      >
                        Edytuj
                      </Button>
                      <Button
                        size="xs"
                        colorScheme="red"
                        variant="outline"
                        onClick={() => handleDeactivate(x.id)}
                      >
                        Dezaktywuj
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
