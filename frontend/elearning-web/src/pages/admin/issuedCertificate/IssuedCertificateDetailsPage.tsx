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

import { issuedCertificatesApi } from "../../../api/issuedCertificatesApi";
import type { IssuedCertificateDto } from "../../../types/issuedCertificate";

export default function IssuedCertificateDetailsPage() {
  const { id } = useParams();
  const certId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<IssuedCertificateDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!certId || Number.isNaN(certId)) {
      setError("Nieprawidłowe ID certyfikatu.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await issuedCertificatesApi.getById(certId);
      setItem(res.data);
    } catch {
      setError("Nie udało się pobrać szczegółów certyfikatu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [certId]);

  return (
    <Box maxW="5xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6}>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Wróć
        </Button>
      </HStack>

      <Heading mb={2}>Szczegóły certyfikatu</Heading>
      <Text color="gray.400" mb={6}>
        Podgląd danych wystawionego certyfikatu.
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
              <Badge colorScheme="yellow">Kurs: {item.courseTitle}</Badge>
              <Badge colorScheme="purple">Użytkownik: {item.userName}</Badge>
            </HStack>

            <Divider borderColor="gray.700" />

            <Box>
              <Text color="gray.300">
                <b>Numer certyfikatu:</b> {item.certificateNumber ?? "—"}
              </Text>
              <Text color="gray.300" mt={2}>
                <b>Szablon:</b> {item.certificateTemplateName}
              </Text>
              <Text color="gray.300" mt={2}>
                <b>Data wystawienia:</b>{" "}
                {item.issuedAt
                  ? new Date(item.issuedAt).toLocaleString("pl-PL", {
                      timeZone: "Europe/Warsaw",
                    })
                  : "—"}
              </Text>
              <Text color="gray.300" mt={2}>
                <b>Plik URL:</b> {item.fileUrl ?? "—"}
              </Text>
            </Box>

            <Divider borderColor="gray.700" />
          </Stack>
        </Box>
      )}
    </Box>
  );
}
