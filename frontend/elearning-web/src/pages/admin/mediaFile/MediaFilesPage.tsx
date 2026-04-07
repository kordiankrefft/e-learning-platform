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
import { mediaFilesApi } from "../../../api/mediaFilesApi";
import type { MediaFileDto } from "../../../types/mediaFile";

export default function MediaFilesPage() {
  const [items, setItems] = useState<MediaFileDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await mediaFilesApi.getAll();
      setItems(res.data ?? []);
    } catch {
      setError("Nie udało się pobrać plików media.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDeactivate = async (id: number) => {
    try {
      await mediaFilesApi.delete(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setError("Nie udało się dezaktywować pliku.");
    }
  };

  const filteredItems = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;

    return items.filter((x) => {
      return (
        String(x.id).includes(s) ||
        (x.fileName ?? "").toLowerCase().includes(s) ||
        (x.fileUrl ?? "").toLowerCase().includes(s) ||
        (x.mimeType ?? "").toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  const handleExportExcel = () => {
    const rows = filteredItems.map((x) => ({
      ID: x.id,
      NazwaPliku: x.fileName ?? "",
      Mime: x.mimeType ?? "",
      Szerokość: x.width ?? "",
      Wysokość: x.height ?? "",
      Url: x.fileUrl ?? "",
      Utworzono: x.uploadedAt
        ? new Date(x.uploadedAt).toLocaleString("pl-PL", {
            timeZone: "Europe/Warsaw",
          })
        : "",
      Utworzył: x.userName ?? "",
      Status: x.isActive ? "active" : "inactive",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MediaFiles");

    const cols = Object.keys(rows[0] ?? {}).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...rows.map((r: any) => String(r[key] ?? "").length)
        ) + 2,
    }));
    (worksheet as any)["!cols"] = cols;

    const fileName = `media-files-report-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6} spacing={3} flexWrap="wrap">
        <Heading>Media files</Heading>

        <Button
          variant="outline"
          colorScheme="yellow"
          onClick={() => navigate("/admin/media-files/new")}
        >
          Utwórz
        </Button>
      </HStack>

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj: id, nazwa, mime, url"
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
                <Th>Nazwa</Th>
                <Th>Mime</Th>
                <Th>Szerokość</Th>
                <Th>Wysokość</Th>
                <Th>URL</Th>
                <Th>Utworzono</Th>
                <Th>Utworzył</Th>
                <Th>Status</Th>
                <Th textAlign="center">Akcje</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredItems.map((x) => (
                <Tr key={x.id}>
                  <Td>{x.id}</Td>
                  <Td>{x.fileName ?? "-"}</Td>
                  <Td>{x.mimeType ?? "-"}</Td>
                  <Td>{x.width ?? "—"}</Td>
                  <Td>{x.height ?? "—"}</Td>
                  <Td maxW="260px" isTruncated>
                    {x.fileUrl}
                  </Td>
                  <Td whiteSpace="nowrap">
                    {x.uploadedAt
                      ? new Date(x.uploadedAt).toLocaleString("pl-PL", {
                          timeZone: "Europe/Warsaw",
                        })
                      : "—"}
                  </Td>
                  <Td>{x.userName ?? "—"}</Td>
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
                        onClick={() => navigate(`/admin/media-files/${x.id}`)}
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
