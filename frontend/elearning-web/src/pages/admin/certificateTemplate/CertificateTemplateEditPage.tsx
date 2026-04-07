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
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";

import { certificateTemplatesApi } from "../../../api/certificateTemplatesApi";
import type {
  CertificateTemplateDto,
  CertificateTemplateEditDto,
} from "../../../types/certificateTemplate";

export default function CertificateTemplateEditPage() {
  const { id } = useParams();
  const templateId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<CertificateTemplateDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [templateBody, setTemplateBody] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const load = async () => {
    if (!templateId || Number.isNaN(templateId)) {
      setError("Nieprawidłowe ID szablonu.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await certificateTemplatesApi.getById(templateId);
      const data = res.data;

      setItem(data);

      setName(data.name ?? "");
      setDescription(data.description ?? "");
      setTemplateBody(data.templateBody ?? "");
    } catch {
      setError("Nie udało się pobrać danych szablonu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [templateId]);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!name.trim()) {
      setSaveErr("Nazwa jest wymagana.");
      return;
    }
    if (!templateBody.trim()) {
      setSaveErr("Treść szablonu jest wymagana.");
      return;
    }

    try {
      setSaving(true);

      const dto: CertificateTemplateEditDto = {
        id: templateId,
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        templateBody: templateBody,
      };

      await certificateTemplatesApi.update(templateId, dto);

      setSaveMsg("Zapisano zmiany.");
      await load();
    } catch {
      setSaveErr("Nie udało się zapisać zmian.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box maxW="5xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6}>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Wróć
        </Button>
      </HStack>

      <Heading mb={2}>Edytuj szablon certyfikatu</Heading>
      <Text color="gray.400" mb={6}>
        Edycja danych szablonu.
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
            </HStack>

            <Text color="gray.400">
              <b>Utworzono:</b>{" "}
              {item.createdAt
                ? new Date(item.createdAt).toLocaleString("pl-PL", {
                    timeZone: "Europe/Warsaw",
                  })
                : "—"}
              {"  "}
              <b>Edytowano:</b>{" "}
              {item.updatedAt
                ? new Date(item.updatedAt).toLocaleString("pl-PL", {
                    timeZone: "Europe/Warsaw",
                  })
                : "—"}
            </Text>

            <Divider borderColor="gray.700" />

            <Box>
              <Heading size="md" mb={3}>
                Dane
              </Heading>

              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Nazwa *</FormLabel>
                  <Input
                    bg="gray.800"
                    borderColor="gray.700"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={200}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Opis</FormLabel>
                  <Input
                    bg="gray.800"
                    borderColor="gray.700"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Treść szablonu *</FormLabel>
                  <Textarea
                    bg="gray.800"
                    borderColor="gray.700"
                    value={templateBody}
                    onChange={(e) => setTemplateBody(e.target.value)}
                    minH="220px"
                  />
                </FormControl>

                <HStack spacing={3}>
                  <Button
                    colorScheme="yellow"
                    variant="outline"
                    onClick={save}
                    isLoading={saving}
                  >
                    Zapisz zmiany
                  </Button>
                </HStack>

                {saveMsg && <Box color="green.300">{saveMsg}</Box>}
                {saveErr && <Box color="red.300">{saveErr}</Box>}
              </Stack>
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
