import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
  Text,
  Badge,
  HStack,
  VStack,
  Divider,
  Button,
  Textarea,
} from "@chakra-ui/react";
import { supportTicketsApi } from "../api/supportTicketsApi";
import { supportMessagesApi } from "../api/supportMessagesApi";
import { userNotificationsApi } from "../api/userNotificationsApi";
import type { SupportTicketDto } from "../types/supportTicket";
import type { SupportMessageDto } from "../types/supportMessage";
import type { UserNotificationDto } from "../types/userNotification";

export default function SupportTicketDetailPage() {
  const navigate = useNavigate();
  const { ticketId } = useParams();

  const ticketIdNumber = useMemo(() => Number(ticketId), [ticketId]);

  const [messages, setMessages] = useState<SupportMessageDto[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [messageBody, setMessageBody] = useState("");
  const [sending, setSending] = useState(false);

  const markNotificationsAsReadForTicket = async (supportTicketId: number) => {
    try {
      const notificationsResponse = await userNotificationsApi.my();
      const notifications = notificationsResponse.data;

      const unreadForThisTicket = notifications.filter(
        (notification: UserNotificationDto) =>
          notification.isActive &&
          !notification.isRead &&
          notification.supportTicketId === supportTicketId
      );

      for (const notification of unreadForThisTicket) {
        await userNotificationsApi.markAsRead(notification.id);
      }
    } catch {}
  };

  const loadTicketAndMessages = async () => {
    if (!ticketIdNumber || Number.isNaN(ticketIdNumber)) {
      setError("Nieprawidłowe ID ticketa.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let ticketResponse: { data: SupportTicketDto } | null = null;

      try {
        ticketResponse = await supportTicketsApi.getById(ticketIdNumber);
      } catch {
        ticketResponse = null;
      }

      const messagesResponse = await supportMessagesApi.getForTicket(
        ticketIdNumber
      );

      setMessages(messagesResponse.data);

      await markNotificationsAsReadForTicket(ticketIdNumber);
    } catch (caughtError: any) {
      setError(
        caughtError?.response?.data?.message ??
          caughtError?.response?.data ??
          "Nie udało się pobrać rozmowy."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicketAndMessages();
  }, [ticketIdNumber]);

  const handleSendMessage = async () => {
    const trimmedMessageBody = messageBody.trim();
    if (!trimmedMessageBody) return;

    setSending(true);
    setError(null);

    try {
      await supportMessagesApi.create({
        supportTicketId: ticketIdNumber,
        messageBody: trimmedMessageBody,
      });

      setMessageBody("");
      await loadTicketAndMessages();
    } catch (caughtError: any) {
      setError(
        caughtError?.response?.data?.message ??
          caughtError?.response?.data ??
          "Nie udało się wysłać wiadomości."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="flex-end" mb={6}>
        <Button
          variant="outline"
          borderColor="yellow.400"
          color="yellow.400"
          _hover={{ bg: "yellow.400", color: "gray.900" }}
          onClick={() => navigate("/support/tickets")}
        >
          Wróć
        </Button>
      </HStack>

      {loading && (
        <HStack>
          <Spinner />
          <Text>Ładowanie...</Text>
        </HStack>
      )}

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Box borderWidth="1px" borderRadius="md" overflow="hidden">
          <Box p={4}>
            <Heading size="md">Wiadomości</Heading>
            <Text opacity={0.7} mt={1}>
              Chatbox w ramach zgłoszenia.
            </Text>
          </Box>

          <Divider />

          <Box p={4} maxH="420px" overflowY="auto">
            <VStack align="stretch" spacing={3}>
              {messages.map((message) => (
                <Box key={message.id} borderWidth="1px" borderRadius="md" p={3}>
                  <HStack justify="space-between" mb={1}>
                    <Badge
                      color="rgba(137, 92, 240, 1)"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {message.fromUserName}
                    </Badge>
                    <Text fontSize="sm" opacity={0.7}>
                      {new Date(message.sentAt).toLocaleString("pl-PL", {
                        timeZone: "Europe/Warsaw",
                      })}
                    </Text>
                  </HStack>

                  <Text whiteSpace="pre-wrap">{message.messageBody}</Text>
                </Box>
              ))}

              {messages.length === 0 && (
                <Text opacity={0.7}>Brak wiadomości. Napisz pierwszą.</Text>
              )}
            </VStack>
          </Box>

          <Divider />

          <Box p={4}>
            <VStack align="stretch" spacing={3}>
              <Textarea
                placeholder="Napisz wiadomość..."
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
              />
              <HStack justify="flex-end">
                <Button
                  onClick={handleSendMessage}
                  isLoading={sending}
                  loadingText="Wysyłanie"
                  bg="yellow.400"
                  color="gray.900"
                  _hover={{ bg: "yellow.300" }}
                >
                  Wyślij
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  );
}
