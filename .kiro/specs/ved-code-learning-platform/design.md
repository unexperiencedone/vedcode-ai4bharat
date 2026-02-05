# Design Document

## Overview

Ved Code is a Next.js-based developer learning platform that provides three distinct modes for understanding codebases: Learn Mode for keyword-based concept exploration, Explore Mode for visual codebase navigation, and Guard Mode for change impact analysis. The system uses modern React patterns with TypeScript, leveraging React Flow for graph visualizations, Framer Motion for smooth animations, and ts-morph for AST-based code analysis.

## Architecture

### High-Level Architecture

The system follows a layered architecture with AI-powered backend services:

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (Next.js App Router + React Components)│
├─────────────────────────────────────────┤
│            Business Logic Layer         │
│     (Hooks, Services, State Management) │
├─────────────────────────────────────────┤
│              AI Agent Layer             │
│   (Code Analysis, Context Guard, etc.)  │
├─────────────────────────────────────────┤
│             Data Access Layer           │
│   (Drizzle ORM + PostgreSQL + Vector DB)│
├─────────────────────────────────────────┤
│            External Services            │
│  (LLM APIs, ts-morph AST, File System)  │
└─────────────────────────────────────────┘
```

### AI Agent Architecture

**Code Analysis Agent**
- Processes uploaded codebases using ts-morph for AST parsing
- Extracts semantic information, function signatures, and dependencies
- Generates embeddings for code similarity and search using pgvector
- Creates ProjectConstellation knowledge graphs with radial-force clustering

**JIT Explainer Agent (Code-First, Theory-Second Protocol)**
- Takes programming keywords and performs semantic search via pgvector
- Locates exact implementation lines in user's current project first
- Wraps explanations around specific code blocks before general theory
- Generates contextual mini diagrams using code-to-diagram AI models
- Maintains explanation quality through user project context validation

**Context Guard Agent with Impact Ripple Mapping**
- Monitors code changes in real-time using file system watchers
- Traces unbroken chains from DB Model → Drizzle Action → Server Action → Frontend Component
- Analyzes impact using dependency graphs and semantic analysis
- Visualizes "Red-Alert" trajectories in the ProjectConstellation map
- Generates explanations for why components are affected through AST bridge analysis

**Proactive Learning Agent with Micro-Challenge System**
- Tracks user interactions and learning patterns with Ebbinghaus forgetting curve algorithms
- Implements background workers using Upstash/Redis for challenge scheduling
- Triggers micro-challenges as toast notifications or in-editor interruptions
- Uses spaced repetition algorithms for concept review suggestions
- Personalizes explanations based on user's demonstrated knowledge level

### Technology Stack Integration

**Frontend Stack:**
- **Next.js App Router**: Provides file-based routing and server-side rendering capabilities
- **React Flow**: Handles interactive graph rendering with built-in zoom, pan, and node manipulation
- **Framer Motion**: Provides declarative animations for smooth transitions between modes and states
- **Tailwind v4 + Shadcn UI**: Consistent styling and component library

**Backend Intelligence Stack:**
- **ts-morph**: Enables TypeScript AST parsing for code analysis and dependency extraction
- **AI/ML Models**: Large language models for code understanding, explanation generation, and context analysis
- **pgvector (PostgreSQL)**: Vector database for semantic code search and similarity matching via embeddings
- **Upstash/Redis**: Background worker system for micro-challenge scheduling and forgetting curve interruptions
- **React Flow**: Interactive graph rendering with radial-force layout for ProjectConstellation
- **Graph Analysis Engine**: For dependency analysis, impact assessment, and AST bridge tracing
- **Drizzle ORM**: Type-safe database operations with PostgreSQL

**AI Agent Architecture:**
- **Code Analysis Agent**: Processes uploaded codebases and extracts semantic information
- **Explanation Agent**: Generates keyword explanations and concept diagrams
- **Context Guard Agent**: Analyzes code changes and predicts impact
- **Learning Agent**: Tracks user progress and generates personalized recommendations

## Components and Interfaces

### AI Backend Services

#### Code Analysis Service
```typescript
interface CodeAnalysisService {
  analyzeProject(projectFiles: ProjectFile[]): Promise<ProjectAnalysis>;
  extractDependencies(astNodes: ASTNode[]): DependencyGraph;
  generateEmbeddings(codeSnippets: string[]): Promise<number[][]>;
  createKnowledgeGraph(analysis: ProjectAnalysis): KnowledgeGraph;
}

interface ProjectAnalysis {
  fileStructure: FileNode[];
  dependencies: Dependency[];
  complexityMetrics: ComplexityMetrics;
  semanticClusters: SemanticCluster[];
  keywordOccurrences: KeywordOccurrence[];
}
```

#### JIT Explainer Service (Code-First, Theory-Second Protocol)
```typescript
interface JITExplainerService {
  generateExplanation(keyword: string, projectContext: ProjectContext): Promise<CodeFirstExplanation>;
  findImplementationLines(keyword: string, projectId: string): Promise<CodeImplementation[]>;
  wrapExplanationAroundCode(codeBlock: CodeBlock, concept: string): Promise<ContextualExplanation>;
  performSemanticSearch(keyword: string, embeddings: number[][]): Promise<SemanticMatch[]>;
}

interface CodeFirstExplanation {
  keyword: string;
  implementationFirst: {
    codeBlock: CodeBlock;
    lineNumbers: { start: number; end: number };
    filePath: string;
    contextualExplanation: string;
  };
  theorySecond: {
    generalDefinition: string;
    abstractConcepts: string[];
    relatedPatterns: string[];
  };
  visualDiagram?: DiagramData;
  projectSpecificExamples: CodeExample[];
}

interface CodeImplementation {
  filePath: string;
  lineNumber: number;
  codeSnippet: string;
  semanticRelevance: number; // 0-1 score from pgvector similarity
  astContext: ASTContext;
}
```

#### Context Guard Service with Impact Ripple Mapping
```typescript
interface ContextGuardService {
  detectChanges(projectId: string, currentState: ProjectState): Promise<CodeChange[]>;
  analyzeImpactRipple(changes: CodeChange[], dependencyGraph: DependencyGraph): Promise<ImpactRippleAnalysis>;
  traceUnbrokenChain(changeLocation: FileLocation): Promise<ImpactChain>;
  generateRedAlertTrajectory(impactChain: ImpactChain): Promise<ConstellationTrajectory>;
  predictAffectedComponents(changes: CodeChange[]): Promise<AffectedComponent[]>;
}

interface ImpactRippleAnalysis {
  directlyAffected: ComponentReference[];
  indirectlyAffected: ComponentReference[];
  impactChains: ImpactChain[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  redAlertTrajectories: ConstellationTrajectory[];
  confidenceScore: number;
}

interface ImpactChain {
  chainId: string;
  startPoint: { file: string; line: number; type: 'db-model' | 'function' | 'component' };
  chainLinks: ChainLink[];
  endPoint: { file: string; line: number; type: 'frontend-component' | 'api-endpoint' };
  severity: 'breaking' | 'warning' | 'info';
}

interface ChainLink {
  file: string;
  function: string;
  linkType: 'db-model' | 'drizzle-action' | 'server-action' | 'frontend-component';
  astConnection: ASTConnection;
  impactProbability: number;
}

interface ConstellationTrajectory {
  pathId: string;
  nodeSequence: string[]; // Node IDs in ProjectConstellation
  visualStyle: 'red-alert' | 'warning-pulse' | 'info-glow';
  animationDuration: number;
  priority: number;
}
```

#### Proactive Learning Service with Micro-Challenge System
```typescript
interface ProactiveLearningService {
  trackInteraction(userId: string, interaction: LearningInteraction): Promise<void>;
  generateRecommendations(userId: string, currentContext?: string): Promise<Recommendation[]>;
  calculateFamiliarity(userId: string, concept: string): Promise<FamiliarityScore>;
  scheduleMicroChallenge(userId: string, conceptId: string): Promise<MicroChallengeTrigger>;
  triggerForgettingCurveInterruption(trigger: MicroChallengeTrigger): Promise<void>;
  generateLearningPath(userId: string, targetConcepts: string[]): Promise<LearningPath>;
}

interface MicroChallengeTrigger {
  conceptId: string;
  triggerTime: Date; // Exactly T+24h from first encounter
  recallFormat: 'multiple-choice' | 'code-completion' | 'explain-implementation';
  forgettingCurveDecay: number; // Computed via Ebbinghaus algorithm
  userId: string;
  projectContext?: string;
  deliveryMethod: 'toast-notification' | 'in-editor-interruption' | 'dashboard-widget';
  priority: 'low' | 'medium' | 'high';
}

interface LearningInteraction {
  concept: string;
  interactionType: 'view' | 'search' | 'explore' | 'practice' | 'micro-challenge-response';
  duration: number;
  projectContext?: string;
  timestamp: Date;
  challengeResponse?: {
    correct: boolean;
    responseTime: number;
    confidenceLevel: number;
  };
}

interface ForgettingCurveMetrics {
  initialStrength: number; // 0-1 scale
  decayRate: number; // Ebbinghaus-based calculation
  retentionProbability: number;
  optimalReviewTime: Date;
  reviewCount: number;
}
```

### Core Layout Components

#### TopBar Component
```typescript
interface TopBarProps {
  currentMode: 'learn' | 'explore' | 'guard';
  currentProject?: Project;
  onModeChange: (mode: string) => void;
}
```

Responsibilities:
- Display current mode and project context
- Provide mode switching navigation
- Show user authentication status
- Display global search functionality

#### Sidebar Component
```typescript
interface SidebarProps {
  isCollapsed: boolean;
  currentProject?: Project;
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  onToggleCollapse: () => void;
}
```

Responsibilities:
- Project selection and management
- Mode-specific navigation options
- Learning progress indicators
- Quick access to recent keywords/concepts

### Mode-Specific Components

#### Learn Mode Components

**KeywordSearch Component**
```typescript
interface KeywordSearchProps {
  onSearch: (keyword: string) => void;
  suggestions: string[];
  recentSearches: string[];
}
```

**ConceptExplanation Component**
```typescript
interface ConceptExplanationProps {
  keyword: string;
  explanation: ConceptData;
  relatedConcepts: string[];
  projectOccurrences: ProjectOccurrence[];
}

interface ConceptData {
  definition: string;
  examples: CodeExample[];
  diagram?: DiagramData;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
```

#### Explore Mode Components (ProjectConstellation)

**ProjectConstellation Component**
```typescript
interface ProjectConstellationProps {
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
  solarSystems: SolarSystem[];
  onNodeClick: (nodeId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
  selectedNode?: string;
  redAlertTrajectories?: ConstellationTrajectory[];
  layout: 'radial-force' | 'hierarchical';
}

interface ConstellationNode {
  id: string;
  type: 'file' | 'function' | 'class' | 'module';
  label: string;
  position: { x: number; y: number };
  luminosity: number; // Higher complexity/lines = brighter node
  gravityStrength: number; // Based on import count from AST
  solarSystemId: string; // Clustered by folder depth
  data: {
    summary: string;
    dependencies: string[];
    size: number;
    complexity: number;
    astMetrics: ASTMetrics;
  };
}

interface SolarSystem {
  id: string;
  centerNode: string; // Main file/module at center
  orbitingNodes: string[]; // Files that import from center
  folderDepth: number;
  gravitationalPull: number; // Sum of all import relationships
  visualStyle: {
    centerLuminosity: number;
    orbitRadius: number;
    rotationSpeed: number;
  };
}

interface ConstellationEdge {
  id: string;
  source: string;
  target: string;
  type: 'import' | 'call' | 'inheritance' | 'composition';
  weight: number;
  gravitationalForce: number; // Affects node positioning in radial-force layout
  animated?: boolean;
  style?: 'red-alert' | 'warning' | 'normal';
}
```

**ConstellationControls Component**
```typescript
interface ConstellationControlsProps {
  onLayoutChange: (layout: 'radial-force' | 'hierarchical') => void;
  onGravityAdjust: (strength: number) => void;
  onLuminosityFilter: (minLuminosity: number) => void;
  onSolarSystemFocus: (systemId: string) => void;
  redAlertMode: boolean;
  onRedAlertToggle: (enabled: boolean) => void;
}
```

**NodeDetails Component**
```typescript
interface NodeDetailsProps {
  node: GraphNode;
  dependencies: GraphNode[];
  dependents: GraphNode[];
  codePreview: string;
}
```

#### Guard Mode Components

**ChangeDetector Component**
```typescript
interface ChangeDetectorProps {
  project: Project;
  onChangesDetected: (changes: CodeChange[]) => void;
  isMonitoring: boolean;
}

interface CodeChange {
  file: string;
  type: 'added' | 'modified' | 'deleted';
  lines: { start: number; end: number };
  content: string;
}
```

**ImpactAnalysis Component**
```typescript
interface ImpactAnalysisProps {
  changes: CodeChange[];
  affectedComponents: AffectedComponent[];
  recommendations: Recommendation[];
}

interface AffectedComponent {
  name: string;
  type: 'file' | 'function' | 'class';
  impactLevel: 'low' | 'medium' | 'high';
  reason: string;
  suggestedActions: string[];
}
```

### Shared Components

**MemoryIndicator Component**
```typescript
interface MemoryIndicatorProps {
  concept: string;
  familiarity: number; // 0-1 scale
  lastAccessed: Date;
  accessCount: number;
}
```

**ProgressiveDisclosure Component**
```typescript
interface ProgressiveDisclosureProps {
  title: string;
  summary: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  complexity: 'simple' | 'moderate' | 'complex';
}
```

## Data Models

### AI-Enhanced Project Model
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  uploadedAt: Date;
  lastAnalyzed: Date;
  status: 'analyzing' | 'ready' | 'error';
  metadata: {
    language: string;
    fileCount: number;
    totalLines: number;
    dependencies: string[];
    frameworks: string[];
    architecturalPatterns: string[];
  };
  analysisResults: {
    dependencyGraph: GraphData;
    complexityMetrics: ComplexityData;
    keywordOccurrences: KeywordOccurrence[];
    semanticClusters: SemanticCluster[];
    knowledgeGraph: KnowledgeGraph;
    codeEmbeddings: CodeEmbedding[];
  };
  aiInsights: {
    codeQualityScore: number;
    maintainabilityIndex: number;
    suggestedImprovements: string[];
    architecturalRecommendations: string[];
  };
}
```

### AI Learning Models with Micro-Challenge System
```typescript
interface EnhancedLearningProgress {
  userId: string;
  concept: string;
  familiarity: number;
  firstEncounter: Date;
  lastAccessed: Date;
  accessCount: number;
  timeSpent: number;
  relatedConcepts: string[];
  projectContexts: string[];
  learningVelocity: number; // How quickly user grasps concepts
  retentionScore: number; // How well user retains information
  preferredLearningStyle: 'visual' | 'textual' | 'interactive' | 'mixed';
  masteryLevel: 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  forgettingCurveMetrics: ForgettingCurveMetrics;
  microChallengeHistory: MicroChallengeRecord[];
}

interface MicroChallengeRecord {
  challengeId: string;
  conceptId: string;
  triggeredAt: Date;
  completedAt?: Date;
  format: 'multiple-choice' | 'code-completion' | 'explain-implementation';
  response?: {
    correct: boolean;
    responseTime: number;
    confidenceLevel: number;
    userAnswer: string;
  };
  forgettingCurveImpact: {
    strengthBefore: number;
    strengthAfter: number;
    retentionImprovement: number;
  };
}

interface ConceptKnowledgeGraph {
  conceptId: string;
  name: string;
  category: string;
  prerequisites: string[];
  relatedConcepts: ConceptRelation[];
  difficulty: number;
  estimatedLearningTime: number;
  commonMisconceptions: string[];
  practicalApplications: string[];
  microChallengeTemplates: ChallengeTemplate[];
  codeFirstExamples: CodeImplementation[]; // For JIT Explainer integration
}

interface ChallengeTemplate {
  templateId: string;
  format: 'multiple-choice' | 'code-completion' | 'explain-implementation';
  difficultyLevel: number;
  template: string; // Template with placeholders for dynamic content
  correctAnswerPattern: string;
  distractorPatterns: string[]; // For multiple choice
  evaluationCriteria: EvaluationCriteria;
}

interface EvaluationCriteria {
  timeLimit: number; // seconds
  partialCreditRules: PartialCreditRule[];
  masteryThreshold: number; // 0-1 score needed for mastery
  retryPolicy: {
    maxRetries: number;
    retryDelay: number; // hours
    difficultyAdjustment: number;
  };
}
```

### AI Analysis Models
```typescript
interface SemanticCluster {
  id: string;
  name: string;
  description: string;
  codeElements: CodeElement[];
  centroidEmbedding: number[];
  coherenceScore: number;
  suggestedRefactoring?: RefactoringSuggestion;
}

interface CodeEmbedding {
  elementId: string;
  elementType: 'function' | 'class' | 'module' | 'file';
  embedding: number[];
  semanticTags: string[];
  similarElements: SimilarityMatch[];
}

interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  clusters: ConceptCluster[];
  learningPaths: LearningPath[];
}

interface KnowledgeNode {
  id: string;
  type: 'concept' | 'code_element' | 'pattern' | 'principle';
  name: string;
  description: string;
  importance: number;
  prerequisites: string[];
  examples: CodeExample[];
}
```

### Context Guard Models
```typescript
interface ChangeImpactModel {
  changeId: string;
  projectId: string;
  changes: CodeChange[];
  impactPrediction: {
    affectedFiles: string[];
    riskAssessment: RiskAssessment;
    testingRecommendations: TestingRecommendation[];
    deploymentConsiderations: string[];
  };
  mlConfidence: number;
  humanValidation?: boolean;
}

interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  mitigationStrategies: string[];
  estimatedImpactRadius: number; // Number of potentially affected components
}

interface RiskFactor {
  factor: string;
  severity: number; // 0-1 scale
  explanation: string;
  historicalPrecedent?: string;
}
```

### AST Analysis Model with Impact Ripple Mapping
```typescript
interface ASTAnalysis {
  projectId: string;
  fileId: string;
  nodes: ASTNode[];
  dependencies: Dependency[];
  exports: Export[];
  imports: Import[];
  complexity: ComplexityMetrics;
  impactRippleMap: ImpactRippleMap;
}

interface ASTNode {
  id: string;
  type: 'function' | 'class' | 'interface' | 'variable' | 'type';
  name: string;
  location: { line: number; column: number };
  scope: string;
  dependencies: string[];
  luminosityScore: number; // For ProjectConstellation brightness
  gravitationalInfluence: number; // For radial-force layout positioning
}

interface ImpactRippleMap {
  chainMappings: ChainMapping[];
  criticalPaths: CriticalPath[];
  breakingChangeRisks: BreakingChangeRisk[];
}

interface ChainMapping {
  id: string;
  startNode: ASTNode; // e.g., DB Model definition
  chainSequence: ChainStep[];
  endNodes: ASTNode[]; // e.g., Frontend components that consume this data
  traceability: 'complete' | 'partial' | 'broken';
}

interface ChainStep {
  nodeId: string;
  stepType: 'db-model' | 'drizzle-action' | 'server-action' | 'frontend-component';
  astConnection: {
    importStatement?: ImportDeclaration;
    functionCall?: CallExpression;
    typeReference?: TypeReference;
  };
  confidence: number; // 0-1 score for AST parsing confidence
}

interface CriticalPath {
  pathId: string;
  nodes: string[]; // AST node IDs forming critical dependency chain
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  changeAmplification: number; // How many components affected by change here
  visualTrajectory: ConstellationTrajectory;
}

interface BreakingChangeRisk {
  nodeId: string;
  riskFactors: string[];
  affectedChains: string[]; // ChainMapping IDs that would break
  mitigationSuggestions: string[];
  historicalBreakageCount: number;
}
```

### ProjectConstellation Visualization Model
```typescript
interface ProjectConstellationData {
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
  solarSystems: SolarSystem[];
  layout: 'radial-force' | 'hierarchical';
  gravitationalConstants: GravitationalConstants;
  redAlertTrajectories: ConstellationTrajectory[];
}

interface GravitationalConstants {
  baseGravity: number; // Base gravitational strength
  importMultiplier: number; // Multiplier for import-based gravity
  complexityInfluence: number; // How much complexity affects luminosity
  folderDepthDecay: number; // How folder depth affects clustering
}

interface ConstellationCluster extends SolarSystem {
  visualBounds: {
    centerX: number;
    centerY: number;
    radius: number;
  };
  animationState: {
    rotationAngle: number;
    pulseBrightness: number;
    expansionFactor: number;
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, here are the consolidated correctness properties:

### Layout and Navigation Properties

**Property 1: UI Layout Consistency**
*For any* page in the application, the TopBar and Sidebar should be present and contain the expected navigation elements
**Validates: Requirements 1.1, 1.2, 1.3**

**Property 2: Default Mode Behavior**
*For any* application state where no project is loaded, the system should display the Learn_Mode interface
**Validates: Requirements 1.5, 3.1**

### Project Management Properties

**Property 3: File Format Validation**
*For any* uploaded file, the system should accept valid code archive formats and reject invalid formats with appropriate error messages
**Validates: Requirements 2.1, 2.6**

**Property 4: Project Analysis Completeness**
*For any* successfully uploaded project, the AST_Parser should generate complete analysis results including structure and dependency data
**Validates: Requirements 2.2**

**Property 5: Mode Availability After Processing**
*For any* successfully processed project, both Explore_Mode and Guard_Mode should become available for selection
**Validates: Requirements 2.4**

**Property 6: Project Switching Functionality**
*For any* set of uploaded projects, users should be able to switch between projects and maintain correct context
**Validates: Requirements 2.5**

### Learn Mode Properties

**Property 7: Keyword Search Completeness**
*For any* valid keyword search, the system should provide detailed explanations and show project occurrences when available
**Validates: Requirements 3.2, 3.3**

**Property 8: Concept Visualization**
*For any* concept explanation, the system should generate appropriate visual diagrams when the concept benefits from visual representation
**Validates: Requirements 3.4**

**Property 9: Learning Recommendations**
*For any* viewed concept, the system should suggest related keywords and concepts for continued learning
**Validates: Requirements 3.6**

### Explore Mode Properties

**Property 10: Graph Generation Completeness**
*For any* loaded project, the system should generate a complete node-edge graph representation of all files and modules
**Validates: Requirements 4.1**

**Property 11: Interactive Graph Behavior**
*For any* graph node interaction (hover or click), the system should display appropriate information and update the view state correctly
**Validates: Requirements 4.2, 4.3**

**Property 12: Dependency Path Highlighting**
*For any* selected components in the graph, the system should correctly highlight all dependency paths between them
**Validates: Requirements 4.4**

**Property 13: Complex Graph Controls**
*For any* graph that exceeds complexity thresholds, the system should provide filtering and zoom controls
**Validates: Requirements 4.7**

### Guard Mode Properties

**Property 14: Automatic Change Detection**
*For any* code changes in a monitored project, the system should automatically trigger impact analysis
**Validates: Requirements 5.1**

**Property 15: Change Impact Analysis Accuracy**
*For any* detected code changes, the system should correctly identify and display all affected components, dependencies, and recommended updates with explanations
**Validates: Requirements 5.2, 5.3, 5.4, 5.5**

**Property 16: Non-Modification Constraint**
*For any* impact analysis operation, the system should never automatically modify or fix code
**Validates: Requirements 5.6**

**Property 17: Status Display When Unchanged**
*For any* project state with no detected changes, the system should display current system status
**Validates: Requirements 5.7**

### Memory and Learning Properties

**Property 18: Interaction Logging Completeness**
*For any* user interaction with keywords or concepts, the Memory_System should record the interaction with accurate frequency and recency data
**Validates: Requirements 3.5, 6.1, 6.2**

**Property 19: Learning Progress Visualization**
*For any* learning progress request, the system should display comprehensive statistics and visual familiarity indicators
**Validates: Requirements 6.3, 6.6**

**Property 20: Memory-Based Recommendations**
*For any* established learning patterns, the system should suggest appropriate concept reviews based on memory data
**Validates: Requirements 6.4**

**Property 21: Learning Data Persistence**
*For any* learning data created during a session, the data should persist across user sessions
**Validates: Requirements 6.5**

### User Experience Properties

**Property 22: Progressive Disclosure**
*For any* complex information display, the system should use progressive disclosure to avoid overwhelming users
**Validates: Requirements 7.3**

**Property 23: User Feedback Responsiveness**
*For any* user action, the system should provide immediate feedback and appropriate loading states
**Validates: Requirements 7.5**

**Property 24: Responsive Design Consistency**
*For any* screen size change, the layout should adapt correctly while maintaining functionality
**Validates: Requirements 7.6**

**Property 25: Visual Consistency**
*For any* application component, consistent color schemes and typography should be maintained throughout
**Validates: Requirements 7.7**

### Data Management Properties

**Property 26: Data Persistence Round-Trip**
*For any* project data and analysis results, storing then retrieving should produce equivalent data
**Validates: Requirements 2.3, 8.3**

**Property 27: Concurrent Operation Safety**
*For any* concurrent database operations, data integrity should be maintained without corruption
**Validates: Requirements 8.4**

**Property 28: Database Error Handling**
*For any* database operation failure, the system should handle errors gracefully and notify users appropriately
**Validates: Requirements 8.5**

**Property 29: Input Validation Completeness**
*For any* data intended for database storage, invalid data should be rejected before storage attempts
**Validates: Requirements 8.6**

**Property 30: Backup and Recovery Functionality**
*For any* backup operation, the system should be able to create backups and successfully recover from them
**Validates: Requirements 8.7**

<function_calls>
<invoke name="prework">
<parameter name="featureName">ved-code-learning-platform

## Error Handling

### Error Categories and Strategies

#### AI/ML Service Errors
- **Model inference failures**: Implement fallback to simpler analysis methods
- **API rate limiting**: Implement queuing and retry mechanisms with exponential backoff
- **Context window exceeded**: Implement intelligent chunking and summarization
- **Embedding generation failures**: Provide degraded search functionality with keyword matching
- **Explanation quality issues**: Implement validation and human review workflows

#### File Upload and Processing Errors
- **Invalid file formats**: Provide clear error messages with supported format list
- **File size limits**: Display progress and clear size limit information
- **Parsing failures**: Show specific error location and recovery suggestions
- **Memory constraints**: Implement chunked processing with progress indicators

#### Network and Database Errors
- **Connection failures**: Implement retry logic with exponential backoff
- **Query timeouts**: Provide user feedback and alternative actions
- **Data corruption**: Implement validation checks and rollback mechanisms
- **Concurrent access conflicts**: Use optimistic locking with conflict resolution
- **Vector database failures**: Fall back to traditional search methods

#### User Interface Errors
- **Component rendering failures**: Implement error boundaries with fallback UI
- **State inconsistencies**: Provide state reset options and clear error messages
- **Navigation errors**: Implement route guards and fallback navigation
- **Animation failures**: Gracefully degrade to static alternatives

#### AST Analysis Errors
- **Unsupported language features**: Provide partial analysis with warnings
- **Circular dependencies**: Detect and visualize with clear indicators
- **Missing dependencies**: Show incomplete analysis with missing items highlighted
- **Complex codebases**: Implement progressive analysis with user control

### Error Recovery Mechanisms

#### AI Service Degradation
- **Explanation Service**: Fall back to static documentation when AI explanations fail
- **Context Guard**: Provide basic file change detection when impact analysis fails
- **Learning Service**: Use rule-based recommendations when ML models are unavailable
- **Code Analysis**: Provide syntax-only analysis when semantic analysis fails

#### Graceful Degradation
- Learn Mode: Fall back to basic keyword search if advanced features fail
- Explore Mode: Show simplified graph if complex rendering fails
- Guard Mode: Provide basic change detection if advanced analysis fails

#### User-Initiated Recovery
- Clear cache and reload functionality
- Manual project re-analysis options
- Export/import of learning progress data
- Reset to default state options
- Force AI model refresh and re-initialization

## Testing Strategy

### Dual Testing Approach

The testing strategy combines unit testing for specific scenarios with property-based testing for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Component rendering with specific props
- Error boundary behavior with known failure cases
- Database operations with specific data sets
- AST parsing with known code samples

**Property-Based Tests**: Verify universal properties across all inputs
- UI consistency across all possible navigation paths
- Data persistence round-trips with generated data
- Graph generation with various project structures
- Memory system behavior with random interaction patterns

### Property-Based Testing Configuration

**Framework**: Use `fast-check` for TypeScript property-based testing
**Test Configuration**: Minimum 100 iterations per property test
**Tagging**: Each property test references its design document property

Example property test structure:
```typescript
// Feature: ved-code-learning-platform, Property 1: UI Layout Consistency
test('TopBar and Sidebar present on all pages', () => {
  fc.assert(fc.property(
    fc.oneof(fc.constant('/'), fc.constant('/learn'), fc.constant('/explore'), fc.constant('/guard')),
    (route) => {
      // Test implementation
      const { getByTestId } = render(<App initialRoute={route} />);
      expect(getByTestId('topbar')).toBeInTheDocument();
      expect(getByTestId('sidebar')).toBeInTheDocument();
    }
  ), { numRuns: 100 });
});
```

### Testing Priorities

#### High Priority (Core Functionality)
1. AI service integration and fallback mechanisms
2. Project upload and analysis pipeline
3. Mode switching and state management
4. Data persistence and retrieval
5. Graph generation and interaction
6. Memory system accuracy
7. Context guard impact analysis accuracy

#### Medium Priority (User Experience)
1. Animation and transition smoothness
2. Responsive design behavior
3. Error handling and recovery
4. Progressive disclosure functionality
5. Search and recommendation accuracy
6. AI explanation quality and relevance

#### Low Priority (Polish Features)
1. Visual consistency across themes
2. Performance optimization
3. Advanced filtering options
4. Export/import functionality
5. Advanced analytics
6. AI model fine-tuning and optimization

### AI Component Testing Strategy

#### Model Performance Testing
- **Explanation Quality**: Validate AI-generated explanations against expert reviews
- **Code Analysis Accuracy**: Test AST parsing and semantic analysis against known codebases
- **Impact Prediction**: Validate change impact predictions against historical data
- **Learning Recommendations**: Test recommendation relevance and user satisfaction

#### AI Service Integration Testing
- **Fallback Mechanisms**: Test graceful degradation when AI services fail
- **Rate Limiting**: Validate queuing and retry logic under load
- **Context Management**: Test handling of large codebases and context windows
- **Embedding Consistency**: Validate semantic search accuracy and consistency

#### Mock AI Services for Testing
```typescript
interface MockAIService {
  generateExplanation: jest.MockedFunction<typeof ExplanationService.generateExplanation>;
  analyzeImpact: jest.MockedFunction<typeof ContextGuardService.analyzeImpact>;
  createRecommendations: jest.MockedFunction<typeof LearningService.generateRecommendations>;
}
```

### Integration Testing Strategy

#### End-to-End Workflows
- Complete project upload → analysis → exploration workflow
- Learning session with memory tracking and recommendations
- Change detection → impact analysis → user decision workflow
- Multi-project management and switching scenarios

#### Component Integration
- React Flow + Framer Motion animation coordination
- ts-morph analysis + database storage pipeline
- Memory system + recommendation engine integration
- Authentication + project access control

### Performance Testing Considerations

#### Load Testing Scenarios
- Large codebase analysis (10,000+ files)
- Complex dependency graphs (1,000+ nodes)
- Concurrent user sessions with shared projects
- Memory system with extensive learning history
- AI model inference under concurrent load
- Vector database queries with large embedding sets

#### AI Performance Benchmarks
- **Code Analysis**: Complete analysis within 30 seconds for typical projects (< 1,000 files)
- **Explanation Generation**: Generate concept explanations within 3 seconds
- **Impact Analysis**: Analyze change impact within 5 seconds for typical changes
- **Semantic Search**: Return relevant results within 1 second
- **Learning Recommendations**: Generate personalized suggestions within 2 seconds

#### System Performance Benchmarks
- Graph rendering time: < 2 seconds for 500 nodes
- Search response time: < 500ms for keyword queries
- Memory system updates: < 100ms for interaction logging
- Database queries: < 200ms for typical operations
- Vector similarity search: < 1 second for 10,000 embeddings

#### Resource Usage Limits
- **Memory**: AI models should not exceed 2GB RAM per instance
- **CPU**: Model inference should not block UI for more than 100ms
- **Storage**: Vector embeddings should be compressed and indexed efficiently
- **Network**: API calls should be batched and cached appropriately