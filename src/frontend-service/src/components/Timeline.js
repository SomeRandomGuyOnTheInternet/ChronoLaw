import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Divider,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Select,
  Stack,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

const mockEvents = [
  {
    id: "event1",
    title: "Leasing Agreement Negotiation",
    date: "2021-10-15",
    description: "Initial negotiation of the leasing agreement terms between Smith Corp and Acme Industries.",
    participants: ["John Davis", "Sarah Johnson", "Michael Chen"],
    document: "Draft Agreement v1",
    location: "Smith Corp HQ",
    context: "Initial phase of the leasing process"
  },
  {
    id: "event2",
    title: "Leasing Agreement Signed",
    date: "2021-10-15",
    description: "Final leasing agreement signed by all parties.",
    participants: ["John Davis", "Michael Chen", "Legal Team"],
    document: "Signed Agreement",
    location: "Acme Industries Office",
    context: "Completion of the agreement phase"
  },
  {
    id: "event3",
    title: "Follow-up Enquiry",
    date: "2022-06-20",
    description: "Follow-up enquiry regarding the implementation of the leasing agreement terms.",
    participants: ["John Davis", "Support Team"],
    document: "Status Report",
    location: "Email Communication",
    context: "Post-agreement follow-up"
  },
  {
    id: "event4",
    title: "Email from Michael Chen",
    date: "2022-09-22",
    description: "Email from Michael Chen discussing potential issues with the current lease terms.",
    participants: ["Michael Chen", "John Davis", "Legal Team"],
    document: "Attachment: Revised Terms",
    location: "Email Communication",
    context: "Issue identification phase"
  }
];

const Timeline = ({ events, documents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterDocument, setFilterDocument] = useState('');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('brand.500', 'brand.300');

  // Use mock events if no events are provided
  const displayEvents = events.length > 0 ? events : mockEvents;

  // Filter and sort events
  const filteredEvents = displayEvents
    .filter(event => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.context && event.context.toLowerCase().includes(searchTerm.toLowerCase())) ||
        event.date.includes(searchTerm);

      const matchesDocument =
        filterDocument === '' ||
        (event.document && event.document.toLowerCase().includes(filterDocument.toLowerCase()));

      return matchesSearch && matchesDocument;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get unique documents for filtering
  const uniqueDocuments = [...new Set(displayEvents.flatMap(event => event.document || []))];

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg">Case Timeline</Heading>

      {/* Filters and Controls */}
      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={4}
        align={{ base: 'stretch', md: 'center' }}
      >
        <InputGroup maxW={{ base: '100%', md: '300px' }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={SearchIcon} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search timeline..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <Select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          maxW={{ base: '100%', md: '200px' }}
        >
          <option value="asc">Oldest First</option>
          <option value="desc">Newest First</option>
        </Select>

        <Select
          value={filterDocument}
          onChange={(e) => setFilterDocument(e.target.value)}
          placeholder="All Documents"
          maxW={{ base: '100%', md: '250px' }}
        >
          {uniqueDocuments.map((doc, index) => (
            <option key={index} value={doc}>
              {doc}
            </option>
          ))}
        </Select>
      </Stack>

      {/* Timeline */}
      {filteredEvents.length > 0 ? (
        <VStack spacing={4} align="stretch" position="relative">
          {/* Vertical line */}
          <Box
            position="absolute"
            left="24px"
            top="0"
            bottom="0"
            width="2px"
            bg={accentColor}
            zIndex={1}
          />

          {filteredEvents.map((event, index) => (
            <Flex key={index} position="relative">
              {/* Timeline dot */}
              <Box
                position="absolute"
                left="20px"
                top="24px"
                width="10px"
                height="10px"
                borderRadius="full"
                bg={accentColor}
                zIndex={2}
              />

              {/* Event card */}
              <Card
                ml={12}
                width="100%"
                variant="outline"
                bg={bgColor}
                borderColor={borderColor}
                borderLeftWidth="4px"
                borderLeftColor={accentColor}
              >
                <CardHeader pb={2}>
                  <HStack justify="space-between" wrap="wrap">
                    <Heading size="md" color={accentColor}>
                      {formatDate(event.date)}
                    </Heading>
                    {event.location && (
                      <Badge colorScheme="blue" fontSize="sm">
                        {event.location}
                      </Badge>
                    )}
                  </HStack>
                </CardHeader>

                <Divider />

                <CardBody>
                  <VStack align="start" spacing={3}>
                    <Text fontWeight="bold">{event.title}</Text>

                    {event.description && (
                      <Text>{event.description}</Text>
                    )}

                    {event.context && (
                      <Text fontSize="sm" fontStyle="italic" color="gray.600">
                        "{event.context}"
                      </Text>
                    )}

                    {event.participants && event.participants.length > 0 && (
                      <HStack flexWrap="wrap">
                        <Text fontWeight="semibold">Participants:</Text>
                        {event.participants.map((participant, i) => (
                          <Badge key={i} colorScheme="green">
                            {participant}
                          </Badge>
                        ))}
                      </HStack>
                    )}

                    {event.document && (
                      <HStack flexWrap="wrap">
                        <Text fontWeight="semibold">Documents:</Text>
                        <Badge colorScheme="purple">
                          {event.document}
                        </Badge>
                      </HStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </Flex>
          ))}
        </VStack>
      ) : (
        <Alert status="info">
          <AlertIcon />
          {events.length === 0 && filteredEvents.length === 0
            ? "No events found. Please upload documents to generate a timeline."
            : "No events match your search criteria. Try adjusting your filters."}
        </Alert>
      )}
    </VStack>
  );
};

export default Timeline;
