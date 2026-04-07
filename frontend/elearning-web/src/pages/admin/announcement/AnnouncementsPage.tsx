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
import { announcementsApi } from "../../../api/announcementsApi";
import type { AnnouncementDto } from "../../../types/announcement";

export default function AnnouncementsPage() {
  const [items, setItems] = useState<AnnouncementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await announcementsApi.getAll();
        setItems(res.data ?? []);
      } catch {
        setError("Nie udało się pobrać ogłoszeń.");
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
        (x.body ?? "").toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  const handleDeactivate = async (id: number) => {
    try {
      await announcementsApi.delete(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setError("Nie udało się dezaktywować ogłoszenia.");
    }
  };

  const handleExportExcel = () => {
    const rows = filteredItems.map((x) => ({
      ID: x.id,
      Title: x.title ?? "",
      Body: x.body ?? "",
      IsPublished: x.isPublished ? "yes" : "no",
      PublishAt: x.publishAt
        ? new Date(x.publishAt).toLocaleString("pl-PL", {
            timeZone: "Europe/Warsaw",
          })
        : "",
      ExpiresAt: x.expiresAt
        ? new Date(x.expiresAt).toLocaleString("pl-PL", {
            timeZone: "Europe/Warsaw",
          })
        : "",
      CreatedByUserId: x.userName ?? "",
      CreatedAt: x.createdAt
        ? new Date(x.createdAt).toLocaleString("pl-PL", {
            timeZone: "Europe/Warsaw",
          })
        : "",
      UpdatedAt: x.updatedAt
        ? new Date(x.updatedAt).toLocaleString("pl-PL", {
            timeZone: "Europe/Warsaw",
          })
        : "",
      IsActive: x.isActive ? "active" : "inactive",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Announcements");

    const cols = Object.keys(rows[0] ?? {}).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...rows.map((r: any) => String(r[key] ?? "").length)
        ) + 2,
    }));
    (worksheet as any)["!cols"] = cols;

    const fileName = `announcements-report-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6} spacing={3} flexWrap="wrap">
        <Heading>Announcements</Heading>

        <Button
          colorScheme="yellow"
          variant="outline"
          onClick={() => navigate("/admin/announcements/new")}
        >
          Utwórz
        </Button>
      </HStack>

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj: id, tytuł, treść"
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
          Brak rekordów do wyświetlenia.
        </Box>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <Box bg="gray.900" borderRadius="xl" overflow="hidden" boxShadow="lg">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Tytuł</Th>
                <Th>Opublikowane</Th>
                <Th>Data publikacji</Th>
                <Th>Data wygaśnięcia</Th>
                <Th>Utworzył</Th>
                <Th>Utworzono</Th>
                <Th>Edytowano</Th>
                <Th>Status</Th>
                <Th textAlign="center">Akcje</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredItems.map((x) => (
                <Tr key={x.id}>
                  <Td>{x.id}</Td>
                  <Td maxW="260px" isTruncated>
                    {x.title ?? "-"}
                  </Td>
                  <Td>
                    <Badge colorScheme={x.isPublished ? "green" : "gray"}>
                      {x.isPublished ? "tak" : "nie"}
                    </Badge>
                  </Td>
                  <Td whiteSpace="nowrap">
                    {x.publishAt
                      ? new Date(x.publishAt).toLocaleString("pl-PL", {
                          timeZone: "Europe/Warsaw",
                        })
                      : "—"}
                  </Td>
                  <Td whiteSpace="nowrap">
                    {x.expiresAt
                      ? new Date(x.expiresAt).toLocaleString("pl-PL", {
                          timeZone: "Europe/Warsaw",
                        })
                      : "—"}
                  </Td>
                  <Td>{x.userName ?? "—"}</Td>
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
                        onClick={() => navigate(`/admin/announcements/${x.id}`)}
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
