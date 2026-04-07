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
import { quizzesApi } from "../../../api/quizzesApi";

import type { CourseDto } from "../../../types/course";
import type { ModuleDto } from "../../../types/module";
import type { QuizDto } from "../../../types/quiz";

export default function QuizzesPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<QuizDto[]>([]);
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

        const modulesResults = await Promise.allSettled(
          courses.map((c) => modulesApi.getCourseModules(c.id))
        );

        const modules: ModuleDto[] = [];
        for (const r of modulesResults) {
          if (r.status === "fulfilled") modules.push(...(r.value.data ?? []));
        }

        const quizResults = await Promise.allSettled(
          modules.map((m) => quizzesApi.getModuleQuiz(m.id))
        );

        const merged: QuizDto[] = [];
        for (const r of quizResults) {
          if (r.status === "fulfilled") {
            merged.push(r.value.data);
          }
        }

        const uniq = Array.from(new Map(merged.map((x) => [x.id, x])).values());

        uniq.sort((a, b) => {
          const am = a.moduleId ?? 0;
          const bm = b.moduleId ?? 0;
          return am - bm || (a.title ?? "").localeCompare(b.title ?? "");
        });

        setItems(uniq);
      } catch {
        setError("Nie udało się pobrać quizów tutora.");
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
        (x.title ?? "").toLowerCase().includes(s) ||
        (x.moduleTitle ?? "").toLowerCase().includes(s) ||
        (x.lessonTitle ?? "").toLowerCase().includes(s)
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
      Modul: x.moduleTitle ?? (x.moduleId ? `#${x.moduleId}` : ""),
      Lekcja: x.lessonTitle ?? (x.lessonId ? `#${x.lessonId}` : ""),
      Tytuł: x.title ?? "",
      Opis: x.description ?? "",
      "Limit (s)": x.timeLimitSeconds ?? "",
      "Próg %": x.passThresholdPct ?? "",
      "Max prób": x.maxAttempts ?? "",
      Aktywny: x.isActive ? "tak" : "nie",
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

    const fileName = `tutor-quizzes-report-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={2} spacing={3} flexWrap="wrap">
        <Heading>Quizy (Tutor)</Heading>

        <Button
          colorScheme="yellow"
          variant="outline"
          onClick={() => navigate(`/tutor/quizzes/new`)}
        >
          Utwórz
        </Button>
      </HStack>

      <Text color="gray.400" fontSize="md" mb={6}>
        Edytować i usuwać można tylko quizy należące do kursów zalogowanego
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
            placeholder="id, lekcja, tytuł, moduł"
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
          Brak quizów do wyświetlenia.
        </Box>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <Box bg="gray.900" borderRadius="xl" overflow="hidden" boxShadow="lg">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Moduł</Th>
                <Th>Lekcja</Th>
                <Th>Tytuł</Th>
                <Th>Próg %</Th>
                <Th>Limit</Th>
                <Th>Aktywny</Th>
                <Th textAlign="center">Akcje</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredItems.map((x) => (
                <Tr key={x.id}>
                  <Td>{x.id}</Td>
                  <Td maxW="240px" isTruncated>
                    {x.moduleTitle ??
                      (x.moduleId ? `Moduł #${x.moduleId}` : "—")}
                  </Td>
                  <Td maxW="240px" isTruncated>
                    {x.lessonTitle ??
                      (x.lessonId ? `Lekcja #${x.lessonId}` : "—")}
                  </Td>
                  <Td maxW="320px" isTruncated>
                    {x.title ?? "—"}
                  </Td>
                  <Td>{x.passThresholdPct ?? "—"}</Td>
                  <Td>{x.timeLimitSeconds ?? "—"}</Td>
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
                        onClick={() => navigate(`/tutor/quizzes/${x.id}`)}
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
