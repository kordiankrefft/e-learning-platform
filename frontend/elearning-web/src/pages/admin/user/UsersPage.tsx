import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Heading,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  HStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../../api/adminApi";
import type { UserAdminDto } from "../../../types/user";
import * as XLSX from "xlsx";

export default function UsersPage() {
  const [users, setUsers] = useState<UserAdminDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await adminApi.getUsers();
        setUsers(res.data ?? []);
      } catch {
        setError("Nie udało się pobrać użytkowników.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDeactivate = async (id: number) => {
    try {
      await adminApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError("Nie udało się dezaktywować użytkownika.");
    }
  };

  const handleExportExcel = () => {
    const rows = filteredUsers.map((user) => ({
      ID: user.id,
      Email: user.email ?? "",
      Role: user.roles?.join(", ") ?? "",
      DisplayName: user.displayName ?? "",
      Status: user.isActive ? "active" : "inactive",
      CreatedAt: user.createdAt
        ? new Date(user.createdAt).toLocaleString("pl-PL", {
            timeZone: "Europe/Warsaw",
          })
        : "",
      UpdatedAt: user.updatedAt
        ? new Date(user.updatedAt).toLocaleString("pl-PL", {
            timeZone: "Europe/Warsaw",
          })
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    const cols = Object.keys(rows[0] ?? {}).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...rows.map((r: any) => String(r[key] ?? "").length)
        ) + 2,
    }));
    (worksheet as any)["!cols"] = cols;

    const fileName = `users-report-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const filteredUsers = useMemo(() => {
    const searchText = q.trim().toLowerCase();

    if (!searchText) {
      return users;
    }

    return users.filter((user) => {
      return (
        String(user.id).includes(searchText) ||
        (user.email ?? "").toLowerCase().includes(searchText) ||
        (user.roles ?? []).join(",").toLowerCase().includes(searchText)
      );
    });
  }, [users, q]);

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <Heading mb={6}>Użytkownicy</Heading>

      <HStack mb={4} spacing={3}>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj: id, email, rola"
          bg="gray.800"
          borderColor="gray.700"
          maxW="520px"
        />
        <Button size="sm" variant="outline" onClick={handleExportExcel}>
          Export Excel
        </Button>
      </HStack>

      {loading && (
        <Box py={10} textAlign="center">
          <Spinner size="lg" />
        </Box>
      )}

      {error && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!loading && !error && filteredUsers.length === 0 && (
        <Box color="gray.400" py={8}>
          Brak użytkowników do wyświetlenia.
        </Box>
      )}

      {!loading && !error && filteredUsers.length > 0 && (
        <Box bg="gray.900" borderRadius="xl" overflow="hidden" boxShadow="lg">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Email</Th>
                <Th>Rola</Th>
                <Th>Nazwa</Th>
                <Th>Status</Th>
                <Th>Utworzono</Th>
                <Th>Edytowano</Th>
                <Th textAlign="center">Akcje</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers.map((user) => (
                <Tr key={user.id}>
                  <Td>{user.id}</Td>
                  <Td>{user.email ?? "-"}</Td>
                  <Td>{user.roles?.length ? user.roles.join(", ") : "-"}</Td>
                  <Td>{user.displayName ?? "-"}</Td>
                  <Td>
                    <Badge colorScheme={user.isActive ? "green" : "gray"}>
                      {user.isActive ? "aktywny" : "nieaktywny"}
                    </Badge>
                  </Td>
                  <Td whiteSpace="nowrap">
                    {new Date(user.createdAt).toLocaleString("pl-PL", {
                      timeZone: "Europe/Warsaw",
                    })}
                  </Td>
                  <Td whiteSpace="nowrap">
                    {user.updatedAt
                      ? new Date(user.updatedAt).toLocaleString("pl-PL", {
                          timeZone: "Europe/Warsaw",
                        })
                      : "—"}
                  </Td>
                  <Td textAlign="right">
                    <HStack justify="flex-end">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                      >
                        Edytuj
                      </Button>
                      <Button
                        size="xs"
                        colorScheme="red"
                        variant="outline"
                        onClick={() => handleDeactivate(user.id)}
                      >
                        Dezaktywuj
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
