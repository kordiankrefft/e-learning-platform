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

import { userCourseAccessesApi } from "../../../api/userCourseAccessesApi";
import type { UserCourseAccessDto } from "../../../types/userCourseAccess";

export default function UserCourseAccessesAdminPage() {
  const [items, setItems] = useState<UserCourseAccessDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await userCourseAccessesApi.getUserCourseAccesses();
        setItems(res.data ?? []);
      } catch {
        setError("Nie udało się pobrać dostępów do kursów.");
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
        (x.coursePricingPlanName ?? "").toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  const handleDeactivate = async (id: number) => {
    try {
      await userCourseAccessesApi.deleteUserCourseAccess(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setError("Nie udało się dezaktywować dostępu.");
    }
  };

  const handleExportExcel = () => {
    const rows = filteredItems.map((x) => ({
      ID: x.id,
      Użytkownik: x.userName,
      Kurs: x.courseTitle,
      "Plan cenowy": x.coursePricingPlanName ?? "",
      "Początek dostępu": formatDateTime(x.accessStart as any),
      "Koniec dostępu": x.accessEnd ? formatDateTime(x.accessEnd as any) : "",
      Cofnięty: x.isRevoked ? "tak" : "nie",
      Status: x.isActive ? "aktywny" : "nieaktywny",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "UserCourseAccesses");

    const cols = Object.keys(rows[0] ?? {}).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...rows.map((r: any) => String(r[key] ?? "").length)
        ) + 2,
    }));
    (worksheet as any)["!cols"] = cols;

    const fileName = `user-course-accesses-report-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <Heading mb={6}>Dostępy do kursów</Heading>

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj: id, user, course, plan"
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
          Brak rekordów do wyświetlenia.
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
                <Th>Plan</Th>
                <Th>Początek</Th>
                <Th>Koniec</Th>
                <Th>Cofnięty</Th>
                <Th>Status</Th>
                <Th textAlign="center">Akcje</Th>
              </Tr>
            </Thead>

            <Tbody>
              {filteredItems.map((x) => (
                <Tr key={x.id}>
                  <Td>{x.id}</Td>
                  <Td>{x.userName}</Td>
                  <Td>{x.courseTitle}</Td>
                  <Td>{x.coursePricingPlanName ?? "—"}</Td>
                  <Td whiteSpace="nowrap">
                    {formatDateTime(x.accessStart as any)}
                  </Td>
                  <Td whiteSpace="nowrap">
                    {x.accessEnd ? formatDateTime(x.accessEnd as any) : "—"}
                  </Td>
                  <Td>
                    <Badge colorScheme={x.isRevoked ? "red" : "green"}>
                      {x.isRevoked ? "tak" : "nie"}
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
                          navigate(`/admin/user-course-accesses/${x.id}`)
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
