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

import { lessonAttachmentsApi } from "../../../api/lessonAttachmentsApi";
import type {
  LessonAttachmentDto,
  LessonAttachmentEditDto,
} from "../../../types/lessonAttachment";

export default function LessonAttachmentEditPage() {
  const { id } = useParams();
  const attachmentId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<LessonAttachmentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const load = async () => {
    if (!attachmentId || Number.isNaN(attachmentId)) {
      setError("Nieprawidłowe ID załącznika.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await lessonAttachmentsApi.getById(attachmentId);
      const data = res.data;

      setItem(data);
      setFileName(data.fileName ?? "");
      setFileUrl(data.fileUrl ?? "");
      setDescription(data.description ?? "");
    } catch {
      setError("Nie udało się pobrać danych załącznika.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [attachmentId]);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!item) {
      setSaveErr("Nie wczytano załącznika.");
      return;
    }

    if (!fileName.trim()) {
      setSaveErr("Nazwa pliku jest wymagana.");
      return;
    }

    if (!fileUrl.trim()) {
      setSaveErr("FileUrl jest wymagany.");
      return;
    }

    try {
      setSaving(true);

      const dto: LessonAttachmentEditDto = {
        id: attachmentId,
        lessonId: item.lessonId,
        fileName: fileName.trim(),
        fileUrl: fileUrl.trim(),
        description: description.trim() || null,
      };

      await lessonAttachmentsApi.update(attachmentId, dto);
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

      <Heading mb={2}>Edytuj załącznik (Tutor)</Heading>
      <Text color="gray.400" mb={6}>
        Edycja danych załącznika lekcji
      </Text>

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

      {!loading && !error && item && (
        <Box bg="gray.900" borderRadius="xl" p={6} boxShadow="lg">
          <Stack spacing={5}>
            <HStack spacing={3} wrap="wrap">
              <Badge colorScheme="blue">ID: {item.id}</Badge>
              <Badge colorScheme={item.isActive ? "green" : "gray"}>
                {item.isActive ? "AKTYWNY" : "NIEAKTYWNY"}
              </Badge>
              <Badge colorScheme="purple">
                Lekcja: {item.lessonTitle ?? `#${item.lessonId}`}
              </Badge>
            </HStack>

            <Divider borderColor="gray.700" />

            <FormControl>
              <FormLabel>Nazwa pliku *</FormLabel>
              <Input
                bg="gray.800"
                borderColor="gray.700"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>FileUrl *</FormLabel>
              <Input
                bg="gray.800"
                borderColor="gray.700"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Opis</FormLabel>
              <Textarea
                bg="gray.800"
                borderColor="gray.700"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                minH="140px"
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
      )}
    </Box>
  );
}
