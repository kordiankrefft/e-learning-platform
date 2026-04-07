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
  Switch,
} from "@chakra-ui/react";
import { announcementsApi } from "../../../api/announcementsApi";
import type {
  AnnouncementDto,
  AnnouncementEditDto,
} from "../../../types/announcement";

export default function AnnouncementEditPage() {
  const { id } = useParams();
  const announcementId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<AnnouncementDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [publishAt, setPublishAt] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const toLocalInputValue = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const load = async () => {
    if (!announcementId || Number.isNaN(announcementId)) {
      setError("Nieprawidłowe ID ogłoszenia.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await announcementsApi.getById(announcementId);
      const data = res.data;

      setItem(data);

      setTitle(data.title ?? "");
      setBody(data.body ?? "");
      setIsPublished(!!data.isPublished);
      setPublishAt(toLocalInputValue(data.publishAt));
      setExpiresAt(toLocalInputValue(data.expiresAt));
    } catch {
      setError("Nie udało się pobrać danych ogłoszenia.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [announcementId]);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!title.trim()) {
      setSaveErr("Title jest wymagany.");
      return;
    }
    if (!body.trim()) {
      setSaveErr("Body jest wymagane.");
      return;
    }

    try {
      setSaving(true);

      const dto: AnnouncementEditDto = {
        id: announcementId,
        title: title.trim(),
        body: body.trim(),
        isPublished,
        publishAt: publishAt ? new Date(publishAt).toISOString() : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      await announcementsApi.update(announcementId, dto);

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

      <Heading mb={2}>Edytuj Announcement</Heading>
      <Text color="gray.400" mb={6}>
        Edycja ogłoszenia + status publikacji.
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
              <Badge colorScheme={item.isPublished ? "green" : "gray"}>
                {item.isPublished ? "OPUBLIKOWANE" : "NIEOPUBLIKOWANE"}
              </Badge>
              <Badge colorScheme="yellow">Utworzył: {item.userName}</Badge>
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
                  <FormLabel>Tytuł *</FormLabel>
                  <Input
                    bg="gray.800"
                    borderColor="gray.700"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Treść *</FormLabel>
                  <Textarea
                    bg="gray.800"
                    borderColor="gray.700"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    minH="160px"
                  />
                </FormControl>

                <HStack spacing={4} flexWrap="wrap">
                  <FormControl display="flex" alignItems="center" maxW="260px">
                    <FormLabel mb="0">Opublikowano</FormLabel>
                    <Switch
                      isChecked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                    />
                  </FormControl>

                  <FormControl maxW="260px">
                    <FormLabel>Data publikacji</FormLabel>
                    <Input
                      type="datetime-local"
                      bg="gray.800"
                      borderColor="gray.700"
                      value={publishAt}
                      onChange={(e) => setPublishAt(e.target.value)}
                    />
                  </FormControl>

                  <FormControl maxW="260px">
                    <FormLabel>Data wygaśnięcia</FormLabel>
                    <Input
                      type="datetime-local"
                      bg="gray.800"
                      borderColor="gray.700"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                    />
                  </FormControl>
                </HStack>

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
