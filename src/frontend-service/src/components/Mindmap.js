import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Spinner,
  useColorModeValue,
  Flex,
  Center,
  IconButton,
  HStack,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Badge
} from '@chakra-ui/react';
import { AddIcon, MinusIcon, RepeatIcon } from '@chakra-ui/icons';
import { FaCalendarAlt, FaFileAlt, FaUserAlt } from 'react-icons/fa';

const Mindmap = ({ timelineEvents, documents }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [mindmapData, setMindmapData] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState(null);
  const containerRef = useRef(null);
  
  const bgColor = useColorModeValue('gray.100', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const nodeColor = useColorModeValue('white', 'gray.700');
  const lineColor = useColorModeValue('black', 'white');
  
  useEffect(() => {
    // Create mock timeline events if none are provided
    const mockTimelineEvents = [
      {
        id: "event1",
        title: "Leasing Agreement Negotiation",
        date: "2021-10-15",
        description: "Initial negotiation of the leasing agreement terms between Smith Corp and Acme Industries.",
        participants: ["John Davis", "Sarah Johnson", "Michael Chen"],
        documents: ["Draft Agreement v1", "Meeting Minutes"],
        location: "Smith Corp HQ",
        context: "Initial phase of the leasing process"
      },
      {
        id: "event2",
        title: "Leasing Agreement Signed",
        date: "2021-10-15",
        description: "Final leasing agreement signed by all parties.",
        participants: ["John Davis", "Michael Chen", "Legal Team"],
        documents: ["Signed Agreement", "Appendix A", "Appendix B"],
        location: "Acme Industries Office",
        context: "Completion of the agreement phase"
      },
      {
        id: "event3",
        title: "Follow-up Enquiry",
        date: "2022-06-20",
        description: "Follow-up enquiry regarding the implementation of the leasing agreement terms.",
        participants: ["John Davis", "Support Team"],
        documents: ["Email Thread", "Status Report"],
        location: "Email Communication",
        context: "Post-agreement follow-up"
      },
      {
        id: "event4",
        title: "Email from Michael Chen",
        date: "2022-09-22",
        description: "Email from Michael Chen discussing potential issues with the current lease terms.",
        participants: ["Michael Chen", "John Davis", "Legal Team"],
        documents: ["Email", "Attachment: Revised Terms"],
        location: "Email Communication",
        context: "Issue identification phase"
      }
    ];
    
    const events = timelineEvents && timelineEvents.length > 0 ? timelineEvents : mockTimelineEvents;
    
    const generatedMindmapData = generateMindmapFromEvents(events);
    setMindmapData(generatedMindmapData);
  }, [timelineEvents]);
  
  const generateMindmapFromEvents = (events) => {
    if (!events || events.length === 0) return null;
    
    const canvasWidth = 900;
    const canvasHeight = 800;
    const padding = 100;
    
    const eventsByDate = {};
    events.forEach(event => {
      const dateKey = event.date.split('T')[0];
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    });
    
    const uniqueDates = Object.keys(eventsByDate).sort((a, b) => {
      return new Date(a) - new Date(b);
    });
    
    const nodes = [];
    const connections = [];
    const nodeMap = {};
    const verticalSpacing = (canvasHeight - 2 * padding) / Math.max(1, uniqueDates.length - 1);
    
    uniqueDates.forEach((dateKey, dateIndex) => {
      const eventsOnThisDate = eventsByDate[dateKey];
      const y = dateIndex === 0 ? padding : padding + dateIndex * verticalSpacing;
      const horizontalSpacing = (canvasWidth - 2 * padding) / Math.max(1, eventsOnThisDate.length - 1);
      
      eventsOnThisDate.forEach((event, eventIndex) => {
        const x = eventsOnThisDate.length === 1 
          ? canvasWidth / 2 
          : padding + eventIndex * horizontalSpacing;
        
        const node = {
          id: event.id,
          title: event.title,
          date: formatDate(event.date),
          x: x,
          y: y,
          details: {
            description: event.description,
            participants: event.participants,
            documents: event.documents,
            location: event.location,
            context: event.context
          }
        };
        
        nodes.push(node);
        nodeMap[event.id] = { x, y, dateIndex };
      });
    });
    
    for (let dateIndex = 0; dateIndex < uniqueDates.length - 1; dateIndex++) {
      const currentDateKey = uniqueDates[dateIndex];
      const nextDateKey = uniqueDates[dateIndex + 1];
      
      const currentDateEvents = eventsByDate[currentDateKey];
      const nextDateEvents = eventsByDate[nextDateKey];
      
      if (currentDateEvents.length === 1 && nextDateEvents.length === 1) {
        connections.push({
          from: currentDateEvents[0].id,
          to: nextDateEvents[0].id,
          type: "straight"
        });
      } else if (currentDateEvents.length === 1) {
        nextDateEvents.forEach(nextEvent => {
          connections.push({
            from: currentDateEvents[0].id,
            to: nextEvent.id,
            type: "curved"
          });
        });
      } else if (nextDateEvents.length === 1) {
        currentDateEvents.forEach(currentEvent => {
          connections.push({
            from: currentEvent.id,
            to: nextDateEvents[0].id,
            type: "curved"
          });
        });
      } else {
        currentDateEvents.forEach(currentEvent => {
          const currentNodePos = nodeMap[currentEvent.id];
          
          let closestEvent = nextDateEvents[0];
          let minDistance = Math.abs(currentNodePos.x - nodeMap[closestEvent.id].x);
          
          for (let i = 1; i < nextDateEvents.length; i++) {
            const nextEvent = nextDateEvents[i];
            const nextNodePos = nodeMap[nextEvent.id];
            const distance = Math.abs(currentNodePos.x - nextNodePos.x);
            
            if (distance < minDistance) {
              minDistance = distance;
              closestEvent = nextEvent;
            }
          }
          
          connections.push({
            from: currentEvent.id,
            to: closestEvent.id,
            type: "curved"
          });
        });
      }
    }
    
    return { nodes, connections };
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' }).toUpperCase();
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };
  
  const generateMindmap = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };
  
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };
  
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    // Only initiate dragging if not clicking on a node
    if (e.button === 0 && e.target === containerRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };
  
  const MindmapNode = ({ node }) => {
    return (
      <div
        style={{
          position: 'absolute',
          left: `${node.x}px`,
          top: `${node.y}px`,
          transform: 'translate(-50%, -50%)',
          zIndex: 10, 
          pointerEvents: 'auto'
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleNodeClick(node);
        }}
      >
        <Box
          bg={nodeColor}
          color={textColor}
          borderRadius="md"
          p={5}
          width="300px"
          textAlign="center"
          boxShadow="lg"
          borderWidth="1px"
          borderColor={borderColor}
          transition="all 0.2s"
          _hover={{
            boxShadow: "xl",
            transform: "scale(1.05)",
            cursor: "pointer"
          }}
        >
          <Text fontSize="sm" fontWeight="bold" mb={2}>
            {node.date}
          </Text>
          <Text fontSize="lg" fontWeight="bold">
            {node.title}
          </Text>
        </Box>
      </div>
    );
  };
  
  const renderConnections = () => {
    return mindmapData.connections.map((connection, index) => {
      const fromNode = mindmapData.nodes.find(n => n.id === connection.from);
      const toNode = mindmapData.nodes.find(n => n.id === connection.to);
      
      if (!fromNode || !toNode) return null;
      
      const markerId = `arrowhead-${index}`;
      
      if (connection.type === "curved") {
        const isTopToMiddle = fromNode.y < toNode.y && Math.abs(fromNode.x - toNode.x) > 100;
        let controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y;
        
        if (isTopToMiddle) {          
          if (fromNode.x < toNode.x) {
            controlPoint1X = fromNode.x + Math.abs(toNode.x - fromNode.x) * 0.5;
            controlPoint1Y = fromNode.y;
            controlPoint2X = toNode.x;
            controlPoint2Y = toNode.y - Math.abs(toNode.y - fromNode.y) * 0.5;
          } else {
            controlPoint1X = fromNode.x - Math.abs(fromNode.x - toNode.x) * 0.5;
            controlPoint1Y = fromNode.y;
            controlPoint2X = toNode.x;
            controlPoint2Y = toNode.y - Math.abs(toNode.y - fromNode.y) * 0.5;
          }
        } else {
          controlPoint1X = (fromNode.x + toNode.x) / 2;
          controlPoint1Y = fromNode.y;
          controlPoint2X = (fromNode.x + toNode.x) / 2;
          controlPoint2Y = toNode.y;
        }
        
        return (
          <svg 
            key={index} 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%',
              zIndex: 1,
              overflow: 'visible',
              pointerEvents: 'none'
            }}
          >
            <path
              d={`M ${fromNode.x} ${fromNode.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${toNode.x} ${toNode.y}`}
              stroke={lineColor}
              strokeWidth="2"
              fill="none"
              markerEnd={`url(#${markerId})`}
            />
            <defs>
              <marker
                id={markerId}
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill={lineColor} />
              </marker>
            </defs>
          </svg>
        );
      } else {
        return (
          <svg 
            key={index} 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%',
              zIndex: 1,
              overflow: 'visible',
              pointerEvents: 'none'
            }}
          >
            <line
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={lineColor}
              strokeWidth="2"
              markerEnd={`url(#${markerId})`}
            />
            <defs>
              <marker
                id={markerId}
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill={lineColor} />
              </marker>
            </defs>
          </svg>
        );
      }
    });
  };
  
  return (
    <Box>
      <Flex direction="column" mb={6}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading size="lg" color={textColor}>Case Mindmap</Heading>
          <Button 
            colorScheme="blue" 
            onClick={generateMindmap}
            isLoading={isLoading}
            loadingText="Generating"
          >
            Regenerate Mindmap
          </Button>
        </Flex>
        <Text fontSize="sm" color="gray.500" mt={2}>
          Tip: Click on any node to view more details. Drag to pan, use zoom controls to zoom in/out.
        </Text>
      </Flex>
      
      {isLoading ? (
        <Center py={10}>
          <Spinner size="xl" mb={4} />
          <Text>Generating mindmap from your case data...</Text>
        </Center>
      ) : mindmapData ? (
        <Box 
          position="relative" 
          height="800px" 
          bg={bgColor} 
          borderRadius="lg" 
          p={4}
          overflow="hidden"
          boxShadow="md"
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          cursor={isDragging ? "grabbing" : "grab"}
        >
          <Box
            position="absolute"
            transform={`scale(${scale}) translate(${position.x}px, ${position.y}px)`}
            transformOrigin="center"
            width="100%"
            height="100%"
            pointerEvents="none" // Make this container not capture pointer events
          >
            {renderConnections()}
            {mindmapData.nodes.map(node => (
              <MindmapNode key={node.id} node={node} />
            ))}
          </Box>
          
          <HStack position="absolute" bottom="4" right="4" spacing={2} zIndex={20}>
            <Tooltip label="Reset view">
              <IconButton
                icon={<RepeatIcon />}
                onClick={handleReset}
                aria-label="Reset view"
                size="sm"
                colorScheme="blue"
                variant="outline"
              />
            </Tooltip>
            <Tooltip label="Zoom out">
              <IconButton
                icon={<MinusIcon />}
                onClick={handleZoomOut}
                aria-label="Zoom out"
                size="sm"
                colorScheme="blue"
                isDisabled={scale <= 0.5}
              />
            </Tooltip>
            <Tooltip label="Zoom in">
              <IconButton
                icon={<AddIcon />}
                onClick={handleZoomIn}
                aria-label="Zoom in"
                size="sm"
                colorScheme="blue"
                isDisabled={scale >= 2}
              />
            </Tooltip>
          </HStack>
        </Box>
      ) : (
        <Box textAlign="center" py={10}>
          <Text>Click "Generate Mindmap" to analyze your case data</Text>
        </Box>
      )}
      
      <Modal 
        isOpen={selectedNode !== null} 
        onClose={() => setSelectedNode(null)} 
        size="lg"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedNode?.title}
            <Text fontSize="sm" fontWeight="normal" mt={1} color="gray.500">
              {selectedNode?.date}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedNode && (
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Heading size="sm" mb={2}>Description</Heading>
                  <Text>{selectedNode.details.description}</Text>
                </Box>
                
                <Box>
                  <Heading size="sm" mb={2}>
                    <Flex align="center">
                      <Box as={FaUserAlt} mr={2} />
                      Participants
                    </Flex>
                  </Heading>
                  <Flex wrap="wrap" gap={2}>
                    {selectedNode.details.participants.map((participant, index) => (
                      <Badge key={index} colorScheme="blue" py={1} px={2} borderRadius="md">
                        {participant}
                      </Badge>
                    ))}
                  </Flex>
                </Box>
                
                <Box>
                  <Heading size="sm" mb={2}>
                    <Flex align="center">
                      <Box as={FaFileAlt} mr={2} />
                      Related Documents
                    </Flex>
                  </Heading>
                  <VStack align="stretch" spacing={1}>
                    {selectedNode.details.documents.map((doc, index) => (
                      <Text key={index} pl={2} borderLeftWidth="2px" borderColor="blue.400">
                        {doc}
                      </Text>
                    ))}
                  </VStack>
                </Box>
                
                <Box>
                  <Heading size="sm" mb={2}>
                    <Flex align="center">
                      <Box as={FaCalendarAlt} mr={2} />
                      Location
                    </Flex>
                  </Heading>
                  <Text>{selectedNode.details.location}</Text>
                </Box>
                
                {selectedNode.details.context && (
                  <Box>
                    <Heading size="sm" mb={2}>Context</Heading>
                    <Text>{selectedNode.details.context}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Mindmap;
