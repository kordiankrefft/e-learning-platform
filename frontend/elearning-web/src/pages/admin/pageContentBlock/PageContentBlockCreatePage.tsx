import { useEffect, useMemo, useState } from "react";
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
  Select,
  Spinner,
  Badge,
  Image,
} from "@chakra-ui/react";

import { pageContentBlocksApi } from "../../../api/pageContentBlocksApi";
import { mediaFilesApi } from "../../../api/mediaFilesApi";

import type { PageContentBlockCreateDto } from "../../../types/pageContentBlock";
import type { MediaFileDto } from "../../../types/mediaFile";

export default function PageContentBlockCreatePage() {
  const navigate = useNavigate();

  const [pageKey, setPageKey] = useState("");
  const [blockType, setBlockType] = useState("");
  const [orderIndex, setOrderIndex] = useState("");
  const [mediaFileId, setMediaFileId] = useState("");
  const [content, setContent] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const [mediaFiles, setMediaFiles] = useState<MediaFileDto[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaErr, setMediaErr] = useState<string | null>(null);

  const mediaLabel = (m: any) =>
    (m?.thumbnailName as string | null) ??
    (m?.name as string | null) ??
    (m?.fileName as string | null) ??
    (m?.originalFileName as string | null) ??
    `Media #${m?.id ?? "?"}`;

  useEffect(() => {
    const loadMedia = async () => {
      setMediaErr(null);
      try {
        setMediaLoading(true);
        const res = await mediaFilesApi.getAll();
        setMediaFiles(res.data ?? []);
      } catch {
        setMediaErr("Nie udało się pobrać listy mediów.");
        setMediaFiles([]);
      } finally {
        setMediaLoading(false);
      }
    };

    loadMedia();
  }, []);

  const selectedMedia = useMemo(() => {
    const id = Number(mediaFileId);
    if (!id || Number.isNaN(id)) return null;
    return mediaFiles.find((m) => m.id === id) ?? null;
  }, [mediaFileId, mediaFiles]);

  const mediaUrl = useMemo(() => {
    const m: any = selectedMedia;
    return (m?.url as string | null) ?? (m?.fileUrl as string | null) ?? null;
  }, [selectedMedia]);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!pageKey.trim()) {
      setSaveErr("Klucz strony jest wymagany.");
      return;
    }
    if (!blockType.trim()) {
      setSaveErr("Typ bloku jest wymagany.");
      return;
    }
    if (!orderIndex.trim()) {
      setSaveErr("Kolejność (orderIndex) jest wymagana.");
      return;
    }

    try {
      setSaving(true);

      const dto: PageContentBlockCreateDto = {
        pageKey: pageKey.trim(),
        blockType: blockType.trim(),
        orderIndex: Number(orderIndex),
        content: content.trim() ? content : null,
        mediaFileId: mediaFileId.trim() ? Number(mediaFileId) : null,
      };

      await pageContentBlocksApi.create(dto);

      setSaveMsg("Utworzono blok treści.");
      navigate(-1);
    } catch {
      setSaveErr("Nie udało się utworzyć bloku treści.");
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

      <Heading mb={2}>Utwórz blok treści strony</Heading>
      <Text color="gray.400" mb={6}>
        Dodaj nowy blok treści do strony (pageKey).
      </Text>

      {mediaErr && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {mediaErr}
        </Alert>
      )}

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

          <HStack spacing={4} flexWrap="wrap" align="start">
            <FormControl maxW="320px">
              <FormLabel>Klucz strony *</FormLabel>
              <Input
                bg="gray.800"
                borderColor="gray.700"
                value={pageKey}
                onChange={(e) => setPageKey(e.target.value)}
                maxLength={100}
                placeholder="np. home, about, contact..."
              />
            </FormControl>

            <FormControl maxW="240px">
              <FormLabel>Kolejność *</FormLabel>
              <Input
                bg="gray.800"
                borderColor="gray.700"
                value={orderIndex}
                onChange={(e) => setOrderIndex(e.target.value)}
                inputMode="numeric"
              />
            </FormControl>

            <FormControl maxW="360px" isDisabled={mediaLoading}>
              <FormLabel>Media</FormLabel>

              {mediaLoading ? (
                <HStack>
                  <Spinner size="sm" />
                  <Text color="gray.400">Ładowanie mediów...</Text>
                </HStack>
              ) : (
                <Select
                  bg="gray.800"
                  borderColor="gray.700"
                  placeholder="— brak —"
                  value={mediaFileId}
                  onChange={(e) => setMediaFileId(e.target.value)}
                >
                  {mediaFiles.map((m) => (
                    <option key={m.id} value={m.id}>
                      {mediaLabel(m)}
                    </option>
                  ))}
                </Select>
              )}

              {selectedMedia && (
                <HStack mt={3} spacing={2} wrap="wrap">
                  <Badge colorScheme="teal">
                    {mediaLabel(selectedMedia as any)}
                  </Badge>
                  <Badge colorScheme="blue">
                    ID: {(selectedMedia as any).id}
                  </Badge>
                </HStack>
              )}

              {mediaUrl && (
                <Box mt={3}>
                  <Text fontSize="sm" color="gray.400" mb={2}>
                    Podgląd:
                  </Text>
                  <Image
                    src={mediaUrl}
                    alt={
                      selectedMedia ? mediaLabel(selectedMedia as any) : "media"
                    }
                    maxH="140px"
                    borderRadius="md"
                    objectFit="cover"
                  />
                </Box>
              )}
            </FormControl>
          </HStack>

          <FormControl>
            <FormLabel>Typ bloku *</FormLabel>
            <Input
              bg="gray.800"
              borderColor="gray.700"
              value={blockType}
              onChange={(e) => setBlockType(e.target.value)}
              maxLength={50}
              placeholder="np. Text, Html, Image..."
            />
          </FormControl>

          <FormControl>
            <FormLabel>Treść</FormLabel>
            <Textarea
              bg="gray.800"
              borderColor="gray.700"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              minH="200px"
            />
          </FormControl>

          <HStack spacing={3}>
            <Button
              colorScheme="yellow"
              variant="outline"
              onClick={save}
              isLoading={saving}
              isDisabled={mediaLoading || !!mediaErr}
            >
              Utwórz
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
}
