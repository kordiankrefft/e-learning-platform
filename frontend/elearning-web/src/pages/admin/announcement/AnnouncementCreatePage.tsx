import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Text,
  Alert,
  AlertIcon,
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
import type { AnnouncementCreateDto } from "../../../types/announcement";

export default function AnnouncementCreatePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [publishAt, setPublishAt] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

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

      const dto: AnnouncementCreateDto = {
        title: title.trim(),
        body: body.trim(),
        isPublished,
        publishAt: publishAt ? new Date(publishAt).toISOString() : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      await announcementsApi.create(dto);
      setSaveMsg("Utworzono ogłoszenie.");
      navigate(-1);
    } catch {
      setSaveErr("Nie udało się utworzyć ogłoszenia.");
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

      <Heading mb={2}>Utwórz Announcement</Heading>
      <Text color="gray.400" mb={6}>
        Dodaj nowe ogłoszenie do systemu.
      </Text>

      {saveErr && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {saveErr}
        </Alert>
      )}

      {saveMsg && (
        <Alert status="success" borderRadius="md" mb={4}>
          <AlertIcon />
          {saveMsg}
        </Alert>
      )}

      <Box
        bg="gray.900"
        borderRadius="xl"
        p={{ base: 5, md: 6 }}
        boxShadow="lg"
      >
        <Stack spacing={5}>
          <Divider borderColor="gray.700" />

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
              Utwórz
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
}
