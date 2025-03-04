import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Container,
  VStack,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  useColorModeValue
} from '@chakra-ui/react';
import DocumentUpload from './components/DocumentUpload';
import Timeline from './components/Timeline';
import Chat from './components/Chat';

function App() {
  const [documents, setDocuments] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headerBgColor = useColorModeValue('brand.600', 'brand.800');
  const footerBgColor = useColorModeValue('brand.600', 'brand.800');

  const handleDocumentsProcessed = (data) => {
    setDocuments([...documents, ...data.documents]);
    setTimelineEvents([...timelineEvents, ...data.events]);
    setTabIndex(1); // Switch to Timeline tab
    setIsLoading(false);
  };

  return (
    <Flex direction="column" minH="100vh" bg={bgColor}>
      {/* Header */}
      <Box as="header" bg={headerBgColor} color="white" py={4} px={8} textAlign="center">
        <Heading as="h1" size="xl">ChronoLaw</Heading>
        <Text fontSize="lg" mt={1}>Legal Case Timeline Generator</Text>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" flex="1" py={8}>
        <Tabs 
          isFitted 
          variant="enclosed" 
          colorScheme="brand" 
          index={tabIndex} 
          onChange={setTabIndex}
        >
          <TabList mb={4}>
            <Tab>Upload Documents</Tab>
            <Tab isDisabled={timelineEvents.length === 0}>Timeline</Tab>
            <Tab isDisabled={timelineEvents.length === 0}>Chat</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <DocumentUpload 
                onDocumentsProcessed={handleDocumentsProcessed}
                setIsLoading={setIsLoading}
              />
            </TabPanel>
            <TabPanel>
              <Timeline 
                events={timelineEvents}
                documents={documents}
              />
            </TabPanel>
            <TabPanel>
              <Chat 
                timelineEvents={timelineEvents}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>

      {/* Footer */}
      <Box as="footer" bg={footerBgColor} color="white" py={4} textAlign="center">
        <Text>&copy; {new Date().getFullYear()} ChronoLaw - All Rights Reserved</Text>
      </Box>

      {/* Loading Modal */}
      <Modal isOpen={isLoading} closeOnOverlayClick={false} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">Processing Documents</ModalHeader>
          <ModalBody pb={6}>
            <VStack spacing={4} align="center">
              <Spinner size="xl" thickness="4px" speed="0.65s" color="brand.500" />
              <Text>This may take a few minutes depending on the size and number of documents.</Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default App;
