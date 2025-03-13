import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  useColorModeValue,
  useColorMode,
  IconButton,
  Image
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import CaseSelection from './components/CaseSelection';
import Case from './components/Case';
import LandingPage from './components/LandingPage';

function App() {
  // const navigate = useNavigate();
  const [selectedCase, setSelectedCase] = useState(null);
  
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headerBgColor = useColorModeValue('gray.50', 'gray.900');
  const footerBgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.750');
  const textColor = useColorModeValue('gray.800', 'white');

  const handleSelectCase = (caseItem) => {
    setSelectedCase(caseItem);
  };

  // Reset selected case when navigating to cases page
  const resetSelectedCase = () => {
    setSelectedCase(null);
  };

  return (
    <Router>
      <Flex direction="column" minH="100vh" bg={bgColor}>
        {/* Header - Only show on non-landing pages */}
        <Routes>
          <Route path="/" element={null} />
          <Route path="*" element={
            <Flex 
              as="header" 
              bg={headerBgColor} 
              color={textColor} 
              py={4} 
              px={8} 
              alignItems="center" 
              justifyContent="space-between" 
              borderWidth="2px" 
              borderColor={borderColor} 
              borderStyle="solid" 
              borderTop={0} 
              borderLeft={0} 
              borderRight={0}
            >
              <Box textAlign="center" flex="1" display="flex" justifyContent="center" alignItems="center">
                <Image 
                  src="/chronolaw-logo.png" 
                  alt="chronolaw Logo" 
                  height="60px"
                  filter={colorMode === 'dark' ? 'brightness(1.2)' : 'none'}
                />
                <Heading size="xl" ml={4}>
                  chronolaw
                </Heading>
              </Box>
              <IconButton
                aria-label="Toggle dark mode"
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                color={textColor}
                fontSize="20px"
                _hover={{ bg: 'whiteAlpha.200' }}
              />
            </Flex>
          } />
        </Routes>

        {/* Main Content */}
        <Box flex="1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/cases" 
              element={
                <CaseSelection onSelectCase={handleSelectCase} />
              } 
            />
            <Route 
              path="/case" 
              element={
                selectedCase ? 
                <Case selectedCase={selectedCase} onBack={resetSelectedCase} /> : 
                <Navigate to="/cases" />
              } 
            />
          </Routes>
        </Box>

        {/* Footer - Only show on non-landing pages */}
        <Routes>
          <Route path="/" element={null} />
          <Route path="*" element={
            <Box 
              as="footer" 
              bg={footerBgColor} 
              color="white" 
              py={4} 
              textAlign="center" 
              borderWidth="2px" 
              borderColor={borderColor} 
              borderStyle="solid" 
              borderBottom={0} 
              borderLeft={0} 
              borderRight={0}
            >
              <Text>&copy; {new Date().getFullYear()} chronolaw - All Rights Reserved</Text>
            </Box>
          } />
        </Routes>
      </Flex>
    </Router>
  );
}

export default App;
