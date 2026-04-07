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
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

import { issuedCertificatesApi } from "../../../api/issuedCertificatesApi";
import type { IssuedCertificateDto } from "../../../types/issuedCertificate";

export default function IssuedCertificatesPage() {
  const [items, setItems] = useState<IssuedCertificateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await issuedCertificatesApi.getAll();
        setItems(res.data ?? []);
      } catch {
        setError("Nie udało się pobrać wystawionych certyfikatów.");
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
        String(x.userName ?? "")
          .toLowerCase()
          .includes(s) ||
        String(x.courseTitle ?? "")
          .toLowerCase()
          .includes(s) ||
        (x.certificateNumber ?? "").toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  const handleExportExcel = () => {
    const rows = filteredItems.map((x) => ({
      ID: x.id,
      Użytkownik: x.userName,
      Kurs: x.courseTitle,
      Szablon: x.certificateTemplateName,
      "Numer certyfikatu": x.certificateNumber ?? "",
      "Data wystawienia": x.issuedAt
        ? new Date(x.issuedAt).toLocaleString("pl-PL", {
            timeZone: "Europe/Warsaw",
          })
        : "",
      "Plik URL": x.fileUrl ?? "",
      Status: x.isActive ? "aktywny" : "nieaktywny",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "IssuedCertificates");

    const cols = Object.keys(rows[0] ?? {}).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...rows.map((r: any) => String(r[key] ?? "").length)
        ) + 2,
    }));
    (worksheet as any)["!cols"] = cols;

    const fileName = `issued-certificates-report-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleDeactivate = async (id: number) => {
    try {
      await issuedCertificatesApi.delete(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setError("Nie udało się dezaktywować certyfikatu.");
    }
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <Heading mb={6}>Wystawione certyfikaty</Heading>

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj: id, użytkownik, kurs, numer"
          bg="gray.800"
          borderColor="gray.700"
          maxW="520px"
        />
        <Button size="sm" variant="outline" onClick={handleExportExcel}>
          Eksport do Excela
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
          Brak certyfikatów do wyświetlenia.
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
                <Th>Szablon</Th>
                <Th>Numer certyfikatu</Th>
                <Th>Data wystawienia</Th>
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
                  <Td>{x.certificateTemplateName}</Td>
                  <Td>{x.certificateNumber ?? "-"}</Td>
                  <Td whiteSpace="nowrap">
                    {x.issuedAt
                      ? new Date(x.issuedAt).toLocaleString("pl-PL", {
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
                        onClick={() =>
                          navigate(`/admin/issued-certificates/${x.id}`)
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
