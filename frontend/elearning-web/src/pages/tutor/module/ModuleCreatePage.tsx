import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { modulesApi } from "../../../api/modulesApi";

import type { CourseDto } from "../../../types/course";
import type { ModuleCreateDto } from "../../../types/module";

export default function ModuleCreatePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const courseIdFromUrl = useMemo(() => {
    const raw = params.get("courseId");
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params]);

  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [courseId, setCourseId] = useState<string>(
    courseIdFromUrl != null ? String(courseIdFromUrl) : ""
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [orderIndex, setOrderIndex] = useState<string>("1");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCoursesLoading(true);
        setSaveErr(null);

        const res = await coursesApi.getCourses();
        const data: CourseDto[] = res.data ?? [];

        data.sort((a, b) => a.id - b.id);

        setCourses(data);
      } catch {
        setSaveErr("Nie udało się pobrać kursów tutora (do wyboru kursu).");
        setCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    const cid = Number(courseId);
    if (!Number.isFinite(cid) || cid <= 0) {
      setSaveErr("Wybierz kurs.");
      return;
    }

    if (!title.trim()) {
      setSaveErr("Tytuł jest wymagany.");
      return;
    }

    const oi = Number(orderIndex);
    if (!Number.isFinite(oi) || oi <= 0) {
      setSaveErr("Kolejność musi być liczbą > 0.");
      return;
    }

    try {
      setSaving(true);

      const dto: ModuleCreateDto = {
        courseId: cid,
        title: title.trim(),
        description: description.trim() || null,
        orderIndex: oi,
      };

      await modulesApi.createModule(dto);

      setSaveMsg("Utworzono moduł.");
      navigate(-1);
    } catch {
      setSaveErr("Nie udało się utworzyć modułu.");
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

      <Heading mb={2}>Utwórz moduł (Tutor)</Heading>
      <Text color="gray.400" mb={6}>
        Moduł zostanie utworzony w wybranym kursie.
      </Text>

      {saveErr && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {saveErr}
        </Alert>
      )}

      {saveMsg && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          {saveMsg}
        </Alert>
      )}

      <Box bg="gray.900" borderRadius="xl" p={6} boxShadow="lg">
        <Stack spacing={5}>
          <Divider borderColor="gray.700" />

          <FormControl>
            <FormLabel>Kurs *</FormLabel>

            {coursesLoading ? (
              <Box py={2}>
                <Spinner size="sm" />
              </Box>
            ) : (
              <Select
                bg="gray.800"
                borderColor="gray.700"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder="Wybierz kurs"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    • {c.title ?? "—"}
                  </option>
                ))}
              </Select>
            )}
          </FormControl>

          <FormControl>
            <FormLabel>Tytuł *</FormLabel>
            <Input
              bg="gray.800"
              borderColor="gray.700"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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

          <FormControl maxW="220px">
            <FormLabel>Kolejność *</FormLabel>
            <Input
              bg="gray.800"
              borderColor="gray.700"
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
            />
          </FormControl>
          <HStack spacing={3}>
            <Button
              colorScheme="yellow"
              variant="outline"
              onClick={save}
              isLoading={saving}
              isDisabled={coursesLoading}
            >
              Utwórz
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
}
