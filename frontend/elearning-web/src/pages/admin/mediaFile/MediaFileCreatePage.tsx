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
} from "@chakra-ui/react";
import { mediaFilesApi } from "../../../api/mediaFilesApi";
import type { MediaFileCreateDto } from "../../../types/mediaFile";

export default function MediaFileCreatePage() {
  const navigate = useNavigate();

  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!fileUrl.trim() || !fileName.trim()) {
      setSaveErr("FileUrl oraz FileName są wymagane.");
      return;
    }

    try {
      setSaving(true);

      const dto: MediaFileCreateDto = {
        fileUrl: fileUrl.trim(),
        fileName: fileName.trim(),
        mimeType: mimeType.trim() ? mimeType.trim() : null,
        width: width.trim() ? Number(width) : null,
        height: height.trim() ? Number(height) : null,
      };

      await mediaFilesApi.create(dto);

      setSaveMsg("Utworzono rekord.");
      navigate(-1);
    } catch {
      setSaveErr("Nie udało się utworzyć rekordu.");
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

      <Heading mb={2}>Utwórz MediaFile</Heading>
      <Text color="gray.400" mb={6}>
        Dodaj nowy rekord pliku multimedialnego.
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
              Utwórz
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
}
