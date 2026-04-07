import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  Button,
  Input,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
} from "@chakra-ui/react";

import { supportTicketsApi } from "../api/supportTicketsApi";
import { userCourseEnrollmentsApi } from "../api/userCourseEnrollmentsApi";

import type {
  SupportTicketDto,
  SupportTicketCreateDto,
} from "../types/supportTicket";
import type { UserCourseEnrollmentDto } from "../types/userCourseEnrollment";

export default function MySupportTicketsPage() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<SupportTicketDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");

  const [canCreateTicket, setCanCreateTicket] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [activeEnrollments, setActiveEnrollments] = useState<
    UserCourseEnrollmentDto[]
  >([]);
  const [selectedCourseIdText, setSelectedCourseIdText] = useState("");

  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [courseTouched, setCourseTouched] = useState(false);
  const [titleTouched, setTitleTouched] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    setError(null);

    try {
      // Student
      const response = await supportTicketsApi.my();
      setTickets(response.data);
      setCanCreateTicket(true);
      return;
    } catch (caughtError: any) {
      const statusCode = caughtError?.response?.status;

      // Tutor
      if (statusCode === 401 || statusCode === 403) {
        try {
          const tutorResponse = await supportTicketsApi.myAssigned();
          setTickets(tutorResponse.data);
          setCanCreateTicket(false);
          return;
        } catch (tutorError: any) {
          setError(
            tutorError?.response?.data?.message ??
              tutorError?.response?.data ??
              "Nie udało się pobrać zgłoszeń."
          );
          setTickets([]);
          setCanCreateTicket(false);
          return;
        }
      }

      setError(
        caughtError?.response?.data?.message ??
          caughtError?.response?.data ??
          "Nie udało się pobrać zgłoszeń."
      );
      setTickets([]);
      setCanCreateTicket(false);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveEnrollments = async () => {
    try {
      const response =
        await userCourseEnrollmentsApi.getMyUserCourseEnrollments();

      const onlyActive = response.data.filter((enrollment) => {
        const normalizedStatus = (enrollment.status ?? "").trim().toLowerCase();
        return enrollment.isActive && normalizedStatus === "active";
      });

      // usuń duplikaty po courseId (na wszelki wypadek)
      const uniqueByCourseId = new Map<number, UserCourseEnrollmentDto>();
      for (const enrollment of onlyActive) {
        uniqueByCourseId.set(enrollment.courseId, enrollment);
      }

      const uniqueEnrollments = Array.from(uniqueByCourseId.values()).sort(
        (a, b) => a.courseId - b.courseId
      );

      setActiveEnrollments(uniqueEnrollments);
    } catch {
      setActiveEnrollments([]);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    const normalizedSearchText = searchText.trim().toLowerCase();
    if (!normalizedSearchText) return tickets;

    return tickets.filter((ticket) => {
      const titleMatches = ticket.title
        .toLowerCase()
        .includes(normalizedSearchText);
      const statusMatches = ticket.status
        .toLowerCase()
        .includes(normalizedSearchText);
      const courseMatches = String(ticket.courseId ?? "").includes(
        normalizedSearchText
      );
      return titleMatches || statusMatches || courseMatches;
    });
  }, [tickets, searchText]);

  const resetCreateForm = () => {
    setSelectedCourseIdText("");
    setTitle("");
    setSubmitting(false);
    setCreateError(null);
    setCourseTouched(false);
    setTitleTouched(false);
  };

  const handleOpenCreateModal = async () => {
    resetCreateForm();
    onOpen();
    await loadActiveEnrollments();
  };

  const handleCreateTicket = async () => {
    setCreateError(null);
    setCourseTouched(true);
    setTitleTouched(true);

    const trimmedTitle = title.trim();
    const trimmedCourseIdText = selectedCourseIdText.trim();

    if (!trimmedCourseIdText) {
      setCreateError("Wybierz kurs.");
      return;
    }

    const parsedCourseId = Number(trimmedCourseIdText);
    if (Number.isNaN(parsedCourseId) || parsedCourseId <= 0) {
      setCreateError("Nieprawidłowy kurs.");
      return;
    }

    if (!trimmedTitle) {
      setCreateError("Uzupełnij tytuł.");
      return;
    }

    const dto: SupportTicketCreateDto = {
      courseId: parsedCourseId,
      title: trimmedTitle,
      status: "Open",
    };

    setSubmitting(true);

    try {
      await supportTicketsApi.create(dto);
      onClose();
      await loadTickets();
    } catch (caughtError: any) {
      setCreateError(
        caughtError?.response?.data?.message ??
          caughtError?.response?.data ??
          "Nie udało się utworzyć zgłoszenia."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const courseHasError =
    courseTouched && selectedCourseIdText.trim().length === 0;
  const titleHasError = titleTouched && title.trim().length === 0;

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6}>
        <Box>
          <Heading size="lg">Pomoc</Heading>
          <Text opacity={0.8} mt={1}>
            Twoje zgłoszenia i rozmowy w ramach wsparcia.
          </Text>
        </Box>

        {canCreateTicket && (
          <Button onClick={handleOpenCreateModal}>Nowe zgłoszenie</Button>
        )}
      </HStack>

      <Box mb={4}>
        <Input
          placeholder="Szukaj po tytule / statusie / kursie"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </Box>

      {loading && (
        <HStack>
          <Spinner />
          <Text>Ładowanie...</Text>
        </HStack>
      )}

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Box
          borderWidth="1px"
          borderColor="gray.800"
          borderRadius="xl"
          overflow="hidden"
          bg="gray.950"
        >
          <Table variant="simple">
            <Thead bg="black">
              <Tr>
                <Th color="gray.400" borderColor="gray.800">
                  ID
                </Th>
                <Th color="gray.400" borderColor="gray.800">
                  Tytuł
                </Th>
                <Th color="gray.400" borderColor="gray.800">
                  Status
                </Th>
                <Th color="gray.400" borderColor="gray.800">
                  Kurs
                </Th>
                <Th color="gray.400" borderColor="gray.800">
                  Utworzono
                </Th>
                <Th borderColor="gray.800"></Th>
              </Tr>
            </Thead>

            <Tbody>
              {filteredTickets.map((ticket, index) => (
                <Tr
                  key={ticket.id}
                  bg={index % 2 === 0 ? "gray.950" : "gray.900"}
                  _hover={{ bg: "gray.800" }}
                  transition="background 0.15s ease"
                >
                  <Td borderColor="gray.800" color="gray.200">
                    {ticket.id}
                  </Td>

                  <Td borderColor="gray.800" color="gray.100">
                    <Text fontWeight="semibold" noOfLines={1}>
                      {ticket.title}
                    </Text>
                  </Td>

                  <Td borderColor="gray.800">
                    <Badge
                      px={2}
                      py={1}
                      borderRadius="md"
                      bg={
                        ticket.status.toLowerCase() === "open" ||
                        ticket.status.toLowerCase() === "active"
                          ? "green.800"
                          : ticket.status.toLowerCase() === "closed" ||
                            ticket.status.toLowerCase() === "completed"
                          ? "gray.700"
                          : "yellow.700"
                      }
                      color="gray.100"
                    >
                      {ticket.status}
                    </Badge>
                  </Td>

                  <Td borderColor="gray.800" color="gray.200">
                    {ticket.courseTitle ?? "-"}
                  </Td>

                  <Td borderColor="gray.800" color="gray.200">
                    {new Date(ticket.createdAt).toLocaleString("pl-PL", {
                      timeZone: "Europe/Warsaw",
                    })}
                  </Td>

                  <Td borderColor="gray.800" textAlign="right">
                    <Button
                      size="sm"
                      bg="yellow.400"
                      color="gray.900"
                      _hover={{ bg: "yellow.300" }}
                      onClick={() => navigate(`/support/tickets/${ticket.id}`)}
                    >
                      Otwórz
                    </Button>
                  </Td>
                </Tr>
              ))}

              {filteredTickets.length === 0 && (
                <Tr>
                  <Td colSpan={6} borderColor="gray.800">
                    <Text color="gray.400">Brak zgłoszeń do wyświetlenia.</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nowe zgłoszenie</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {createError && (
              <Alert status="error" mb={3}>
                <AlertIcon />
                {createError}
              </Alert>
            )}

            <FormControl isInvalid={courseHasError} mb={3}>
              <FormLabel>Kurs</FormLabel>
              <Select
                placeholder="Wybierz kurs..."
                value={selectedCourseIdText}
                onChange={(event) =>
                  setSelectedCourseIdText(event.target.value)
                }
                onBlur={() => setCourseTouched(true)}
              >
                {activeEnrollments.map((enrollment) => (
                  <option
                    key={enrollment.id}
                    value={String(enrollment.courseId)}
                  >
                    {enrollment.courseTitle}
                  </option>
                ))}
              </Select>

              {courseHasError && (
                <FormErrorMessage>Kurs jest wymagany.</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={titleHasError}>
              <FormLabel>Tytuł</FormLabel>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onBlur={() => setTitleTouched(true)}
                placeholder="Np. Problem z lekcją / dostępem..."
              />
              {titleHasError && (
                <FormErrorMessage>Tytuł jest wymagany.</FormErrorMessage>
              )}
            </FormControl>

            {activeEnrollments.length === 0 && (
              <Text mt={3} opacity={0.7}>
                Nie masz aktywnych kursów. Nie można utworzyć zgłoszenia.
              </Text>
            )}
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="outline" onClick={onClose}>
                Anuluj
              </Button>
              <Button
                onClick={handleCreateTicket}
                isLoading={submitting}
                isDisabled={activeEnrollments.length === 0}
              >
                Utwórz
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
