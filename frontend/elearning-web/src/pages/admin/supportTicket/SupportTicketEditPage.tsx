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
  Select,
} from "@chakra-ui/react";

import { supportTicketsApi } from "../../../api/supportTicketsApi";
import { coursesApi } from "../../../api/coursesApi";
import { adminApi } from "../../../api/adminApi";

import type {
  SupportTicketDto,
  SupportTicketEditDto,
} from "../../../types/supportTicket";
import type { CourseDto } from "../../../types/course";
import type { UserAdminDto } from "../../../types/user";

export default function SupportTicketEditPage() {
  const { id } = useParams();
  const ticketId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<SupportTicketDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [courseId, setCourseId] = useState("");
  const [assignedTutorId, setAssignedTutorId] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");

  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [tutorUsers, setTutorUsers] = useState<UserAdminDto[]>([]);
  const [refsLoading, setRefsLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const formatDateTime = (value?: string | Date | null) => {
    if (!value) return "—";
    const dt = typeof value === "string" ? new Date(value) : value;
    return dt.toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" });
  };

  const userLabel = (u: UserAdminDto) => {
    const name =
      (u as any).displayName ??
      (u as any).userName ??
      (u as any).email ??
      `User #${u.id}`;
    const email = (u as any).email;
    return email && email !== name ? `${name} (${email})` : String(name);
  };

  const isTutor = (u: UserAdminDto) => {
    const roles = (u as any).roles as string[] | undefined;
    return (roles ?? []).some((r) => r.toLowerCase() === "tutor");
  };

  const loadRefs = async () => {
    try {
      setRefsLoading(true);
      const [coursesRes, usersRes] = await Promise.all([
        coursesApi.getCourses(),
        adminApi.getUsers(),
      ]);

      setCourses(coursesRes.data ?? []);

      const users = usersRes.data ?? [];
      setTutorUsers(users.filter(isTutor));
    } catch {
    } finally {
      setRefsLoading(false);
    }
  };

  const load = async () => {
    if (!ticketId || Number.isNaN(ticketId)) {
      setError("Nieprawidłowe ID ticketu.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await supportTicketsApi.getById(ticketId);
      const data = res.data;

      setItem(data);

      setCourseId(data.courseId != null ? String(data.courseId) : "");
      setAssignedTutorId(
        data.assignedTutorId != null ? String(data.assignedTutorId) : ""
      );
      setTitle(data.title ?? "");
      setStatus(data.status ?? "");
    } catch {
      setError("Nie udało się pobrać danych ticketu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefs();
    load();
  }, [ticketId]);

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

      const dto: SupportTicketEditDto = {
        id: ticketId,
        courseId: courseId.trim() ? Number(courseId) : null,
        assignedTutorId: assignedTutorId.trim()
          ? Number(assignedTutorId)
          : null,
        title: title.trim(),
        status: status.trim(),
      };

      await supportTicketsApi.update(ticketId, dto);

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

      <Heading mb={2}>Edytuj ticket</Heading>
      <Text color="gray.400" mb={6}>
        Edycja danych ticketu wsparcia.
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
              <Badge colorScheme="yellow">
                Użytkownik: {item.userName ?? item.userId}
              </Badge>
              <Badge colorScheme="purple">
                Kurs: {item.courseTitle ?? item.courseId ?? "—"}
              </Badge>
              <Badge colorScheme="cyan">
                Tutor: {item.assignedTutorName ?? item.assignedTutorId ?? "—"}
              </Badge>
            </HStack>

            <Text color="gray.400">
              <b>Utworzono:</b> {formatDateTime(item.createdAt as any)}{" "}
              {item.closedAt ? (
                <>
                  • <b>Zamknięto:</b> {formatDateTime(item.closedAt as any)}
                </>
              ) : null}
            </Text>

            <Divider borderColor="gray.700" />

            <Stack spacing={4}>
              <HStack spacing={4} flexWrap="wrap" align="flex-start">
                <FormControl maxW="360px">
                  <FormLabel>Kurs</FormLabel>
                  <Select
                    bg="gray.800"
                    borderColor="gray.700"
                    placeholder={refsLoading ? "Ładowanie..." : "— brak —"}
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    isDisabled={refsLoading}
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl maxW="360px">
                  <FormLabel>Przypisany tutor</FormLabel>
                  <Select
                    bg="gray.800"
                    borderColor="gray.700"
                    placeholder={refsLoading ? "Ładowanie..." : "— brak —"}
                    value={assignedTutorId}
                    onChange={(e) => setAssignedTutorId(e.target.value)}
                    isDisabled={refsLoading}
                  >
                    {tutorUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {userLabel(u)}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl maxW="240px">
                  <FormLabel>Status *</FormLabel>
                  <Select
                    bg="gray.800"
                    borderColor="gray.700"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    placeholder="Wybierz..."
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Tytuł *</FormLabel>
                <Input
                  bg="gray.800"
                  borderColor="gray.700"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
          </Stack>
        </Box>
      )}
    </Box>
  );
}
