"""
Shared data store for the application
This module provides access to shared data across different routes
"""

# In-memory database (for simplicity)
# In a production application, this would be replaced with a real database
class Data:
    def __init__(self):
        # Array to store document metadata
        self.documents = []
        
        # Array to store timeline events extracted from documents
        self.timeline_events = []

# Create a singleton instance
data = Data()
