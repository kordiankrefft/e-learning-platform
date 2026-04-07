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
  Select,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { adminApi } from "../../../api/adminApi";
import type { UserAdminDto, UserEditDto } from "../../../types/user";

const AVAILABLE_ROLES = ["Admin", "Tutor", "Student"];

export default function UserEditPage() {
  const { id } = useParams();
  const userId = Number(id);
  const navigate = useNavigate();

  const [user, setUser] = useState<UserAdminDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [bio, setBio] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const [role, setRole] = useState(AVAILABLE_ROLES[0]);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleMsg, setRoleMsg] = useState<string | null>(null);
  const [roleErr, setRoleErr] = useState<string | null>(null);

  const load = async () => {
    if (!userId || Number.isNaN(userId)) {
      setError("Nieprawidłowe ID użytkownika.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await adminApi.getUser(userId);
      const data = res.data;

      setUser(data);

      setDisplayName(data.displayName ?? "");
      setPreferredLanguage(data.preferredLanguage ?? "");
      setBio(data.bio ?? "");

      if (data.roles?.length) setRole(data.roles[0]);
      else setRole(AVAILABLE_ROLES[0]);
    } catch {
      setError("Nie udało się pobrać danych użytkownika.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  const saveProfile = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    try {
      setSaving(true);

      const dto: UserEditDto = {
        id: userId,
        displayName,
        preferredLanguage,
        bio,
      };

      await adminApi.editUser(userId, dto);

      setSaveMsg("Profil zaktualizowany.");
      await load();
    } catch {
      setSaveErr("Nie udało się zapisać profilu.");
    } finally {
      setSaving(false);
    }
  };

  const roleAlreadyAssigned = !!user?.roles?.includes(role);

  const assignRole = async () => {
    setRoleMsg(null);
    setRoleErr(null);

    if (!user?.email) {
      setRoleErr("Brak e-maila użytkownika — nie można nadać roli.");
      return;
    }

    if (roleAlreadyAssigned) return;

    try {
      setRoleLoading(true);
      await adminApi.addUserToRole(user.email, role);
      setRoleMsg(`Rola "${role}" została nadana.`);
      await load();
    } catch {
      setRoleErr("Nie udało się nadać roli.");
    } finally {
      setRoleLoading(false);
    }
  };

  return (
    <Box maxW="5xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6}>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Wróć
        </Button>
      </HStack>

      <Heading mb={2}>Edytuj użytkownika</Heading>
      <Text color="gray.400" mb={6}>
        Edycja danych profilu + zarządzanie rolami.
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

      {!loading && !error && user && (
        <Box
          bg="gray.900"
          borderRadius="xl"
          p={{ base: 5, md: 6 }}
          boxShadow="lg"
        >
          <Stack spacing={5}>
            <HStack spacing={3} wrap="wrap">
              <Badge colorScheme="blue">ID: {user.id}</Badge>
              <Badge colorScheme={user.isActive ? "green" : "gray"}>
                {user.isActive ? "AKTYWNY" : "NIEAKTYWNY"}
              </Badge>
              <Badge colorScheme="yellow">Email: {user.email ?? "—"}</Badge>
            </HStack>

            <Text color="gray.400">
              <b>Rola:</b> {user.roles?.length ? user.roles.join(", ") : "—"}
            </Text>

            <Divider borderColor="gray.700" />

            <Box>
              <Heading size="md" mb={3}>
                Profil
              </Heading>

              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Nazwa wyświetlana</FormLabel>
                  <Input
                    bg="gray.800"
                    borderColor="gray.700"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Preferowany język</FormLabel>
                  <Input
                    bg="gray.800"
                    borderColor="gray.700"
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Bio</FormLabel>
                  <Textarea
                    bg="gray.800"
                    borderColor="gray.700"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </FormControl>

                <HStack spacing={3}>
                  <Button
                    colorScheme="yellow"
                    variant="outline"
                    onClick={saveProfile}
                    isLoading={saving}
                  >
                    Zapisz zmiany
                  </Button>
                </HStack>

                {saveMsg && <Box color="green.300">{saveMsg}</Box>}
                {saveErr && <Box color="red.300">{saveErr}</Box>}
              </Stack>
            </Box>

            <Divider borderColor="gray.700" />

            <Box>
              <Heading size="md" mb={3}>
                Rola
              </Heading>

              <HStack spacing={3} align="center" flexWrap="wrap">
                <Select
                  aria-label="Wybierz rolę"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  bg="gray.800"
                  borderColor="gray.700"
                  maxW="220px"
                >
                  {AVAILABLE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>

                <Button
                  onClick={assignRole}
                  colorScheme="yellow"
                  variant="outline"
                  isLoading={roleLoading}
                  isDisabled={roleAlreadyAssigned}
                >
                  {roleAlreadyAssigned ? "Rola już nadana" : "Nadaj rolę"}
                </Button>
              </HStack>

              {roleMsg && (
                <Box mt={3} color="green.300">
                  {roleMsg}
                </Box>
              )}
              {roleErr && (
                <Box mt={3} color="red.300">
                  {roleErr}
                </Box>
              )}
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
