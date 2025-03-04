import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Avatar,
  Card,
  CardBody,
  useColorModeValue,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { ArrowUpIcon } from '@chakra-ui/icons';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Chat = ({ timelineEvents }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  const userBgColor = useColorModeValue('brand.100', 'brand.900');
  const botBgColor = useColorModeValue('gray.100', 'gray.700');
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          sender: 'bot',
          text: 'Hello! I can answer questions about the timeline and documents. What would you like to know?'
        }
      ]);
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = {
      sender: 'user',
      text: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(SERVER_URL + '/api/chat', { message: input });
      
      const botMessage = {
        sender: 'bot',
        text: response.data.response
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      setError(
        error.response?.data?.message || 
        'An error occurred while processing your message. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <VStack spacing={4} h="full" align="stretch">
      <Heading size="lg">Chat with Your Timeline</Heading>
      <Text>
        Ask questions about the events in your timeline. The AI will use the information
        extracted from your documents to provide answers.
      </Text>
      
      {timelineEvents.length === 0 ? (
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>No timeline data available</AlertTitle>
          <AlertDescription>
            Please upload and process documents first to generate a timeline that can be queried.
          </AlertDescription>
        </Alert>
      ) : (
        <Flex direction="column" flex="1" h="500px">
          {/* Messages Container */}
          <Box 
            flex="1" 
            overflowY="auto" 
            p={4} 
            borderWidth="1px" 
            borderRadius="md"
            mb={4}
          >
            <VStack spacing={4} align="stretch">
              {messages.map((message, index) => (
                <Flex 
                  key={index} 
                  justify={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                >
                  <HStack 
                    alignItems="flex-start" 
                    spacing={2} 
                    maxW="80%"
                  >
                    {message.sender === 'bot' && (
                      <Avatar size="sm" name="ChronoLaw" bg="brand.500" />
                    )}
                    
                    <Card 
                      bg={message.sender === 'user' ? userBgColor : botBgColor}
                      borderRadius="lg"
                    >
                      <CardBody py={2} px={3}>
                        <Text>{message.text}</Text>
                      </CardBody>
                    </Card>
                    
                    {message.sender === 'user' && (
                      <Avatar size="sm" name="User" bg="gray.500" />
                    )}
                  </HStack>
                </Flex>
              ))}
              
              {isLoading && (
                <Flex justify="flex-start">
                  <HStack alignItems="center" spacing={2}>
                    <Avatar size="sm" name="ChronoLaw" bg="brand.500" />
                    <Card bg={botBgColor} borderRadius="lg">
                      <CardBody py={2} px={4}>
                        <Spinner size="sm" mr={2} />
                        <Text as="span">Thinking...</Text>
                      </CardBody>
                    </Card>
                  </HStack>
                </Flex>
              )}
              
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              
              <div ref={messagesEndRef} />
            </VStack>
          </Box>
          
          {/* Input Area */}
          <HStack>
            <Input
              placeholder="Ask a question about your timeline..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || timelineEvents.length === 0}
            />
            <IconButton
              colorScheme="brand"
              aria-label="Send message"
              icon={<ArrowUpIcon />}
              onClick={handleSendMessage}
              isLoading={isLoading}
              disabled={!input.trim() || timelineEvents.length === 0}
            />
          </HStack>
        </Flex>
      )}
    </VStack>
  );
};

export default Chat;
