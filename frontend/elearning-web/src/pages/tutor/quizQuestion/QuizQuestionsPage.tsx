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

import { quizQuestionsApi } from "../../../api/quizQuestionsApi";
import type { QuizQuestionDto } from "../../../types/quizQuestion";

export default function QuizQuestionsPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<QuizQuestionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await quizQuestionsApi.getAll();
        const data = res.data ?? [];

        data.sort((a, b) => a.quizId - b.quizId || a.orderIndex - b.orderIndex);

        setItems(data);
      } catch {
        setError("Nie udało się pobrać pytań quizowych.");
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
        String(x.points).includes(s) ||
        (x.quizTitle ?? "").toLowerCase().includes(s) ||
        (x.questionType ?? "").toLowerCase().includes(s) ||
        (x.questionText ?? "").toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  const handleDeactivate = async (id: number) => {
    try {
      await quizQuestionsApi.delete(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setError("Nie udało się dezaktywować pytania.");
    }
  };

  const handleExportExcel = () => {
    const rows = filteredItems.map((x) => ({
      ID: x.id,
      Quiz: x.quizTitle ?? "",
      Kolejność: x.orderIndex ?? "",
      Typ: x.questionType ?? "",
      Punkty: x.points ?? "",
      Pytanie: x.questionText ?? "",
      Aktywny: x.isActive ? "tak" : "nie",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "QuizQuestions");

    const cols = Object.keys(rows[0] ?? {}).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...rows.map((r: any) => String(r[key] ?? "").length)
        ) + 2,
    }));
    (worksheet as any)["!cols"] = cols;

    const fileName = `tutor-quiz-questions-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={2} spacing={3} flexWrap="wrap">
        <Heading>Pytania quizowe (Tutor)</Heading>

        <Button
          colorScheme="yellow"
          variant="outline"
          onClick={() => navigate(`/tutor/quiz-questions/new`)}
        >
          Utwórz
        </Button>
      </HStack>

      <Text color="gray.400" fontSize="md" mb={6}>
        Edytować i usuwać można tylko pytania należące do quizów zalogowanego
        tutora.
      </Text>

      <HStack mb={4} spacing={3} flexWrap="wrap" align="start">
        <Box flex="1" minW={{ base: "100%", md: "360px" }}>
          <Text color="gray.300" fontSize="sm" mb={1}>
            Szukaj
          </Text>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="id, quiz, typ, punkty, treść"
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
          Brak pytań do wyświetlenia.
        </Box>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <Box bg="gray.900" borderRadius="xl" overflow="hidden" boxShadow="lg">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Quiz</Th>
                <Th>Kolejność</Th>
                <Th>Typ</Th>
                <Th>Punkty</Th>
                <Th>Aktywny</Th>
                <Th textAlign="center">Akcje</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredItems.map((x) => (
                <Tr key={x.id}>
                  <Td>{x.id}</Td>
                  <Td maxW="360px" isTruncated>
                    {x.quizTitle ?? `Quiz #${x.quizId}`}
                  </Td>
                  <Td>{x.orderIndex ?? "—"}</Td>
                  <Td>
                    <Badge colorScheme="purple">{x.questionType ?? "—"}</Badge>
                  </Td>
                  <Td>{x.points ?? "—"}</Td>
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
                          navigate(`/tutor/quiz-questions/${x.id}`)
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
