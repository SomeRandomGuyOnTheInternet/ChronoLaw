import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
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
  useColorModeValue,
  Button,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import DocumentUpload from './DocumentUpload';
import Timeline from './Timeline';
import Chat from './Chat';
import Mindmap from './Mindmap';

const Case = ({ selectedCase, onBack }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');

  const handleDocumentsProcessed = (data) => {
    setDocuments([...documents, ...data.documents]);
    setTimelineEvents([...timelineEvents, ...data.events]);
    setTabIndex(1); // Switch to Timeline tab
    setIsLoading(false);
  };

  const handleBackClick = () => {
    onBack(); // Reset the selected case
    navigate('/cases');
  };

  return (
    <Container maxW="container.xl" flex="1" py={8} color={textColor}>
      {selectedCase && (
        <Box mb={6}>
          <HStack spacing={4} mb={4}>
            <IconButton
              icon={<ArrowBackIcon />}
              aria-label="Back to cases"
              onClick={handleBackClick}
              variant="outline"
            />
            <Button variant="link" onClick={handleBackClick}>
              Back to cases
            </Button>
          </HStack>
          <Heading size="lg" mb={2}>{selectedCase.name}</Heading>
          <Text color="gray.500">{selectedCase.description}</Text>
        </Box>
      )}
      
      <Tabs 
        isFitted 
        variant="enclosed" 
        colorScheme="brand" 
        index={tabIndex} 
        onChange={setTabIndex}
        height="100%"
      >
        <TabList mb={4}>
          <Tab>Documents</Tab>
          <Tab>Timeline</Tab>
          <Tab>Mindmap</Tab>
          <Tab>Chat</Tab>
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
            <Mindmap 
              timelineEvents={timelineEvents}
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

      {/* Loading Modal */}
      <Modal isOpen={isLoading} closeOnOverlayClick={false} isCentered>
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader textAlign="center">Processing Documents</ModalHeader>
          <ModalBody pb={6}>
            <VStack spacing={4} align="center">
              <Spinner size="xl" thickness="4px" speed="0.65s" color="brand.500" />
              <Text>This may take a few minutes depending on the size and number of documents.</Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Case;
