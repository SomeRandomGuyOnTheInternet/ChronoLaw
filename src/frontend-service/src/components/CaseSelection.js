import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Card,
  CardBody,
  SimpleGrid,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

const CaseSelection = ({ onSelectCase }) => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [newCaseName, setNewCaseName] = useState('');
  const [newCaseDescription, setNewCaseDescription] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  
  // Mock data for demonstration
  useEffect(() => {
    // In a real app, this would be an API call to fetch cases
    const mockCases = [
      { id: '1', name: 'Smith vs. Johnson', description: 'Contract dispute case from 2023', createdAt: '2023-10-15' },
      { id: '2', name: 'Estate of Williams', description: 'Probate case for Williams estate', createdAt: '2023-11-22' },
      { id: '3', name: 'Davis Incorporation', description: 'Corporate litigation case', createdAt: '2024-01-05' }
    ];
    
    setCases(mockCases);
  }, []);
  
  const handleCreateCase = () => {
    if (!newCaseName.trim()) {
      toast({
        title: 'Case name required',
        description: 'Please enter a name for the case',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // In a real app, this would be an API call to create a new case
    const newCase = {
      id: Date.now().toString(),
      name: newCaseName,
      description: newCaseDescription,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setCases([...cases, newCase]);
    setNewCaseName('');
    setNewCaseDescription('');
    onClose();
    
    toast({
      title: 'Case created',
      description: `${newCaseName} has been created successfully`,
      status: 'success',
      duration: 3000,
      isClosable: true
    });
  };
  
  const handleSelectCase = (caseItem) => {
    onSelectCase(caseItem);
    navigate('/case');
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <Box p={8} maxW="1200px" mx="auto">
      <HStack justifyContent="space-between" mb={8}>
        <Heading size="xl">Legal Cases</Heading>
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="brand" 
          onClick={onOpen}
        >
          Create New Case
        </Button>
      </HStack>
      
      {cases.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" mb={4}>No cases found</Text>
          <Button colorScheme="brand" onClick={onOpen}>Create your first case</Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {cases.map(caseItem => (
            <Card 
              key={caseItem.id} 
              bg={bgColor}
              borderColor={borderColor}
              borderWidth="1px"
              borderRadius="lg"
              cursor="pointer"
              transition="all 0.2s"
              _hover={{ 
                transform: 'translateY(-5px)', 
                boxShadow: 'lg',
                bg: hoverBgColor
              }}
              onClick={() => handleSelectCase(caseItem)}
            >
              <CardBody>
                <VStack align="start" spacing={3}>
                  <Heading size="md">{caseItem.name}</Heading>
                  <Text color="gray.500" fontSize="sm">Created on {formatDate(caseItem.createdAt)}</Text>
                  <Text noOfLines={2}>{caseItem.description}</Text>
                  <Button 
                    size="sm" 
                    colorScheme="brand" 
                    variant="outline" 
                    alignSelf="flex-end"
                    mt={2}
                  >
                    Open Case
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
      
      {/* Create Case Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Case</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired>
              <FormLabel>Case Name</FormLabel>
              <Input 
                placeholder="Enter case name"
                value={newCaseName}
                onChange={(e) => setNewCaseName(e.target.value)}
              />
            </FormControl>
            
            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Input 
                placeholder="Enter case description"
                value={newCaseDescription}
                onChange={(e) => setNewCaseDescription(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button colorScheme="brand" mr={3} onClick={handleCreateCase}>
              Create
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CaseSelection;
