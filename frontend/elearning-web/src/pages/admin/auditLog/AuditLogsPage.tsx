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
import { adminApi } from "../../../api/adminApi";
import type { AuditLogDto } from "../../../types/auditLog";

export default function AuditLogsPage() {
  const navigate = useNavigate();

  const [auditLogs, setAuditLogs] = useState<AuditLogDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [hasNext, setHasNext] = useState(false);

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await adminApi.getAuditLogsPaged(page, pageSize);

      setAuditLogs(response.data.items ?? []);
      setHasNext(!!response.data.hasNext);
    } catch {
      setErrorMessage("Nie udało się pobrać logów audytu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [page, pageSize]);

  const filteredAuditLogs = useMemo(() => {
    const searchText = q.trim().toLowerCase();
    if (!searchText) return auditLogs;

    return auditLogs.filter((log) => {
      return (
        (log.actionType ?? "").toLowerCase().includes(searchText) ||
        (log.entityName ?? "").toLowerCase().includes(searchText) ||
        String(log.entityId ?? "")
          .toLowerCase()
          .includes(searchText) ||
        (log.details ?? "").toLowerCase().includes(searchText) ||
        String(log.userName ?? "")
          .toLowerCase()
          .includes(searchText)
      );
    });
  }, [auditLogs, q]);

  const formatDateTime = (value?: string | Date | null) => {
    if (!value) return "—";
    const dt = typeof value === "string" ? new Date(value) : value;
    return dt.toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" });
  };

  return (
    <Box maxW="6xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6} spacing={3} flexWrap="wrap">
        <Heading>Audit log</Heading>

        <HStack spacing={2}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            isDisabled={page === 1 || isLoading}
          >
            ← Poprzednia
          </Button>

          <Text color="gray.400" fontSize="sm">
            Strona: {page}
          </Text>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            isDisabled={!hasNext || isLoading}
          >
            Następna →
          </Button>
        </HStack>
      </HStack>

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Szukaj (na tej stronie): akcja, encja, id, użytkownik, szczegóły..."
          bg="gray.800"
          borderColor="gray.700"
          maxW="520px"
        />
      </HStack>

      {isLoading && (
        <Box py={10} textAlign="center">
          <Spinner size="lg" />
        </Box>
      )}

      {errorMessage && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {errorMessage}
        </Alert>
      )}

      {!isLoading && !errorMessage && filteredAuditLogs.length === 0 && (
        <Box color="gray.400" py={8}>
          Brak logów do wyświetlenia.
        </Box>
      )}

      {!isLoading && !errorMessage && filteredAuditLogs.length > 0 && (
        <Box bg="gray.900" borderRadius="xl" overflow="hidden" boxShadow="lg">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Data</Th>
                <Th>Akcja</Th>
                <Th>Encja</Th>
                <Th>ID encji</Th>
                <Th>Użytkownik</Th>
                <Th>Status</Th>
                <Th textAlign="right">Podgląd</Th>
              </Tr>
            </Thead>

            <Tbody>
              {filteredAuditLogs.map((log) => (
                <Tr key={log.id}>
                  <Td whiteSpace="nowrap">
                    {formatDateTime(log.createdAt as any)}
                  </Td>

                  <Td>
                    <Badge colorScheme="purple">{log.actionType}</Badge>
                  </Td>

                  <Td>{log.entityName}</Td>

                  <Td>{log.entityId}</Td>

                  <Td>{log.userName ?? "-"}</Td>

                  <Td>
                    <Badge colorScheme={log.isActive ? "green" : "gray"}>
                      {log.isActive ? "aktywny" : "nieaktywny"}
                    </Badge>
                  </Td>

                  <Td textAlign="right">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => navigate(`/admin/audit-logs/${log.id}`)}
                    >
                      Szczegóły
                    </Button>
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
