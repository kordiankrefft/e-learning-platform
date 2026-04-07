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

import { lessonContentBlocksApi } from "../../../api/lessonContentBlocksApi";
import type { LessonContentBlockDto } from "../../../types/lessonContentBlock";

export default function LessonContentBlocksAdminPage() {
  const [items, setItems] = useState<LessonContentBlockDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await lessonContentBlocksApi.getAll();
        setItems(res.data ?? []);
      } catch {
        setError("Nie udało się pobrać bloków treści lekcji.");
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
        String(x.lessonTitle).includes(s) ||
        (x.blockType ?? "").toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  const handleDeactivate = async (id: number) => {
    try {
      await lessonContentBlocksApi.delete(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setError("Nie udało się dezaktywować bloku treści.");
    }
  };

  const handleExportExcel = () => {
    const rows = filteredItems.map((x) => ({
      ID: x.id,
      Lekcja: x.lessonTitle,
      "Typ bloku": x.blockType ?? "",
      "Kolejność (index)": x.orderIndex,
      Treść: x.content ?? "",
      Status: x.isActive ? "aktywny" : "nieaktywny",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LessonContentBlocks");

    const cols = Object.keys(rows[0] ?? {}).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...rows.map((r: any) => String(r[key] ?? "").length)
        ) + 2,
    }));
    (worksheet as any)["!cols"] = cols;

    const fileName = `lesson-content-blocks-report-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6} spacing={3} flexWrap="wrap">
        <Heading>Bloki treści lekcji</Heading>

        <Button
          colorScheme="yellow"
          variant="outline"
          onClick={() => navigate("/admin/lesson-content-blocks/new")}
        >
          Utwórz
        </Button>
      </HStack>

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj: id, lekcja, typ"
          bg="gray.800"
          borderColor="gray.700"
          maxW="520px"
        />
        <Button size="sm" variant="outline" onClick={handleExportExcel}>
          Export Excel
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
          Brak bloków treści do wyświetlenia.
        </Box>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <Box bg="gray.900" borderRadius="xl" overflow="hidden" boxShadow="lg">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Lekcja</Th>
                <Th>Typ bloku</Th>
                <Th>Kolejność</Th>
                <Th>Treść</Th>
                <Th>Status</Th>
                <Th textAlign="center">Akcje</Th>
              </Tr>
            </Thead>

            <Tbody>
              {filteredItems.map((x) => (
                <Tr key={x.id}>
                  <Td>{x.id}</Td>
                  <Td>{x.lessonTitle}</Td>
                  <Td>{x.blockType ?? "-"}</Td>
                  <Td>{x.orderIndex}</Td>
                  <Td maxW="520px" isTruncated>
                    {x.content ?? "—"}
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
                          navigate(`/admin/lesson-content-blocks/${x.id}`)
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
