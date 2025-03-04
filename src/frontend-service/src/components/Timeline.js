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

const Timeline = ({ events, documents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterDocument, setFilterDocument] = useState('');
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('brand.500', 'brand.300');
  
  // Filter and sort events
  const filteredEvents = events
    .filter(event => {
      const matchesSearch = 
        event.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.context.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.date.includes(searchTerm);
      
      const matchesDocument = 
        filterDocument === '' || event.documentId === filterDocument;
      
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
  
  // Get unique document IDs for filtering
  const uniqueDocuments = [...new Set(events.map(event => event.documentId))];
  
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
          {documents.map(doc => (
            <option key={doc.id} value={doc.id}>
              {doc.name}
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
          
          {filteredEvents.map((event, index) => {
            // Find the document this event belongs to
            const document = documents.find(doc => doc.id === event.documentId);
            
            return (
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
                      {document && (
                        <Badge colorScheme="blue" fontSize="sm">
                          {document.name}
                        </Badge>
                      )}
                    </HStack>
                  </CardHeader>
                  
                  <Divider />
                  
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <Text fontWeight="bold">{event.summary}</Text>
                      <Text fontSize="sm" fontStyle="italic" color="gray.600">
                        "{event.context}"
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </Flex>
            );
          })}
        </VStack>
      ) : (
        <Alert status="info">
          <AlertIcon />
          {events.length === 0 
            ? "No events found. Please upload documents to generate a timeline."
            : "No events match your search criteria. Try adjusting your filters."}
        </Alert>
      )}
    </VStack>
  );
};

export default Timeline;
