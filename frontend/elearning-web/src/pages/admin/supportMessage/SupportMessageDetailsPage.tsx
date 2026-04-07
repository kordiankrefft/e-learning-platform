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

import { supportMessagesApi } from "../../../api/supportMessagesApi";
import type { SupportMessageDto } from "../../../types/supportMessage";

export default function SupportMessageDetailsPage() {
  const { id } = useParams();
  const messageId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<SupportMessageDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDateTime = (value?: string | Date | null) => {
    if (!value) return "—";
    const dt = typeof value === "string" ? new Date(value) : value;
    return dt.toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" });
  };

  const load = async () => {
    if (!messageId || Number.isNaN(messageId)) {
      setError("Nieprawidłowe ID wiadomości.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await supportMessagesApi.getById(messageId);
      setItem(res.data);
    } catch {
      setError("Nie udało się pobrać szczegółów wiadomości.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [messageId]);

  return (
    <Box maxW="5xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6}>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Wróć
        </Button>
      </HStack>

      <Heading mb={2}>Szczegóły wiadomości</Heading>
      <Text color="gray.400" mb={6}>
        Podgląd wiadomości wysłanej w ramach ticketu.
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

      {!loading && !error && item && (
        <Box
          bg="gray.900"
          borderRadius="xl"
          p={{ base: 5, md: 6 }}
          boxShadow="lg"
        >
          <Stack spacing={5}>
            <HStack spacing={3} wrap="wrap">
              <Badge colorScheme="blue">ID: {item.id}</Badge>
              <Badge colorScheme={item.isActive ? "green" : "gray"}>
                {item.isActive ? "AKTYWNA" : "NIEAKTYWNA"}
              </Badge>
              <Badge colorScheme="purple">
                Temat: {item.supportTicketTitle}
              </Badge>
              <Badge colorScheme="yellow">Nadawca: {item.fromUserName}</Badge>
            </HStack>

            <Divider borderColor="gray.700" />

            <Text color="gray.300">
              <b>Wysłano:</b> {formatDateTime(item.sentAt as any)}
            </Text>

            <Divider borderColor="gray.700" />

            <Box>
              <Text color="gray.300" mb={2}>
                <b>Treść wiadomości:</b>
              </Text>
              <Box
                bg="gray.800"
                border="1px solid"
                borderColor="gray.700"
                borderRadius="md"
                p={4}
                whiteSpace="pre-wrap"
              >
                {item.messageBody ?? "—"}
              </Box>
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
