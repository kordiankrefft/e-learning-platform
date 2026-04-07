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
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import { coursesApi } from "../../../api/coursesApi";
import type { CourseDto } from "../../../types/course";

export default function CoursesPage() {
  const [items, setItems] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await coursesApi.getMyTutorCourses();
        setItems(res.data ?? []);
      } catch {
        setError("Nie udało się pobrać kursów tutora.");
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
        (x.status ?? "").toLowerCase().includes(s) ||
        (x.difficultyLevel ?? "").toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  const handleDeactivate = async (id: number) => {
    try {
      await coursesApi.deleteCourse(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setError("Nie udało się dezaktywować kursu.");
    }
  };

  const handleExportExcel = () => {
    const rows = filteredItems.map((x) => ({
      ID: x.id,
      Tytuł: x.title ?? "",
      Status: x.status ?? "",
      Poziom: x.difficultyLevel ?? "",
      Kategoria: x.courseCategoryName ?? "",
      Tutor: x.tutorUserName ?? "",
      Miniaturka: x.thumbnailName ?? "",
      MiniaturkaURL: x.thumbnailUrl ?? "",
      OpisKrótki: x.shortDescription ?? "",
      OpisDługi: x.longDescription ?? "",
      Utworzono: x.createdAt
        ? new Date(x.createdAt).toLocaleString("pl-PL", {
            timeZone: "Europe/Warsaw",
          })
        : "",
      Edytowano: x.updatedAt
        ? new Date(x.updatedAt).toLocaleString("pl-PL", {
            timeZone: "Europe/Warsaw",
          })
        : "",
      Aktywny: x.isActive ? "tak" : "nie",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Courses");

    const cols = Object.keys(rows[0] ?? {}).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...rows.map((r: any) => String(r[key] ?? "").length)
        ) + 2,
    }));
    (worksheet as any)["!cols"] = cols;

    const fileName = `tutor-courses-report-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6} spacing={3} flexWrap="wrap">
        <Heading>Kursy (Tutor)</Heading>

        <Button
          colorScheme="yellow"
          variant="outline"
          onClick={() => navigate("/tutor/courses/new")}
        >
          Utwórz
        </Button>
      </HStack>

      <Text color="gray.400" fontSize="md" mb={4}>
        Edytować i usuwać można tylko te kursy, które należą do zalogowanego
        tutora.
      </Text>

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj: id, tytuł, status, poziom"
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
          Brak kursów do wyświetlenia.
        </Box>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <Box bg="gray.900" borderRadius="xl" overflow="hidden" boxShadow="lg">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Tytuł</Th>
                <Th>Status</Th>
                <Th>Poziom</Th>
                <Th>Kategoria</Th>
                <Th>Tutor</Th>
                <Th>Miniaturka</Th>
                <Th>Utworzono</Th>
                <Th>Edytowano</Th>
                <Th>Status rekordu</Th>
                <Th textAlign="center">Akcje</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredItems.map((x) => (
                <Tr key={x.id}>
                  <Td>{x.id}</Td>
                  <Td maxW="200px" isTruncated>
                    {x.title ?? "-"}
                  </Td>
                  <Td>{x.status ?? "-"}</Td>
                  <Td>{x.difficultyLevel ?? "—"}</Td>
                  <Td>{x.courseCategoryName ?? "—"}</Td>
                  <Td>{x.tutorUserName ?? "—"}</Td>
                  <Td>
                    {x.thumbnailName ?? "—"}
                    {x.thumbnailUrl ? (
                      <Box
                        color="gray.300"
                        fontSize="xs"
                        maxW="150px"
                        isTruncated
                      >
                        {x.thumbnailUrl}
                      </Box>
                    ) : null}
                  </Td>
                  <Td whiteSpace="nowrap">
                    {x.createdAt
                      ? new Date(x.createdAt).toLocaleString("pl-PL", {
                          timeZone: "Europe/Warsaw",
                        })
                      : "—"}
                  </Td>
                  <Td whiteSpace="nowrap">
                    {x.updatedAt
                      ? new Date(x.updatedAt).toLocaleString("pl-PL", {
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
                        onClick={() => navigate(`/tutor/courses/${x.id}`)}
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
