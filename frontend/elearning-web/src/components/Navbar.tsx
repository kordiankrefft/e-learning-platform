import {
  Flex,
  Heading,
  Spacer,
  Button,
  HStack,
  Box,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, logout, hasRole, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const goToSection = (id: string) => {
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Flex
      as="nav"
      align="center"
      px={{ base: 4, md: 8 }}
      h="64px"
      bg="black"
      color="white"
      boxShadow="md"
      position="sticky"
      top={0}
      zIndex={1000}
    >
      {/* Logo i nazwa*/}
      <HStack spacing={3} cursor="pointer" onClick={() => navigate("/")}>
        <Box
          w="32px"
          h="32px"
          borderRadius="full"
          bg="yellow.400"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontWeight="extrabold"
          color="black"
          fontSize="lg"
        >
          L
        </Box>
        <Box>
          <Heading size="md">Lingrow</Heading>
          <Text fontSize="xs" color="yellow.300">
            Nauka języków online
          </Text>
        </Box>
      </HStack>

      <Spacer />

      {/* Główne linki marketingowe */}
      <HStack spacing={6} display={{ base: "none", md: "flex" }} mr={4}>
        <Menu isLazy>
          <MenuButton
            as={Button}
            bg="yellow.400"
            color="black"
            fontWeight="bold"
            px={6}
            borderRadius="full"
            boxShadow="md"
            _hover={{
              bg: "yellow.300",
              transform: "translateY(-1px)",
              boxShadow: "lg",
            }}
            _active={{ bg: "yellow.500" }}
          >
            Kursy ▾
          </MenuButton>

          <MenuList bg="gray.900" borderColor="gray.700" color="white" p={2}>
            <MenuItem
              bg="gray.900"
              _hover={{ bg: "yellow.400", color: "black" }}
              onClick={() => navigate("/categories")}
            >
              Kategorie kursów
            </MenuItem>

            {isAuthenticated && hasRole("Student") && (
              <>
                <MenuDivider borderColor="gray.700" />
                <MenuItem
                  bg="gray.900"
                  _hover={{ bg: "yellow.400", color: "black" }}
                  onClick={() => navigate("/my-courses")}
                >
                  Moje kursy
                </MenuItem>
              </>
            )}
          </MenuList>
        </Menu>
        <Button
          variant="ghost"
          color="white"
          _hover={{ bg: "yellow.400", color: "black" }}
          onClick={() => goToSection("how-it-works")}
        >
          Jak to działa
        </Button>
        <Button
          variant="ghost"
          color="white"
          _hover={{ bg: "yellow.400", color: "black" }}
          onClick={() => goToSection("benefits")}
        >
          Korzyści
        </Button>
        <Button
          variant="ghost"
          color="white"
          _hover={{ bg: "yellow.400", color: "black" }}
          onClick={() => goToSection("footer")}
        >
          Kontakt
        </Button>
      </HStack>

      <HStack spacing={3}>
        {isAuthenticated && (
          <Button
            variant="ghost"
            color="white"
            size="sm"
            _hover={{ bg: "yellow.400", color: "black" }}
            onClick={() => navigate("/profile")}
          >
            {currentUser?.displayName ?? "Mój profil"}
          </Button>
        )}

        {/* skróty paneli zależne od roli*/}
        {isAuthenticated && hasRole("Tutor") && (
          <Button
            variant="ghost"
            color="white"
            size="sm"
            _hover={{ bg: "white", color: "black" }}
            onClick={() => navigate("/tutor/dashboard")}
          >
            Panel tutora
          </Button>
        )}
        {isAuthenticated && hasRole("Admin") && (
          <Button
            variant="ghost"
            color="white"
            size="sm"
            _hover={{ bg: "white", color: "black" }}
            onClick={() => navigate("/admin/dashboard")}
          >
            Panel admina
          </Button>
        )}

        {!isAuthenticated ? (
          <Button
            size="sm"
            colorScheme="yellow"
            bg="yellow.400"
            color="black"
            _hover={{ bg: "yellow.300" }}
            onClick={() => navigate("/login")}
          >
            Zaloguj się
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            borderColor="yellow.400"
            color="yellow.300"
            _hover={{ bg: "yellow.400", color: "black" }}
            onClick={handleLogout}
          >
            Wyloguj
          </Button>
        )}
      </HStack>
    </Flex>
  );
}

export default Navbar;
