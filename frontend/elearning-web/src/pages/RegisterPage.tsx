import { useState } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  FormControl,
  FormLabel,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError("Wypełnij wszystkie pola.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Hasła nie są takie same.");
      return;
    }

    try {
      setIsSubmitting(true);

      await authApi.register(email, password);

      navigate("/login");
    } catch (error: any) {
      console.error(error);
      setError("Konto z takim e-mailem już istnieje. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      minH="calc(100vh - 64px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        as="form"
        onSubmit={handleSubmit}
        bg="gray.800"
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        width="100%"
        maxW="400px"
      >
        <VStack align="stretch" spacing={4}>
          <Heading size="xl" textAlign="center" mb={2}>
            Rejestracja
          </Heading>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Błąd</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Box>
            </Alert>
          )}

          <FormControl>
            <FormLabel>E-mail</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Podaj e-mail"
              bg="gray.700"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Hasło</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Podaj hasło"
              bg="gray.700"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Powtórz hasło</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Powtórz hasło"
              bg="gray.700"
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="teal"
            isLoading={isSubmitting}
            loadingText="Rejestracja..."
          >
            Zarejestruj
          </Button>

          <Button
            variant="link"
            colorScheme="teal"
            onClick={() => navigate("/login")}
          >
            Masz już konto? Zaloguj się
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}

export default RegisterPage;
