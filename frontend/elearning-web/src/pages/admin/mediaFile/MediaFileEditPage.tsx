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
} from "@chakra-ui/react";
import { mediaFilesApi } from "../../../api/mediaFilesApi";
import type { MediaFileDto, MediaFileEditDto } from "../../../types/mediaFile";

export default function MediaFileEditPage() {
  const { id } = useParams();
  const mediaId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<MediaFileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const load = async () => {
    if (!mediaId || Number.isNaN(mediaId)) {
      setError("Nieprawidłowe ID rekordu.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await mediaFilesApi.getById(mediaId);
      const data = res.data;

      setItem(data);

      setFileUrl(data.fileUrl ?? "");
      setFileName(data.fileName ?? "");
      setMimeType(data.mimeType ?? "");
      setWidth(data.width != null ? String(data.width) : "");
      setHeight(data.height != null ? String(data.height) : "");
    } catch {
      setError("Nie udało się pobrać danych MediaFile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [mediaId]);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!fileUrl.trim() || !fileName.trim()) {
      setSaveErr("FileUrl oraz FileName są wymagane.");
      return;
    }

    try {
      setSaving(true);

      const dto: MediaFileEditDto = {
        id: mediaId,
        fileUrl: fileUrl.trim(),
        fileName: fileName.trim(),
        mimeType: mimeType.trim() ? mimeType.trim() : null,
        width: width.trim() ? Number(width) : null,
        height: height.trim() ? Number(height) : null,
      };

      await mediaFilesApi.update(mediaId, dto);

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

      <Heading mb={2}>Edytuj MediaFile</Heading>
      <Text color="gray.400" mb={6}>
        Edycja danych pliku multimedialnego.
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
              <Badge colorScheme="yellow">URL: {fileUrl}</Badge>
            </HStack>

            <Text color="gray.400">
              <b>Utworzono:</b>{" "}
              {item.uploadedAt
                ? new Date(item.uploadedAt).toLocaleString("pl-PL", {
                    timeZone: "Europe/Warsaw",
                  })
                : "—"}
              {"  "}
              <b>Utworzył:</b> {item.userName ?? "—"}
            </Text>

            <Divider borderColor="gray.700" />

            <Box>
              <Heading size="md" mb={3}>
                Dane
              </Heading>

              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Adres Url *</FormLabel>
                  <Input
                    bg="gray.800"
                    borderColor="gray.700"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Nazwa *</FormLabel>
                  <Input
                    bg="gray.800"
                    borderColor="gray.700"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Mime</FormLabel>
                  <Input
                    bg="gray.800"
                    borderColor="gray.700"
                    value={mimeType}
                    onChange={(e) => setMimeType(e.target.value)}
                  />
                </FormControl>

                <HStack spacing={4} flexWrap="wrap">
                  <FormControl maxW="220px">
                    <FormLabel>Szerokość</FormLabel>
                    <Input
                      bg="gray.800"
                      borderColor="gray.700"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      inputMode="numeric"
                    />
                  </FormControl>

                  <FormControl maxW="220px">
                    <FormLabel>Wysokość</FormLabel>
                    <Input
                      bg="gray.800"
                      borderColor="gray.700"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      inputMode="numeric"
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
