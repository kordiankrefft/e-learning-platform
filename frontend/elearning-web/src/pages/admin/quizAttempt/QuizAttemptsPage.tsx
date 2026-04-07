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

import { quizAttemptsApi } from "../../../api/quizAttemptsApi";
import type { QuizAttemptDto } from "../../../types/quizAttempt";

export default function QuizAttemptsAdminPage() {
  const [items, setItems] = useState<QuizAttemptDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await quizAttemptsApi.getAll();
        setItems(res.data ?? []);
      } catch {
        setError("Nie udało się pobrać podejść do quizów.");
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
        String(x.quizTitle).includes(s) ||
        String(x.userName).includes(s) ||
        String(x.scoreTotal ?? "").includes(s) ||
        String(x.scorePercent ?? "").includes(s)
      );
    });
  }, [items, q]);

  const handleDeactivate = async (id: number) => {
    try {
      await quizAttemptsApi.delete(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setError("Nie udało się dezaktywować podejścia.");
    }
  };

  const formatDateTime = (value?: string | Date | null) => {
    if (!value) return "—";
    const dt = typeof value === "string" ? new Date(value) : value;
    return dt.toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" });
  };

  const handleExportExcel = () => {
    const rows = filteredItems.map((x) => ({
      ID: x.id,
      Quiz: x.quizTitle,
      Użytkownik: x.userName,
      Start: formatDateTime(x.startedAt as any),
      Złożono: x.submittedAt ? formatDateTime(x.submittedAt as any) : "",
      "Wynik (pkt)": x.scoreTotal ?? "",
      "Wynik (%)": x.scorePercent ?? "",
      Zaliczone: x.passed == null ? "" : x.passed ? "tak" : "nie",
      Status: x.isActive ? "aktywny" : "nieaktywny",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "QuizAttempts");

    const cols = Object.keys(rows[0] ?? {}).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...rows.map((r: any) => String(r[key] ?? "").length)
        ) + 2,
    }));
    (worksheet as any)["!cols"] = cols;

    const fileName = `quiz-attempts-report-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <Heading mb={6}>Podejścia do quizów</Heading>

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj: id, quiz, użytkownik, wynik"
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
          Brak podejść do wyświetlenia.
        </Box>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <Box bg="gray.900" borderRadius="xl" overflow="hidden" boxShadow="lg">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Quiz</Th>
                <Th>Użytkownik</Th>
                <Th>Start</Th>
                <Th>Złożono</Th>
                <Th>Wynik (%)</Th>
                <Th>Zaliczone</Th>
                <Th>Status</Th>
                <Th textAlign="center">Akcje</Th>
              </Tr>
            </Thead>

            <Tbody>
              {filteredItems.map((x) => (
                <Tr key={x.id}>
                  <Td>{x.id}</Td>
                  <Td>{x.quizTitle}</Td>
                  <Td>{x.userName}</Td>
                  <Td whiteSpace="nowrap">
                    {formatDateTime(x.startedAt as any)}
                  </Td>
                  <Td whiteSpace="nowrap">
                    {x.submittedAt ? formatDateTime(x.submittedAt as any) : "—"}
                  </Td>
                  <Td>{x.scorePercent ?? "—"}</Td>
                  <Td>
                    {x.passed == null ? (
                      <Badge colorScheme="gray">—</Badge>
                    ) : (
                      <Badge colorScheme={x.passed ? "green" : "red"}>
                        {x.passed ? "tak" : "nie"}
                      </Badge>
                    )}
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
                        onClick={() => navigate(`/admin/quiz-attempts/${x.id}`)}
                      >
                        Szczegóły
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
