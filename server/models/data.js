/**
 * Shared data store for the application
 * This module provides access to shared data across different routes
 */

// In-memory database (for simplicity)
// In a production application, this would be replaced with a real database
const data = {
  // Array to store document metadata
  documents: [],
  
  // Array to store timeline events extracted from documents
  timelineEvents: []
};

export default data;
