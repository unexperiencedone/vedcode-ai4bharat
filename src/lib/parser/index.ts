import { Project } from "ts-morph";

// AST Parser Logic
// Uses ts-morph to extract structural connections (imports, exports, function calls).

export async function parseCodebase(directoryPath: string) {
  const project = new Project();
  project.addSourceFilesAtPaths(`${directoryPath}/**/*.ts`);
  project.addSourceFilesAtPaths(`${directoryPath}/**/*.tsx`);

  const files = project.getSourceFiles();
  const graph: any[] = [];

  files.forEach(file => {
    const importDeclarations = file.getImportDeclarations();
    
    // Extract imports for the structural graph
    const imports = importDeclarations.map(imp => imp.getModuleSpecifierValue());

    graph.push({
      filePath: file.getFilePath(),
      imports
    });
  });

  return graph;
}
