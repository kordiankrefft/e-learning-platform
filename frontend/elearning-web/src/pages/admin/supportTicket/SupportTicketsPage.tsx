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

import { supportTicketsApi } from "../../../api/supportTicketsApi";
import type { SupportTicketDto } from "../../../types/supportTicket";

export default function SupportTicketsAdminPage() {
  const [items, setItems] = useState<SupportTicketDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await supportTicketsApi.getAll();
        setItems(res.data ?? []);
      } catch {
        setError("Nie udało się pobrać ticketów wsparcia.");
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
        (x.userName ?? "").toLowerCase().includes(s) ||
        (x.courseTitle ?? "").toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  const handleDeactivate = async (id: number) => {
    try {
      await supportTicketsApi.delete(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setError("Nie udało się dezaktywować ticketu.");
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
      Użytkownik: x.userName,
      Kurs: x.courseTitle ?? "",
      Tutor: x.assignedTutorName ?? "",
      Tytuł: x.title ?? "",
      Status: x.status ?? "",
      Utworzono: formatDateTime(x.createdAt as any),
      Zamknięto: x.closedAt ? formatDateTime(x.closedAt as any) : "",
      Aktywny: x.isActive ? "tak" : "nie",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SupportTickets");

    const cols = Object.keys(rows[0] ?? {}).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...rows.map((r: any) => String(r[key] ?? "").length)
        ) + 2,
    }));
    (worksheet as any)["!cols"] = cols;

    const fileName = `support-tickets-report-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const statusColor = (status?: string) => {
    const s = (status ?? "").toLowerCase();
    if (s.includes("open") || s.includes("now")) return "green";
    if (s.includes("progress") || s.includes("trak")) return "yellow";
    if (s.includes("close") || s.includes("zamk")) return "gray";
    return "blue";
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6} spacing={3} flexWrap="wrap">
        <Heading>Tematy wsparcia</Heading>
      </HStack>

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj: id, user, kurs"
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
          Brak ticketów do wyświetlenia.
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
                <Th>Użytkownik</Th>
                <Th>Kurs</Th>
                <Th>Tutor</Th>
                <Th>Utworzono</Th>
                <Th>Zamknięto</Th>
                <Th>Aktywny</Th>
                <Th textAlign="center">Akcje</Th>
              </Tr>
            </Thead>

            <Tbody>
              {filteredItems.map((x) => (
                <Tr key={x.id}>
                  <Td>{x.id}</Td>
                  <Td maxW="250px" isTruncated>
                    {x.title ?? "-"}
                  </Td>
                  <Td>
                    <Badge colorScheme={statusColor(x.status)}>
                      {x.status ?? "-"}
                    </Badge>
                  </Td>
                  <Td>{x.userName}</Td>
                  <Td maxW="250px" isTruncated>
                    {x.courseTitle ?? "—"}
                  </Td>
                  <Td>{x.assignedTutorName ?? "—"}</Td>
                  <Td whiteSpace="nowrap">
                    {formatDateTime(x.createdAt as any)}
                  </Td>
                  <Td whiteSpace="nowrap">
                    {x.closedAt ? formatDateTime(x.closedAt as any) : "—"}
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
                          navigate(`/admin/support-tickets/${x.id}`)
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
