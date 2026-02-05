# Requirements Document

## Introduction

Ved Code is a developer learning platform that helps developers understand codebases through three distinct learning modes. The system provides keyword-based learning, visual code exploration, and change impact analysis to enhance developer comprehension and productivity.

## Glossary

- **Ved_Code_System**: The complete learning platform application
- **Learn_Mode**: Keyword-based learning interface for concept understanding
- **Explore_Mode**: Visual graph-based codebase exploration interface
- **Guard_Mode**: Change impact analysis and context awareness interface
- **Project**: A codebase uploaded and analyzed by the system
- **Keyword**: A programming concept or term that can be explained and contextualized
- **Memory_System**: Learning progress tracking and recall functionality
- **AST_Parser**: Abstract Syntax Tree parser using ts-morph for code analysis
- **Dependency_Graph**: Visual representation of code relationships and dependencies
- **Impact_Analysis**: Analysis of how code changes affect other parts of the system

## Requirements

### Requirement 1: Global Navigation and Layout

**User Story:** As a developer, I want consistent navigation throughout the platform, so that I can easily switch between different learning modes and access core functionality.

#### Acceptance Criteria

1. THE Ved_Code_System SHALL display a TopBar with navigation elements on all pages
2. THE Ved_Code_System SHALL display a Sidebar with mode selection and project context on all pages
3. WHEN a user navigates between modes, THE Ved_Code_System SHALL maintain consistent layout structure
4. THE Ved_Code_System SHALL provide a Dashboard as the default workspace
5. WHEN no project is loaded, THE Ved_Code_System SHALL default to Learn_Mode interface

### Requirement 2: Project Management and Upload

**User Story:** As a developer, I want to upload and manage codebases, so that I can analyze and explore my projects within the platform.

#### Acceptance Criteria

1. WHEN a user uploads a project, THE Ved_Code_System SHALL accept common code archive formats
2. WHEN a project is uploaded, THE AST_Parser SHALL analyze the codebase structure and dependencies
3. THE Ved_Code_System SHALL store project metadata and analysis results in the database
4. WHEN a project is successfully processed, THE Ved_Code_System SHALL enable Explore_Mode and Guard_Mode
5. THE Ved_Code_System SHALL allow users to switch between multiple uploaded projects
6. WHEN project analysis fails, THE Ved_Code_System SHALL provide clear error messages and recovery options

### Requirement 3: Learn Mode (The "Code-First" Protocol)

**User Story:** As a developer, I want to search for programming concepts and receive comprehensive explanations, so that I can understand unfamiliar terms and patterns.

#### Acceptance Criteria

1. WHEN no project is loaded, THE Ved_Code_System SHALL display the Learn_Mode interface by default
2. WHEN a user searches a keyword, THE system SHALL prioritize a Code-First Explanation. It MUST first use pgvector to locate the exact implementation in the user's current project and wrap the explanation around that specific code block before presenting general theory
3. WHEN displaying keyword explanations, THE system SHALL prioritize a Code-First Explanation. It MUST first use pgvector to locate the exact implementation in the user's current project and wrap the explanation around that specific code block before presenting general theory
4. THE Ved_Code_System SHALL generate mini diagrams to illustrate programming concepts visually
5. WHEN a user views explanations, THE Memory_System SHALL log the interaction for progress tracking
6. THE Ved_Code_System SHALL suggest related keywords and concepts for continued learning
7. THE Learn_Mode interface SHALL display a 'Log to Memory' toggle that initializes the Ebbinghaus tracking for that specific keyword

### Requirement 4: Explore Mode (The "ProjectConstellation" Logic)

**User Story:** As a developer, I want to visualize my codebase as an interactive graph, so that I can understand the structure and relationships between different components.

#### Acceptance Criteria

1. THE system SHALL generate a radial-force node-edge graph known as the 'ProjectConstellation,' where files are clustered into 'Solar Systems' based on directory depth
2. WHEN a user hovers over nodes, THE Ved_Code_System SHALL display summary information about the component
3. WHEN a user clicks on a node, THE Ved_Code_System SHALL focus the view on that component and its immediate dependencies
4. THE Ved_Code_System SHALL highlight dependency paths between selected components
5. THE Ved_Code_System SHALL use React Flow for graph rendering and interaction
6. THE Ved_Code_System SHALL use Framer Motion for smooth animations during graph interactions
7. WHEN the graph becomes complex, THE Ved_Code_System SHALL provide filtering and zoom controls
8. THE graph SHALL represent code complexity via Node Luminosity, where the brightness of a node is dynamically calculated based on its cyclomatic complexity and lines of code
9. Node 'Gravity' SHALL be determined by the number of inbound and outbound imports extracted via the AST_Parser

### Requirement 5: Guard Mode (The "Impact Ripple" Logic)

**User Story:** As a developer, I want to understand the impact of code changes before execution, so that I can make informed decisions about modifications.

#### Acceptance Criteria

1. WHEN code changes are detected, THE Ved_Code_System SHALL automatically trigger impact analysis
2. WHEN displaying impact analysis, THE Ved_Code_System SHALL show what components have changed
3. THE system SHALL trace an Unbroken Impact Chain starting from the modified AST node (e.g., a DB Model) through intermediate layers (Drizzle Actions, Server Actions) to the final affected Frontend Component
4. THE Ved_Code_System SHALL list files that may need updates due to the changes
5. THE Ved_Code_System SHALL provide explanations for why specific components are affected
6. THE Ved_Code_System SHALL NOT automatically fix or modify code
7. WHEN no changes are detected, THE Ved_Code_System SHALL display current system status
8. Impact results SHALL be visualized in the ProjectConstellation as 'Red-Alert' trajectories, showing the pulse of the breaking change across the galaxy map

### Requirement 6: Memory System (The "Ebbinghaus" Fix)

**User Story:** As a developer, I want the system to track my learning progress, so that I can see what concepts I've explored and identify areas for further study.

#### Acceptance Criteria

1. WHEN a user interacts with keywords or concepts, THE Memory_System SHALL record the interaction
2. THE Memory_System SHALL track frequency and recency of concept access
3. WHEN displaying learning progress, THE Ved_Code_System SHALL show visual indicators of familiarity levels
4. THE Memory_System SHALL calculate concept decay scores using the Ebbinghaus Forgetting Curve algorithm
5. THE Memory_System SHALL persist learning data across user sessions
6. WHEN a user requests progress overview, THE Ved_Code_System SHALL display comprehensive learning statistics
7. THE system SHALL trigger a Micro-Challenge (Active Recall) exactly 24 hours after a concept's initial encounter, delivered via a toast notification or in-editor interruption
8. THE Memory_System SHALL use Upstash/Redis background workers to manage the scheduling and delivery of these challenges

### Requirement 7: User Interface and Experience

**User Story:** As a developer, I want an intuitive and clean interface, so that I can focus on learning without being overwhelmed by complexity.

#### Acceptance Criteria

1. THE Ved_Code_System SHALL use Tailwind v4 for consistent styling across all components
2. THE Ved_Code_System SHALL implement Shadcn UI components for standard interface elements
3. WHEN displaying complex information, THE Ved_Code_System SHALL use progressive disclosure to avoid overwhelming users
4. THE Ved_Code_System SHALL provide clear visual hierarchy and information organization
5. WHEN users perform actions, THE Ved_Code_System SHALL provide immediate feedback and loading states
6. THE Ved_Code_System SHALL maintain responsive design across different screen sizes
7. THE Ved_Code_System SHALL use consistent color schemes and typography throughout the application

### Requirement 8: Data Persistence and Management

**User Story:** As a developer, I want my projects and learning progress to be saved reliably, so that I can continue my work across different sessions.

#### Acceptance Criteria

1. THE Ved_Code_System SHALL use Drizzle ORM for database operations
2. THE Ved_Code_System SHALL store user data in PostgreSQL database
3. WHEN users upload projects, THE Ved_Code_System SHALL persist project data and analysis results
4. THE Ved_Code_System SHALL maintain data integrity during concurrent operations
5. WHEN database operations fail, THE Ved_Code_System SHALL handle errors gracefully and notify users
6. THE Ved_Code_System SHALL implement proper data validation before database storage
7. THE Ved_Code_System SHALL support data backup and recovery mechanisms