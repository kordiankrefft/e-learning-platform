import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Stack,
  HStack,
  Divider,
} from "@chakra-ui/react";
import { adminApi } from "../../../api/adminApi";
import type { AuditLogDto } from "../../../types/auditLog";

export default function AuditLogDetailsPage() {
  const { id } = useParams();
  const logId = Number(id);
  const navigate = useNavigate();

  const [log, setLog] = useState<AuditLogDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!logId || Number.isNaN(logId)) {
      setError("Nieprawidłowe ID logu.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await adminApi.getAuditLog(logId);
        setLog(res.data);
      } catch {
        setError("Nie udało się pobrać szczegółów logu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [logId]);

  return (
    <Box maxW="5xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6}>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Wróć
        </Button>
      </HStack>

      <Heading mb={2}>Szczegóły logu</Heading>
      <Text color="gray.400" mb={6}>
        Podgląd pojedynczego wpisu audytu.
      </Text>

      {loading && (
        <Box py={10} textAlign="center">
          <Spinner size="lg" />
        </Box>
      )}

      {error && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!loading && !error && log && (
        <Box
          bg="gray.900"
          borderRadius="xl"
          p={{ base: 5, md: 6 }}
          boxShadow="lg"
        >
          <Stack spacing={4}>
            <HStack spacing={3} wrap="wrap">
              <Badge colorScheme="blue">ID: {log.id}</Badge>
              <Badge colorScheme="purple">{log.actionType}</Badge>
              <Badge colorScheme={log.isActive ? "green" : "gray"}>
                {log.isActive ? "AKTYWNY" : "NIEAKTYWNY"}
              </Badge>
            </HStack>

            <Divider borderColor="gray.700" />

            <Stack spacing={2}>
              <Text>
                <b>Data:</b> {new Date(log.createdAt).toLocaleString()}
              </Text>
              <Text>
                <b>Użytkownik:</b> {log.userName ?? "—"}
              </Text>
              <Text>
                <b>Encja:</b> {log.entityName}
              </Text>
              <Text>
                <b>ID encji:</b> {log.entityId || "—"}
              </Text>
            </Stack>

            <Divider borderColor="gray.700" />

            <Box>
              <Text mb={2}>
                <b>Szczegóły:</b>
              </Text>
              <Box
                bg="gray.800"
                border="1px solid"
                borderColor="gray.700"
                borderRadius="md"
                p={4}
                whiteSpace="pre-wrap"
                color="gray.200"
              >
                {log.details ?? "—"}
              </Box>
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
