import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  Icon,
  useColorModeValue,
  useColorMode,
  Image
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { FaFileUpload, FaStream, FaRobot } from 'react-icons/fa';

const FeatureCard = ({ icon, title, children, ...rest }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.750');
  const textColor = useColorModeValue('gray.800', 'white');
  
  return (
    <Card
      color={textColor}
      borderWidth="2px" 
      borderColor={borderColor} 
      borderStyle="solid" 
      textAlign={"left"}
      borderRadius="lg"
      boxShadow="xl"
      height="100%"
      padding={5}
      {...rest}
    >
      <CardHeader>
        <Box flex="1" display="flex" justifyContent="left" alignItems="center">
          <Icon as={icon} boxSize={10} color="blue.300"  marginRight={"15px"} />
          <Heading size="md" fontWeight="bold">
            {title}
          </Heading>
        </Box>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="flex-start" paddingX={5}>
          {children}
        </VStack>
      </CardBody>
    </Card>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  
  const handleGetStarted = () => {
    navigate('/cases');
  };
  
  return (
    <Box bg={bgColor} color={textColor} minH="100vh">
      <Container maxW="container.xl" py={20}>
        <VStack spacing={12} align="center" textAlign="center">
          {/* Hero Section */}
          <VStack spacing={6}>
            <Box textAlign="center" flex="1" display="flex" justifyContent="center" alignItems="center">
              <Image 
                src="/chronolaw-logo.png" 
                alt="chronolaw Logo" 
                height="60px"
                filter={colorMode === 'dark' ? 'brightness(1.2)' : 'none'}
              />
              <Heading 
                as="h1" 
                size="4xl" 
                fontWeight="bold" 
                color={textColor}
                lineHeight="1.2"
                ml={4}
              >
                chronolaw
              </Heading>
            </Box>
            <Heading as="h2" size="xl" fontWeight="medium">
              Your AI-Powered Legal Timeline Assistant
            </Heading>
            <Text fontSize="xl" maxW="3xl" opacity={0.8} mt={4}>
              From scattered documents to structured case timelines—effortlessly.
            </Text>
            
            <Button 
              size="lg" 
              colorScheme="blue" 
              mt={8}
              rightIcon={<ChevronDownIcon />}
              onClick={handleGetStarted}
              height="60px"
              px={8}
              fontSize="xl"
            >
              Get Started
            </Button>
          </VStack>
          
          {/* Features Section */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} width="100%" mt={20}>
          <FeatureCard icon={FaStream} title="AI-Generated Case Timeline">
              <Box as="ul">
                <li>AI extracts key events from case files</li>
                <li>Automatically arranges events into a structured timeline</li>
              </Box>
            </FeatureCard>

            <FeatureCard icon={FaFileUpload} title="Upload & Process Documents">
              <Box as="ul">
                <li>Process anything from scanned documents to email threads</li>
                <li>Cutting edge OCR support, so documents without selectable text can also be processed</li>
                <li>Documents: PDFs, Word</li>
              </Box>
            </FeatureCard>
            
            <FeatureCard icon={FaRobot} title="Smart Legal Chatbot">
              <Box as="ul">
                <li>AI chatbot summarises and answers questions about case files</li>
                <li>Speeds up case preparation and analysis</li>
              </Box>
            </FeatureCard>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default LandingPage;
