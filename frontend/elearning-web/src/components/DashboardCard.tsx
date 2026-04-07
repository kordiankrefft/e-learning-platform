import { Card, CardBody, Heading, Text, Button } from "@chakra-ui/react";

export function DashboardCard({
  title,
  description,
  buttonText,
  onClick,
}: {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}) {
  return (
    <Card bg="gray.800" color="white">
      <CardBody>
        <Heading size="md" mb={2}>
          {title}
        </Heading>
        <Text mb={4} color="gray.200">
          {description}
        </Text>
        <Button colorScheme="purple" onClick={onClick}>
          {buttonText}
        </Button>
      </CardBody>
    </Card>
  );
}
