import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/react";
import { userApi } from "../api/userApi";
import type { UserCreateDto, UserEditDto } from "../types/user";

function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [bio, setBio] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setError(null);
        setSuccess(null);

        const response = await userApi.getMe();
        const data = response.data;

        setIsEditMode(true);
        setUserId(data.id);

        setDisplayName(data.displayName ?? "");
        setPreferredLanguage(data.preferredLanguage ?? "");
        setBio(data.bio ?? "");
      } catch (e: any) {
        //profil nie istnieje to creater
        setIsEditMode(false);
        setUserId(null);
        setDisplayName("");
        setPreferredLanguage("");
        setBio("");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    const isEmpty =
      !displayName.trim() && !preferredLanguage.trim() && !bio.trim();

    // przy tworzeniu profilu nie pozwól na kompletne pustki
    if (!isEditMode && isEmpty) {
      setError("Uzupełnij profil danymi!");
      return;
    }

    try {
      if (isEditMode && userId !== null) {
        const dto: UserEditDto = {
          id: userId,
          displayName: displayName.trim() || null,
          preferredLanguage: preferredLanguage.trim() || null,
          bio: bio.trim() || null,
        };

        await userApi.editMe(dto);
        setSuccess("Profil zaktualizowany!");
      } else {
        const dto: UserCreateDto = {
          displayName: displayName.trim() || null,
          preferredLanguage: preferredLanguage.trim() || null,
          bio: bio.trim() || null,
        };

        await userApi.createMe(dto);
        setSuccess("Profil utworzony!");
        setIsEditMode(true);
      }
    } catch {
      setError("Nie udało się zapisać profilu. Spróbuj ponownie.");
    }
  };

  if (loading) return <Heading size="lg">Ładowanie...</Heading>;

  return (
    <Box maxW="600px" mx="auto" mt={10} bg="gray.800" p={8} borderRadius="lg">
      <Heading mb={6}>
        {isEditMode ? "Edytuj profil" : "Utwórz swój profil"}
      </Heading>

      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}

      {success && (
        <Alert status="success" mb={4} borderRadius="md">
          <AlertIcon />
          <AlertTitle>{success}</AlertTitle>
        </Alert>
      )}

      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Wyświetlana nazwa</FormLabel>
          <Input
            bg="gray.700"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Preferowany język</FormLabel>
          <Input
            bg="gray.700"
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Bio</FormLabel>
          <Textarea
            bg="gray.700"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </FormControl>

        <Button colorScheme="purple" onClick={handleSave}>
          Zapisz
        </Button>
      </VStack>
    </Box>
  );
}

export default ProfilePage;
