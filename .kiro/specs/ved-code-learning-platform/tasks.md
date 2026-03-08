# Implementation Plan: Ved Code Learning Platform

## Overview

This implementation plan converts the VedCode design into a series of incremental development tasks. The approach prioritizes frontend components with static data first (Phase 1 MVP focus), then progressively adds AI backend services. Each task builds on previous work to create a cohesive developer learning platform with ProjectConstellation visualization, JIT Explainer system, and proactive micro-challenges.

## Tasks

- [ ] 1. Project Foundation and Core Infrastructure
  - Set up Next.js 14 App Router project structure with TypeScript
  - Configure Tailwind v4 and Shadcn UI component library
  - Set up Drizzle ORM with PostgreSQL and pgvector extension
  - Configure development environment and build tools
  - _Requirements: 8.1, 8.2_

- [ ] 2. Database Schema and Core Models
  - [ ] 2.1 Create core database schema with Drizzle
    - Define Project, User, LearningProgress tables
    - Set up pgvector columns for embeddings storage
    - Create indexes for performance optimization
    - _Requirements: 8.3, 8.6_
  
  - [ ]* 2.2 Write property test for database schema
    - **Property 26: Data Persistence Round-Trip**
    - **Validates: Requirements 2.3, 8.3**
  
  - [ ] 2.3 Implement AST analysis data models
    - Create ASTAnalysis, ImpactRippleMap, ChainMapping tables
    - Define relationships for impact chain tracing
    - _Requirements: 2.2, 5.3_

- [ ] 3. Global Layout and Navigation System
  - [ ] 3.1 Create TopBar component with mode switching
    - Implement navigation between Learn, Explore, Guard modes
    - Add project context display and user authentication status
    - _Requirements: 1.1, 1.3_
  
  - [ ] 3.2 Build Sidebar component with project management
    - Create collapsible sidebar with project selection
    - Add learning progress indicators and recent concepts
    - _Requirements: 1.2, 2.5_
  
  - [ ]* 3.3 Write property test for layout consistency
    - **Property 1: UI Layout Consistency**
    - **Validates: Requirements 1.1, 1.2, 1.3**
  
  - [ ] 3.4 Implement Dashboard as default workspace
    - Create dashboard with overview of learning progress
    - Add quick access to recent projects and concepts
    - _Requirements: 1.4_

- [ ] 4. Project Upload and Analysis Pipeline
  - [ ] 4.1 Build project upload interface
    - Create drag-and-drop file upload component
    - Implement file format validation for code archives
    - Add progress indicators and error handling
    - _Requirements: 2.1, 2.6_
  
  - [ ] 4.2 Implement ts-morph AST parsing service
    - Create CodeAnalysisService for project processing
    - Extract file structure, dependencies, and complexity metrics
    - Generate initial data for ProjectConstellation
    - _Requirements: 2.2, 4.1_
  
  - [ ]* 4.3 Write property test for file format validation
    - **Property 3: File Format Validation**
    - **Validates: Requirements 2.1, 2.6**
  
  - [ ]* 4.4 Write property test for AST analysis completeness
    - **Property 4: Project Analysis Completeness**
    - **Validates: Requirements 2.2**

- [ ] 5. Checkpoint - Core Infrastructure Complete
  - Ensure all tests pass, verify project upload and basic analysis works
  - Ask the user if questions arise about the foundation setup

- [ ] 6. Learn Mode with JIT Explainer (Static Implementation)
  - [ ] 6.1 Create keyword search interface
    - Build search component with suggestions and recent searches
    - Implement basic keyword matching with static explanations
    - _Requirements: 3.2_
  
  - [ ] 6.2 Build concept explanation display component
    - Create ConceptExplanation component with code-first layout
    - Add placeholder for project-specific code examples
    - Implement progressive disclosure for complex concepts
    - _Requirements: 3.2, 3.3, 7.3_
  
  - [ ] 6.3 Add memory system interaction logging
    - Implement LearningProgress tracking for concept views
    - Create MemoryIndicator component for familiarity display
    - _Requirements: 3.5, 6.1_
  
  - [ ]* 6.4 Write property test for keyword search completeness
    - **Property 7: Keyword Search Completeness**
    - **Validates: Requirements 3.2, 3.3**
  
  - [ ]* 6.5 Write property test for interaction logging
    - **Property 18: Interaction Logging Completeness**
    - **Validates: Requirements 3.5, 6.1, 6.2**

- [ ] 7. ProjectConstellation Visualization (Explore Mode)
  - [ ] 7.1 Set up React Flow with radial-force layout
    - Configure React Flow with custom node and edge components
    - Implement radial-force positioning algorithm
    - Create ConstellationNode component with luminosity styling
    - _Requirements: 4.1, 4.2_
  
  - [ ] 7.2 Implement Solar System clustering logic
    - Create SolarSystem grouping based on folder depth
    - Calculate gravitational strength from import counts
    - Add cluster visualization with center nodes and orbiting files
    - _Requirements: 4.1_
  
  - [ ] 7.3 Add interactive graph behaviors
    - Implement node hover with summary information display
    - Add node click for focus and dependency highlighting
    - Create smooth animations with Framer Motion
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [ ] 7.4 Build constellation controls interface
    - Add layout switching, gravity adjustment, luminosity filtering
    - Implement zoom and pan controls for complex graphs
    - _Requirements: 4.7_
  
  - [ ]* 7.5 Write property test for graph generation
    - **Property 10: Graph Generation Completeness**
    - **Validates: Requirements 4.1**
  
  - [ ]* 7.6 Write property test for interactive behaviors
    - **Property 11: Interactive Graph Behavior**
    - **Validates: Requirements 4.2, 4.3**

- [ ] 8. Guard Mode with Change Detection (Static Implementation)
  - [ ] 8.1 Create change detection interface
    - Build file monitoring component with change indicators
    - Implement basic change detection using file timestamps
    - Display changed files with diff highlighting
    - _Requirements: 5.1, 5.2_
  
  - [ ] 8.2 Build impact analysis display
    - Create ImpactAnalysis component showing affected components
    - Add placeholder for impact chain visualization
    - Implement recommendation display for file updates
    - _Requirements: 5.3, 5.4, 5.5_
  
  - [ ] 8.3 Add non-modification constraint enforcement
    - Ensure Guard Mode never modifies code automatically
    - Add clear indicators that analysis is read-only
    - _Requirements: 5.6_
  
  - [ ]* 8.4 Write property test for change detection
    - **Property 14: Automatic Change Detection**
    - **Validates: Requirements 5.1**
  
  - [ ]* 8.5 Write property test for non-modification constraint
    - **Property 16: Non-Modification Constraint**
    - **Validates: Requirements 5.6**

- [ ] 9. Memory System and Learning Progress
  - [ ] 9.1 Implement learning progress tracking
    - Create enhanced LearningProgress model with familiarity scoring
    - Build progress visualization components
    - Add learning statistics dashboard
    - _Requirements: 6.2, 6.3, 6.6_
  
  - [ ] 9.2 Build recommendation system (rule-based)
    - Create basic concept recommendation engine
    - Implement related concept suggestions
    - Add review suggestions based on access patterns
    - _Requirements: 3.6, 6.4_
  
  - [ ]* 9.3 Write property test for learning progress visualization
    - **Property 19: Learning Progress Visualization**
    - **Validates: Requirements 6.3, 6.6**
  
  - [ ]* 9.4 Write property test for learning data persistence
    - **Property 21: Learning Data Persistence**
    - **Validates: Requirements 6.5**

- [ ] 10. Checkpoint - MVP Frontend Complete
  - Ensure all three modes are functional with static data
  - Verify learning progress tracking and basic recommendations work
  - Ask the user if questions arise about the MVP implementation

- [ ] 11. AI Backend Services Foundation
  - [ ] 11.1 Set up pgvector semantic search infrastructure
    - Configure PostgreSQL with pgvector extension
    - Create embedding storage and indexing system
    - Implement basic similarity search functionality
    - _Requirements: 3.2, 3.3_
  
  - [ ] 11.2 Integrate LLM API for explanation generation
    - Set up AI service integration (OpenAI/Anthropic)
    - Create ExplanationService with code-first protocol
    - Implement explanation validation and quality checks
    - _Requirements: 3.2, 3.4_
  
  - [ ] 11.3 Build code embedding generation pipeline
    - Create service to generate embeddings for code snippets
    - Implement batch processing for project analysis
    - Add embedding storage and retrieval system
    - _Requirements: 2.2_

- [ ] 12. JIT Explainer with Code-First Protocol
  - [ ] 12.1 Implement semantic search for code implementations
    - Build service to find exact code lines for keywords
    - Integrate pgvector similarity search with AST data
    - Create CodeImplementation matching and ranking
    - _Requirements: 3.2, 3.3_
  
  - [ ] 12.2 Build code-first explanation wrapper
    - Create service to wrap explanations around specific code blocks
    - Implement contextual explanation generation
    - Add theory-second general concept explanations
    - _Requirements: 3.2_
  
  - [ ]* 12.3 Write property test for code-first explanations
    - **Property 7: Keyword Search Completeness (Enhanced)**
    - **Validates: Requirements 3.2, 3.3**

- [ ] 13. Impact Ripple Mapping and AST Bridge
  - [ ] 13.1 Build AST chain tracing service
    - Implement unbroken chain detection from DB Model to Frontend
    - Create ChainMapping and ImpactChain analysis
    - Add confidence scoring for AST connections
    - _Requirements: 5.3, 5.4_
  
  - [ ] 13.2 Integrate Red-Alert trajectory visualization
    - Add ConstellationTrajectory rendering to ProjectConstellation
    - Implement red-alert path highlighting and animation
    - Create impact severity visualization
    - _Requirements: 5.2, 5.3_
  
  - [ ]* 13.3 Write property test for impact analysis accuracy
    - **Property 15: Change Impact Analysis Accuracy**
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5**

- [ ] 14. Micro-Challenge System with Forgetting Curve
  - [ ] 14.1 Set up Upstash/Redis background worker system
    - Configure Redis for challenge scheduling
    - Implement background job processing
    - Create MicroChallengeTrigger scheduling logic
    - _Requirements: 6.4_
  
  - [ ] 14.2 Build Ebbinghaus forgetting curve algorithm
    - Implement forgetting curve calculations
    - Create optimal review time predictions
    - Add retention probability scoring
    - _Requirements: 6.2, 6.4_
  
  - [ ] 14.3 Create micro-challenge delivery system
    - Build toast notification and in-editor interruption components
    - Implement challenge format generation (multiple-choice, code-completion)
    - Add response tracking and familiarity updates
    - _Requirements: 6.1, 6.2_
  
  - [ ]* 14.4 Write property test for micro-challenge system
    - **Property 20: Memory-Based Recommendations**
    - **Validates: Requirements 6.4**

- [ ] 15. Advanced Features and Polish
  - [ ] 15.1 Implement responsive design and accessibility
    - Ensure all components work across screen sizes
    - Add keyboard navigation and screen reader support
    - Implement consistent color schemes and typography
    - _Requirements: 7.6, 7.7_
  
  - [ ] 15.2 Add error handling and recovery mechanisms
    - Implement error boundaries and fallback UI
    - Add graceful degradation for AI service failures
    - Create user-initiated recovery options
    - _Requirements: 2.6, 7.5_
  
  - [ ]* 15.3 Write property test for responsive design
    - **Property 24: Responsive Design Consistency**
    - **Validates: Requirements 7.6**
  
  - [ ]* 15.4 Write property test for error handling
    - **Property 28: Database Error Handling**
    - **Validates: Requirements 8.5**

- [ ] 16. Integration Testing and Performance Optimization
  - [ ] 16.1 Implement end-to-end workflow testing
    - Test complete project upload → analysis → exploration workflow
    - Verify learning session with memory tracking
    - Test change detection → impact analysis → user decision flow
    - _Requirements: All integrated requirements_
  
  - [ ] 16.2 Performance optimization and benchmarking
    - Optimize ProjectConstellation rendering for large graphs
    - Implement lazy loading and virtualization
    - Add performance monitoring and metrics
    - _Requirements: Performance benchmarks from design_
  
  - [ ]* 16.3 Write integration property tests
    - **Property 27: Concurrent Operation Safety**
    - **Validates: Requirements 8.4**

- [ ] 17. Final Checkpoint - Production Ready
  - Ensure all tests pass and performance benchmarks are met
  - Verify all three modes work seamlessly with AI backend
  - Ask the user if questions arise about production deployment

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and user feedback
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Phase 1 MVP focuses on frontend with static data before AI integration