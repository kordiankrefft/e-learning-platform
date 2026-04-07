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

import { quizzesApi } from "../../../api/quizzesApi";
import type { QuizDto } from "../../../types/quiz";

export default function QuizzesAdminPage() {
  const [items, setItems] = useState<QuizDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await quizzesApi.getQuizzes();
        setItems(res.data ?? []);
      } catch {
        setError("Nie udało się pobrać quizów.");
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
        String(x.lessonTitle ?? "").includes(s) ||
        String(x.moduleTitle ?? "").includes(s) ||
        (x.title ?? "").toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  const handleDeactivate = async (id: number) => {
    try {
      await quizzesApi.deleteQuiz(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setError("Nie udało się dezaktywować quizu.");
    }
  };

  const handleExportExcel = () => {
    const rows = filteredItems.map((x) => ({
      ID: x.id,
      Lekcja: x.lessonTitle ?? "",
      Moduł: x.moduleTitle ?? "",
      Tytuł: x.title ?? "",
      Opis: x.description ?? "",
      "Limit czasu (sek.)": x.timeLimitSeconds ?? "",
      "Próg zaliczenia (%)": x.passThresholdPct ?? "",
      "Maks. podejść": x.maxAttempts ?? "",
      Status: x.isActive ? "aktywny" : "nieaktywny",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Quizzes");

    const cols = Object.keys(rows[0] ?? {}).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...rows.map((r: any) => String(r[key] ?? "").length)
        ) + 2,
    }));
    (worksheet as any)["!cols"] = cols;

    const fileName = `quizzes-report-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6} spacing={3} flexWrap="wrap">
        <Heading>Quizy</Heading>

        <Button
          colorScheme="yellow"
          variant="outline"
          onClick={() => navigate("/admin/quizzes/new")}
        >
          Utwórz
        </Button>
      </HStack>

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj: id, tytuł, lekcja, moduł"
          bg="gray.800"
          borderColor="gray.700"
          maxW="520px"
        />
        <Button size="sm" variant="outline" onClick={handleExportExcel}>
          Export excel
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
          Brak quizów do wyświetlenia.
        </Box>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <Box bg="gray.900" borderRadius="xl" overflow="hidden" boxShadow="lg">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Lekcja</Th>
                <Th>Moduł</Th>
                <Th>Tytuł</Th>
                <Th>Limit czasu</Th>
                <Th>Próg (%)</Th>
                <Th>Max podejść</Th>
                <Th>Status</Th>
                <Th textAlign="center">Akcje</Th>
              </Tr>
            </Thead>

            <Tbody>
              {filteredItems.map((x) => (
                <Tr key={x.id}>
                  <Td>{x.id}</Td>
                  <Td>{x.lessonTitle ?? "—"}</Td>
                  <Td>{x.moduleTitle ?? "—"}</Td>
                  <Td maxW="520px" isTruncated>
                    {x.title ?? "-"}
                  </Td>
                  <Td>{x.timeLimitSeconds ?? "—"}</Td>
                  <Td>{x.passThresholdPct ?? "—"}</Td>
                  <Td>{x.maxAttempts ?? "—"}</Td>
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
                        onClick={() => navigate(`/admin/quizzes/${x.id}`)}
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
