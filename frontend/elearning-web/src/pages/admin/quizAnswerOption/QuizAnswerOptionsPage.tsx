import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Heading,
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
  Button,
  HStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import { quizAnswerOptionsApi } from "../../../api/quizAnswerOptionsApi";
import type { QuizAnswerOptionDto } from "../../../types/quizAnswerOption";

export default function QuizAnswerOptionsAdminPage() {
  const [items, setItems] = useState<QuizAnswerOptionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await quizAnswerOptionsApi.getAll();
        setItems(res.data ?? []);
      } catch {
        setError("Nie udało się pobrać opcji odpowiedzi.");
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
      Pytanie: x.quizQuestionText,
      Kolejność: x.orderIndex,
      "Treść odpowiedzi": x.answerText ?? "",
      Poprawna: x.isCorrect ? "tak" : "nie",
      Status: x.isActive ? "aktywny" : "nieaktywny",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "QuizAnswerOptions");

    const cols = Object.keys(rows[0] ?? {}).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...rows.map((r: any) => String(r[key] ?? "").length)
        ) + 2,
    }));
    (worksheet as any)["!cols"] = cols;

    const fileName = `quiz-answer-options-report-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6} spacing={3} flexWrap="wrap">
        <Heading>Opcje odpowiedzi (quiz)</Heading>

        <Button
          colorScheme="yellow"
          variant="outline"
          onClick={() => navigate("/admin/quiz-answer-options/new")}
        >
          Utwórz
        </Button>
      </HStack>

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj: id, pytanie, treść"
          bg="gray.800"
          borderColor="gray.700"
          maxW="520px"
        />
        <Button size="sm" variant="outline" onClick={handleExportExcel}>
          Eksport do Excela
        </Button>
      </HStack>

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
                <Th>Status</Th>
                <Th textAlign="center">Akcje</Th>
              </Tr>
            </Thead>

            <Tbody>
              {filteredItems.map((x) => (
                <Tr key={x.id}>
                  <Td>{x.id}</Td>
                  <Td>{x.quizQuestionText}</Td>
                  <Td>{x.orderIndex}</Td>
                  <Td maxW="620px" isTruncated>
                    {x.answerText ?? "-"}
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
                          navigate(`/admin/quiz-answer-options/${x.id}`)
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
