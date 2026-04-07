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

import { lessonProgressApi } from "../../../api/lessonProgressesApi";
import type { LessonProgressDto } from "../../../types/lessonProgress";

export default function LessonProgressDetailsPage() {
  const { id } = useParams();
  const progressId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<LessonProgressDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!progressId || Number.isNaN(progressId)) {
      setError("Nieprawidłowe ID postępu.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await lessonProgressApi.getById(progressId);
      setItem(res.data);
    } catch {
      setError("Nie udało się pobrać szczegółów postępu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [progressId]);

  return (
    <Box maxW="5xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6}>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Wróć
        </Button>
      </HStack>

      <Heading mb={2}>Szczegóły postępu</Heading>
      <Text color="gray.400" mb={6}>
        Podgląd danych postępu użytkownika w lekcji.
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
                {item.isActive ? "AKTYWNY" : "NIEAKTYWNY"}
              </Badge>
              <Badge colorScheme="purple">Użytkownik: {item.userName}</Badge>
              <Badge colorScheme="yellow">Lekcja: {item.lessonTitle}</Badge>
            </HStack>

            <Divider borderColor="gray.700" />

            <Box>
              <Text color="gray.300">
                <b>Postęp:</b> {Number(item.progressPercent)}%
              </Text>

              <Text color="gray.300" mt={2}>
                <b>Ostatnio oglądane:</b>{" "}
                {item.lastViewedAt
                  ? new Date(item.lastViewedAt).toLocaleString("pl-PL", {
                      timeZone: "Europe/Warsaw",
                    })
                  : "—"}
              </Text>
            </Box>

            <Divider borderColor="gray.700" />
          </Stack>
        </Box>
      )}
    </Box>
  );
}
