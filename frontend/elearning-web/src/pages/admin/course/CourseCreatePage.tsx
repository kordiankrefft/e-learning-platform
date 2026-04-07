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
} from "@chakra-ui/react";

import { coursesApi } from "../../../api/coursesApi";
import { courseCategoriesApi } from "../../../api/courseCategoriesApi";
import { adminApi } from "../../../api/adminApi";
import { mediaFilesApi } from "../../../api/mediaFilesApi";

import type { CourseCreateDto } from "../../../types/course";
import type { CourseCategoryDto } from "../../../types/courseCategory";
import type { UserAdminDto } from "../../../types/user";
import type { MediaFileDto } from "../../../types/mediaFile";

export default function CourseCreatePage() {
  const navigate = useNavigate();

  const [courseCategoryId, setCourseCategoryId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [status, setStatus] = useState("");
  const [thumbnailMediaId, setThumbnailMediaId] = useState<string>("");
  const [tutorUserId, setTutorUserId] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const [listsLoading, setListsLoading] = useState(true);
  const [listsErr, setListsErr] = useState<string | null>(null);

  const [categories, setCategories] = useState<CourseCategoryDto[]>([]);
  const [users, setUsers] = useState<UserAdminDto[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFileDto[]>([]);

  useEffect(() => {
    const loadLists = async () => {
      setListsErr(null);
      try {
        setListsLoading(true);

        const [catRes, usersRes, mediaRes] = await Promise.all([
          courseCategoriesApi.getCourseCategories(),
          adminApi.getUsers(),
          mediaFilesApi.getAll(),
        ]);

        setCategories(catRes.data ?? []);
        setUsers(usersRes.data ?? []);
        setMediaFiles(mediaRes.data ?? []);
      } catch {
        setListsErr("Nie udało się pobrać list (kategorie/tutorzy/media).");
      } finally {
        setListsLoading(false);
      }
    };

    loadLists();
  }, []);

  const tutorUsers = useMemo(() => {
    const anyHasRoles = users.some((u: any) => Array.isArray((u as any).roles));
    if (!anyHasRoles) return users;

    return users.filter((u: any) => {
      const roles = (u as any).roles as string[] | undefined;
      return roles?.some((r) => r.toLowerCase() === "tutor") ?? false;
    });
  }, [users]);

  const tutorLabel = (u: UserAdminDto) => {
    const anyU = u as any;
    return (
      anyU.displayName?.trim() ||
      anyU.userName?.trim() ||
      anyU.email?.trim() ||
      `User #${u.id}`
    );
  };

  const categoryLabel = (c: CourseCategoryDto) => {
    const anyC = c as any;
    return anyC.name?.trim() || anyC.title?.trim() || `Category #${c.id}`;
  };

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!title.trim()) {
      setSaveErr("Tytuł jest wymagany.");
      return;
    }
    if (!status.trim()) {
      setSaveErr("Status jest wymagany.");
      return;
    }

    try {
      setSaving(true);

      const dto: CourseCreateDto = {
        courseCategoryId: courseCategoryId ? Number(courseCategoryId) : null,
        title: title.trim(),
        shortDescription: shortDescription.trim()
          ? shortDescription.trim()
          : null,
        longDescription: longDescription.trim() ? longDescription.trim() : null,
        difficultyLevel: difficultyLevel.trim() ? difficultyLevel.trim() : null,
        status: status.trim(),
        thumbnailMediaId: thumbnailMediaId ? Number(thumbnailMediaId) : null,
        tutorUserId: tutorUserId ? Number(tutorUserId) : null,
      };

      await coursesApi.createCourse(dto);
      setSaveMsg("Utworzono kurs.");
      navigate(-1);
    } catch {
      setSaveErr("Nie udało się utworzyć kursu.");
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

      <Heading mb={2}>Utwórz kurs</Heading>
      <Text color="gray.400" mb={6}>
        Dodaj nowy kurs do systemu.
      </Text>

      {listsErr && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {listsErr}
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

          {listsLoading ? (
            <HStack>
              <Spinner size="sm" />
              <Text color="gray.400">Ładowanie list...</Text>
            </HStack>
          ) : (
            <HStack spacing={4} flexWrap="wrap" align="start">
              <FormControl maxW="320px">
                <FormLabel>Kategoria</FormLabel>
                <Select
                  bg="gray.800"
                  borderColor="gray.700"
                  placeholder="— brak —"
                  value={courseCategoryId}
                  onChange={(e) => setCourseCategoryId(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {categoryLabel(c)}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl maxW="320px">
                <FormLabel>Tutor</FormLabel>
                <Select
                  bg="gray.800"
                  borderColor="gray.700"
                  placeholder="— brak —"
                  value={tutorUserId}
                  onChange={(e) => setTutorUserId(e.target.value)}
                >
                  {tutorUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {tutorLabel(u)}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl maxW="360px">
                <FormLabel>Miniaturka</FormLabel>
                <Select
                  bg="gray.800"
                  borderColor="gray.700"
                  placeholder="— brak —"
                  value={thumbnailMediaId}
                  onChange={(e) => setThumbnailMediaId(e.target.value)}
                >
                  {mediaFiles.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fileName ?? `Miniaturka #${m.id}`}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </HStack>
          )}

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
            <FormLabel>Opis krótki</FormLabel>
            <Input
              bg="gray.800"
              borderColor="gray.700"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              maxLength={500}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Opis długi</FormLabel>
            <Textarea
              bg="gray.800"
              borderColor="gray.700"
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              minH="160px"
            />
          </FormControl>

          <HStack spacing={4} flexWrap="wrap">
            <FormControl maxW="320px">
              <FormLabel>Poziom trudności</FormLabel>
              <Input
                bg="gray.800"
                borderColor="gray.700"
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                maxLength={50}
              />
            </FormControl>

            <FormControl maxW="320px">
              <FormLabel>Status *</FormLabel>
              <Input
                bg="gray.800"
                borderColor="gray.700"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                maxLength={50}
              />
            </FormControl>
          </HStack>

          <HStack spacing={3}>
            <Button
              colorScheme="yellow"
              variant="outline"
              onClick={save}
              isLoading={saving}
              isDisabled={listsLoading || !!listsErr}
            >
              Utwórz
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
}
