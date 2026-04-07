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

import { userCourseEnrollmentsApi } from "../../../api/userCourseEnrollmentsApi";
import type { UserCourseEnrollmentDto } from "../../../types/userCourseEnrollment";

export default function UserCourseEnrollmentsAdminPage() {
  const [items, setItems] = useState<UserCourseEnrollmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await userCourseEnrollmentsApi.getUserCourseEnrollments();
        setItems(res.data ?? []);
      } catch {
        setError("Nie udało się pobrać zapisów na kursy.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDateTime = (value?: string | Date | null) => {
    if (!value) return "—";
    const dt = typeof value === "string" ? new Date(value) : value;
    return dt.toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" });
  };

  const filteredItems = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;

    return items.filter((x) => {
      return (
        String(x.id).includes(s) ||
        (x.userName ?? "").toLowerCase().includes(s) ||
        (x.courseTitle ?? "").toLowerCase().includes(s) ||
        (x.status ?? "").toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  const handleDeactivate = async (id: number) => {
    try {
      await userCourseEnrollmentsApi.deleteUserCourseEnrollment(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setError("Nie udało się dezaktywować zapisu.");
    }
  };

  const handleExportExcel = () => {
    const rows = filteredItems.map((x) => ({
      ID: x.id,
      Użytkownik: x.userName,
      Kurs: x.courseTitle,
      Status: x.status ?? "",
      Zapisano: formatDateTime(x.enrolledAt as any),
      Ukończono: x.completedAt ? formatDateTime(x.completedAt as any) : "",
      Aktywny: x.isActive ? "tak" : "nie",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "UserCourseEnrollments");

    const cols = Object.keys(rows[0] ?? {}).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...rows.map((r: any) => String(r[key] ?? "").length)
        ) + 2,
    }));
    (worksheet as any)["!cols"] = cols;

    const fileName = `user-course-enrollments-report-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const statusColor = (status?: string) => {
    const s = (status ?? "").toLowerCase();
    if (s.includes("completed") || s.includes("ukoń")) return "green";
    if (s.includes("active") || s.includes("trak") || s.includes("in"))
      return "yellow";
    if (s.includes("cancel") || s.includes("anul")) return "red";
    return "blue";
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <Heading mb={6}>Zapisy na kursy</Heading>

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj: id, user, kurs, status"
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
          Brak zapisów do wyświetlenia.
        </Box>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <Box bg="gray.900" borderRadius="xl" overflow="hidden" boxShadow="lg">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Użytkownik</Th>
                <Th>Kurs</Th>
                <Th>Status</Th>
                <Th>Zapisano</Th>
                <Th>Ukończono</Th>
                <Th>Aktywny</Th>
                <Th textAlign="center">Akcje</Th>
              </Tr>
            </Thead>

            <Tbody>
              {filteredItems.map((x) => (
                <Tr key={x.id}>
                  <Td>{x.id}</Td>
                  <Td>{x.userName}</Td>
                  <Td maxW="340px" isTruncated>
                    {x.courseTitle}
                  </Td>
                  <Td>
                    <Badge colorScheme={statusColor(x.status)}>
                      {x.status}
                    </Badge>
                  </Td>
                  <Td whiteSpace="nowrap">
                    {formatDateTime(x.enrolledAt as any)}
                  </Td>
                  <Td whiteSpace="nowrap">
                    {x.completedAt ? formatDateTime(x.completedAt as any) : "—"}
                  </Td>
                  <Td>
                    <Badge colorScheme={x.isActive ? "green" : "gray"}>
                      {x.isActive ? "tak" : "nie"}
                    </Badge>
                  </Td>
                  <Td textAlign="right">
                    <HStack justify="flex-end">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() =>
                          navigate(`/admin/user-course-enrollments/${x.id}`)
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
