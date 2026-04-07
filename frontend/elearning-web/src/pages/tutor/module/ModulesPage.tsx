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

import { coursesApi } from "../../../api/coursesApi";
import { modulesApi } from "../../../api/modulesApi";

import type { CourseDto } from "../../../types/course";
import type { ModuleDto } from "../../../types/module";

export default function ModulesPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<ModuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const coursesRes = await coursesApi.getCourses();
        const courses: CourseDto[] = coursesRes.data ?? [];

        const results = await Promise.allSettled(
          courses.map((c) => modulesApi.getCourseModules(c.id))
        );

        const merged: ModuleDto[] = [];
        for (const r of results) {
          if (r.status === "fulfilled") {
            merged.push(...(r.value.data ?? []));
          }
        }

        const uniq = Array.from(new Map(merged.map((m) => [m.id, m])).values());

        uniq.sort(
          (a, b) => a.courseId - b.courseId || a.orderIndex - b.orderIndex
        );

        setItems(uniq);
      } catch {
        setError("Nie udało się pobrać modułów tutora.");
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
        String(x.orderIndex ?? "").includes(s) ||
        (x.title ?? "").toLowerCase().includes(s) ||
        (x.courseTitle ?? "").toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  const handleDeactivate = async (id: number) => {
    try {
      await modulesApi.deleteModule(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setError("Nie udało się dezaktywować modułu.");
    }
  };

  const handleExportExcel = () => {
    const rows = filteredItems.map((x) => ({
      ID: x.id,
      Kurs: x.courseTitle ?? "",
      Kolejność: x.orderIndex ?? "",
      Tytuł: x.title ?? "",
      Opis: x.description ?? "",
      Aktywny: x.isActive ? "tak" : "nie",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Modules");

    const cols = Object.keys(rows[0] ?? {}).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...rows.map((r: any) => String(r[key] ?? "").length)
        ) + 2,
    }));
    (worksheet as any)["!cols"] = cols;

    const fileName = `tutor-modules-report-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={2} spacing={3} flexWrap="wrap">
        <Heading>Moduły (Tutor)</Heading>

        <Button
          colorScheme="yellow"
          variant="outline"
          onClick={() => navigate(`/tutor/modules/new`)}
        >
          Utwórz
        </Button>
      </HStack>

      <Text color="gray.400" fontSize="md" mb={6}>
        Edytować i usuwać można tylko moduły należące do kursów zalogowanego
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
            placeholder="id, kurs, kolejność, tytuł"
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
          Brak modułów do wyświetlenia.
        </Box>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <Box bg="gray.900" borderRadius="xl" overflow="hidden" boxShadow="lg">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Kurs</Th>
                <Th>Kolejność</Th>
                <Th>Tytuł</Th>
                <Th>Status</Th>
                <Th textAlign="center">Akcje</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredItems.map((x) => (
                <Tr key={x.id}>
                  <Td>{x.id}</Td>
                  <Td maxW="240px" isTruncated>
                    {x.courseTitle ?? `Kurs #${x.courseId}`}
                  </Td>
                  <Td>{x.orderIndex ?? "—"}</Td>
                  <Td maxW="260px" isTruncated>
                    {x.title ?? "—"}
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
                        onClick={() => navigate(`/tutor/modules/${x.id}`)}
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
