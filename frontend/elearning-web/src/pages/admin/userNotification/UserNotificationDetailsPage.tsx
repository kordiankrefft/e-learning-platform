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

import { userNotificationsApi } from "../../../api/userNotificationsApi";
import type { UserNotificationDto } from "../../../types/userNotification";

export default function UserNotificationDetailsPage() {
  const { id } = useParams();
  const notificationId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<UserNotificationDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDateTime = (value?: string | Date | null) => {
    if (!value) return "—";
    const dt = typeof value === "string" ? new Date(value) : value;
    return dt.toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" });
  };

  const load = async () => {
    if (!notificationId || Number.isNaN(notificationId)) {
      setError("Nieprawidłowe ID powiadomienia.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await userNotificationsApi.getById(notificationId);
      setItem(res.data);
    } catch {
      setError("Nie udało się pobrać szczegółów powiadomienia.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [notificationId]);

  return (
    <Box maxW="5xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6}>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Wróć
        </Button>
      </HStack>

      <Heading mb={2}>Szczegóły powiadomienia</Heading>
      <Text color="gray.400" mb={6}>
        Podgląd powiadomienia użytkownika.
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
                {item.isActive ? "AKTYWNE" : "NIEAKTYWNE"}
              </Badge>
              <Badge colorScheme="yellow">Użytkownik: {item.userName}</Badge>
              <Badge colorScheme={item.isRead ? "green" : "orange"}>
                {item.isRead ? "PRZECZYTANE" : "NIEPRZECZYTANE"}
              </Badge>
            </HStack>

            <Text color="gray.400">
              <b>Utworzono:</b> {formatDateTime(item.createdAt as any)}
            </Text>

            <Divider borderColor="gray.700" />

            <Box>
              <Text color="gray.300" mb={2}>
                <b>Tytuł:</b>
              </Text>
              <Box
                bg="gray.800"
                border="1px solid"
                borderColor="gray.700"
                borderRadius="md"
                p={4}
                whiteSpace="pre-wrap"
              >
                {item.title ?? "—"}
              </Box>
            </Box>

            <Box>
              <Text color="gray.300" mb={2}>
                <b>Treść:</b>
              </Text>
              <Box
                bg="gray.800"
                border="1px solid"
                borderColor="gray.700"
                borderRadius="md"
                p={4}
                whiteSpace="pre-wrap"
              >
                {item.body ?? "—"}
              </Box>
            </Box>

            <Divider borderColor="gray.700" />

            <HStack spacing={3} wrap="wrap">
              <Text color="gray.300">
                <b>Ticket:</b> {item.supportTicketTitle ?? "—"}
              </Text>
              <Text color="gray.300">
                <b>Wiadomość:</b> {item.supportMessageBody ?? "—"}
              </Text>
            </HStack>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
