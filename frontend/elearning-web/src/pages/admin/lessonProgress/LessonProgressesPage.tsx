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

import { lessonProgressApi } from "../../../api/lessonProgressesApi";
import type { LessonProgressDto } from "../../../types/lessonProgress";

export default function LessonProgressesAdminPage() {
  const [items, setItems] = useState<LessonProgressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await lessonProgressApi.getAll();
        setItems(res.data ?? []);
      } catch {
        setError("Nie udało się pobrać postępów lekcji.");
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
        String(x.userName).includes(s) ||
        String(x.lessonTitle).includes(s) ||
        String(x.progressPercent).includes(s) ||
        (x.lastViewedAt
          ? String(x.lastViewedAt).toLowerCase().includes(s)
          : false)
      );
    });
  }, [items, q]);

  const handleDeactivate = async (id: number) => {
    try {
      await lessonProgressApi.delete(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setError("Nie udało się dezaktywować rekordu postępu.");
    }
  };

  const handleExportExcel = () => {
    const rows = filteredItems.map((x) => ({
      ID: x.id,
      Użytkownik: x.userName,
      Lekcja: x.lessonTitle,
      "Postęp (%)": Number(x.progressPercent),
      "Ostatnio oglądane": x.lastViewedAt
        ? new Date(x.lastViewedAt).toLocaleString("pl-PL", {
            timeZone: "Europe/Warsaw",
          })
        : "",
      Status: x.isActive ? "aktywny" : "nieaktywny",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LessonProgress");

    const cols = Object.keys(rows[0] ?? {}).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...rows.map((r: any) => String(r[key] ?? "").length)
        ) + 2,
    }));
    (worksheet as any)["!cols"] = cols;

    const fileName = `lesson-progress-report-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <Heading mb={6}>Postępy lekcji</Heading>

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj: id, użytkownik, lekcja, postęp"
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
          Brak rekordów postępu do wyświetlenia.
        </Box>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <Box bg="gray.900" borderRadius="xl" overflow="hidden" boxShadow="lg">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Użytkownik</Th>
                <Th>Lekcja</Th>
                <Th>Postęp (%)</Th>
                <Th>Ostatnio oglądane</Th>
                <Th>Status</Th>
                <Th textAlign="center">Akcje</Th>
              </Tr>
            </Thead>

            <Tbody>
              {filteredItems.map((x) => (
                <Tr key={x.id}>
                  <Td>{x.id}</Td>
                  <Td>{x.userName}</Td>
                  <Td>{x.lessonTitle}</Td>
                  <Td>{Number(x.progressPercent)}%</Td>
                  <Td whiteSpace="nowrap">
                    {x.lastViewedAt
                      ? new Date(x.lastViewedAt).toLocaleString("pl-PL", {
                          timeZone: "Europe/Warsaw",
                        })
                      : "—"}
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
                          navigate(`/admin/lesson-progress/${x.id}`)
                        }
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
