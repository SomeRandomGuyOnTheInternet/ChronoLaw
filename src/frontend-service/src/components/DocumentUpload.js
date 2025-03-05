import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  List,
  ListItem,
  useToast,
  Badge,
  Card,
  CardBody,
  Divider
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const DocumentUpload = ({ onDocumentsProcessed, setIsLoading }) => {
  const [files, setFiles] = useState([]);
  const toast = useToast();

  const onDrop = useCallback((acceptedFiles) => {
    // Filter for only PDF and DOCX files
    const filteredFiles = acceptedFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    
    // Show warning if some files were filtered out
    if (filteredFiles.length < acceptedFiles.length) {
      toast({
        title: 'Some files were not accepted',
        description: 'Only PDF and DOCX files are allowed.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
    
    setFiles(prevFiles => [...prevFiles, ...filteredFiles]);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast({
        title: 'No files to upload',
        description: 'Please add at least one document.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('documents', file);
    });

    try {
      setIsLoading(true);
      
      const response = await axios.post(SERVER_URL + '/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast({
        title: 'Upload successful',
        description: `${files.length} document(s) processed successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Clear files after successful upload
      setFiles([]);
      
      // Pass the processed data to the parent component
      onDocumentsProcessed(response.data);
    } catch (error) {
      setIsLoading(false);
      
      toast({
        title: 'Upload failed',
        description: error.response?.data?.message || 'An error occurred while processing the documents.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      console.error('Error uploading files:', error);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Heading size="lg">Upload Documents</Heading>
      <Text>
        Upload PDF or DOCX documents containing dates and events. The system will analyze the documents
        and extract a timeline of events.
      </Text>
      
      <Box
        {...getRootProps()}
        p={10}
        border="2px dashed"
        borderColor={isDragActive ? 'brand.500' : 'gray.300'}
        borderRadius="md"
        bg={isDragActive ? 'brand.50' : 'transparent'}
        textAlign="center"
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ borderColor: 'brand.400', bg: 'brand.50' }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <Text fontWeight="bold" color="brand.500">Drop the files here...</Text>
        ) : (
          <VStack spacing={2}>
            <Text fontWeight="bold">Drag and drop files here, or click to select files</Text>
            <Text fontSize="sm" color="gray.500">Only PDF and DOCX files are accepted</Text>
          </VStack>
        )}
      </Box>
      
      {files.length > 0 && (
        <Card variant="outline">
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Heading size="md">Selected Documents ({files.length})</Heading>
                <Button 
                  size="sm" 
                  colorScheme="red" 
                  variant="outline" 
                  onClick={() => setFiles([])}
                >
                  Clear All
                </Button>
              </HStack>
              
              <Divider />
              
              <List spacing={2}>
                {files.map((file, index) => (
                  <ListItem key={index}>
                    <Flex justify="space-between" align="center">
                      <HStack>
                        <Badge colorScheme={file.type.includes('pdf') ? 'red' : 'blue'}>
                          {file.type.includes('pdf') ? 'PDF' : 'DOCX'}
                        </Badge>
                        <Text>{file.name}</Text>
                        <Text fontSize="xs" color="gray.500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </Text>
                      </HStack>
                      <Button 
                        size="xs" 
                        colorScheme="red" 
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </Button>
                    </Flex>
                  </ListItem>
                ))}
              </List>
            </VStack>
          </CardBody>
        </Card>
      )}
      
      <Button 
        colorScheme="brand" 
        size="lg" 
        onClick={uploadFiles} 
        isDisabled={files.length === 0}
        mt={4}
      >
        Process Documents
      </Button>
    </VStack>
  );
};

export default DocumentUpload;
