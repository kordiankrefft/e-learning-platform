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

import { userCourseEnrollmentsApi } from "../../../api/userCourseEnrollmentsApi";
import type { UserCourseEnrollmentDto } from "../../../types/userCourseEnrollment";

export default function UserCourseEnrollmentDetailsPage() {
  const { id } = useParams();
  const enrollmentId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<UserCourseEnrollmentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDateTime = (value?: string | Date | null) => {
    if (!value) return "—";
    const dt = typeof value === "string" ? new Date(value) : value;
    return dt.toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" });
  };

  const load = async () => {
    if (!enrollmentId || Number.isNaN(enrollmentId)) {
      setError("Nieprawidłowe ID zapisu.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await userCourseEnrollmentsApi.getUserCourseEnrollment(
        enrollmentId
      );
      setItem(res.data);
    } catch {
      setError("Nie udało się pobrać szczegółów zapisu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [enrollmentId]);

  return (
    <Box maxW="5xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6}>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Wróć
        </Button>
      </HStack>

      <Heading mb={2}>Szczegóły zapisu na kurs</Heading>
      <Text color="gray.400" mb={6}>
        Podgląd danych zapisu użytkownika na kurs.
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
              <Badge colorScheme="yellow">Użytkownik: {item.userName}</Badge>
              <Badge colorScheme="purple">Kurs: {item.courseTitle}</Badge>
            </HStack>

            <HStack spacing={3} wrap="wrap">
              <Text color="gray.300">
                <b>Kurs:</b> {item.courseTitle}
              </Text>
            </HStack>

            <Divider borderColor="gray.700" />

            <HStack spacing={6} wrap="wrap">
              <Text color="gray.300">
                <b>Zapisano:</b> {formatDateTime(item.enrolledAt as any)}
              </Text>
              <Text color="gray.300">
                <b>Ukończono:</b>{" "}
                {item.completedAt
                  ? formatDateTime(item.completedAt as any)
                  : "—"}
              </Text>
            </HStack>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
