import { Outlet } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout() {
  return (
    <Box
      w="100%"
      bg="gray.900"
      color="white"
      minH="100vh"
      display="flex"
      flexDirection="column"
    >
      <Navbar />

      <Box as="main" flex="1">
        <Outlet />
      </Box>

      <Footer />
    </Box>
  );
}

export default Layout;
