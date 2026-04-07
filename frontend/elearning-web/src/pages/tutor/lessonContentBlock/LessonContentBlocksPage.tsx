import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import * as XLSX from "xlsx";

import { coursesApi } from "../../../api/coursesApi";
import { modulesApi } from "../../../api/modulesApi";
import { lessonsApi } from "../../../api/lessonsApi";
import { lessonContentBlocksApi } from "../../../api/lessonContentBlocksApi";

import type { CourseDto } from "../../../types/course";
import type { ModuleDto } from "../../../types/module";
import type { LessonDto } from "../../../types/lesson";
import type { LessonContentBlockDto } from "../../../types/lessonContentBlock";

export default function LessonContentBlocksPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const lessonIdFilter = useMemo(() => {
    const raw = params.get("lessonId");
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params]);

  const [items, setItems] = useState<LessonContentBlockDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (lessonIdFilter != null) {
          const res = await lessonContentBlocksApi.getForLesson(lessonIdFilter);
          const data = res.data ?? [];
          data.sort((a, b) => a.orderIndex - b.orderIndex);
          setItems(data);
          return;
        }

        const coursesRes = await coursesApi.getCourses();
        const courses: CourseDto[] = coursesRes.data ?? [];

        const modulesRes = await Promise.allSettled(
          courses.map((c) => modulesApi.getCourseModules(c.id))
        );

        const modules: ModuleDto[] = [];
        for (const r of modulesRes) {
          if (r.status === "fulfilled") modules.push(...(r.value.data ?? []));
        }

        const lessonsRes = await Promise.allSettled(
          modules.map((m) => lessonsApi.getModuleLessons(m.id))
        );

        const lessons: LessonDto[] = [];
        for (const r of lessonsRes) {
          if (r.status === "fulfilled") lessons.push(...(r.value.data ?? []));
        }

        const blocksRes = await Promise.allSettled(
          lessons.map((l) => lessonContentBlocksApi.getForLesson(l.id))
        );

        const merged: LessonContentBlockDto[] = [];
        for (const r of blocksRes) {
          if (r.status === "fulfilled") merged.push(...(r.value.data ?? []));
        }

        const uniq = Array.from(new Map(merged.map((x) => [x.id, x])).values());
        uniq.sort(
          (a, b) => a.lessonId - b.lessonId || a.orderIndex - b.orderIndex
        );

        setItems(uniq);
      } catch {
        setError("Nie udało się pobrać bloków treści lekcji.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [lessonIdFilter]);

  const filteredItems = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;

    return items.filter((x) => {
      return (
        String(x.id).includes(s) ||
        String(x.orderIndex).includes(s) ||
        (x.lessonTitle ?? "").toLowerCase().includes(s) ||
        (x.blockType ?? "").toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  const handleDeactivate = async (id: number) => {
    try {
      await lessonContentBlocksApi.delete(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setError("Nie udało się dezaktywować bloku.");
    }
  };

  const handleExportExcel = () => {
    const rows = filteredItems.map((x) => ({
      ID: x.id,
      Lekcja: x.lessonTitle ?? "",
      Typ: x.blockType ?? "",
      Kolejność: x.orderIndex ?? "",
      Treść: x.content ?? "",
      Aktywny: x.isActive ? "tak" : "nie",
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

    const fileName = `tutor-lesson-content-blocks-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={2} spacing={3} flexWrap="wrap">
        <Heading>Bloki treści lekcji (Tutor)</Heading>

        <Button
          colorScheme="yellow"
          variant="outline"
          onClick={() => navigate("/tutor/lesson-content-blocks/new")}
        >
          Utwórz
        </Button>
      </HStack>

      <Text color="gray.400" fontSize="md" mb={6}>
        Edytować i usuwać można tylko bloki należące do lekcji zalogowanego
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
            placeholder="id, lekcja, typ, kolejność"
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
          Brak bloków do wyświetlenia.
        </Box>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <Box bg="gray.900" borderRadius="xl" overflow="hidden" boxShadow="lg">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Lekcja</Th>
                <Th>Typ</Th>
                <Th>Kolejność</Th>
                <Th>Aktywny</Th>
                <Th textAlign="center">Akcje</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredItems.map((x) => (
                <Tr key={x.id}>
                  <Td>{x.id}</Td>
                  <Td maxW="320px" isTruncated>
                    {x.lessonTitle ?? `Lekcja #${x.lessonId}`}
                  </Td>
                  <Td>
                    <Badge colorScheme="purple">{x.blockType ?? "—"}</Badge>
                  </Td>
                  <Td>{x.orderIndex ?? "—"}</Td>
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
                          navigate(`/tutor/lesson-content-blocks/${x.id}`)
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
