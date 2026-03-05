import { Project, SourceFile, Node, SyntaxKind } from "ts-morph";

export interface SymbolChange {
  name: string;
  type: "function" | "class" | "interface" | "component" | "variable";
  changeType: "added" | "modified" | "deleted";
  lineStart: number;
  lineEnd: number;
}

/**
 * AST Diff Engine
 * Detects changes at the symbol level between two versions of a file.
 */
export class ASTDiff {
  private project: Project;

  constructor() {
    this.project = new Project({ useInMemoryFileSystem: true });
  }

  /**
   * Compares an old version of a file with a new version.
   * returns a list of changed symbols.
   */
  public async diff(oldContent: string, newContent: string, fileName: string): Promise<SymbolChange[]> {
    const oldSource = this.project.createSourceFile(`old_${fileName}`, oldContent);
    const newSource = this.project.createSourceFile(`new_${fileName}`, newContent);

    const oldSymbols = this.extractSymbols(oldSource);
    const newSymbols = this.extractSymbols(newSource);

    const changes: SymbolChange[] = [];

    // Detect Added and Modified
    for (const [name, newSym] of newSymbols) {
      const oldSym = oldSymbols.get(name);
      if (!oldSym) {
        changes.push({ ...newSym, changeType: "added" });
      } else if (oldSym.hash !== newSym.hash) {
        changes.push({ ...newSym, changeType: "modified" });
      }
    }

    // Detect Deleted
    for (const [name, oldSym] of oldSymbols) {
      if (!newSymbols.has(name)) {
        changes.push({ ...oldSym, changeType: "deleted" });
      }
    }

    // Cleanup
    this.project.removeSourceFile(oldSource);
    this.project.removeSourceFile(newSource);

    return changes;
  }

  private extractSymbols(sourceFile: SourceFile): Map<string, any> {
    const symbolMap = new Map<string, any>();

    // Functions & Components
    sourceFile.getFunctions().forEach(fn => {
      const name = fn.getName() || "anonymous";
      symbolMap.set(name, {
        name,
        type: /^[A-Z]/.test(name) ? "component" : "function",
        lineStart: fn.getStartLineNumber(),
        lineEnd: fn.getEndLineNumber(),
        hash: this.computeHash(fn.getText())
      });
    });

    // Classes
    sourceFile.getClasses().forEach(cls => {
      const name = cls.getName() || "anonymous";
      symbolMap.set(name, {
        name,
        type: "class",
        lineStart: cls.getStartLineNumber(),
        lineEnd: cls.getEndLineNumber(),
        hash: this.computeHash(cls.getText())
      });
    });

    // Const components/variables
    sourceFile.getVariableDeclarations().forEach(v => {
      if (v.isExported()) {
        const name = v.getName();
        symbolMap.set(name, {
          name,
          type: /^[A-Z]/.test(name) ? "component" : "variable",
          lineStart: v.getStartLineNumber(),
          lineEnd: v.getEndLineNumber(),
          hash: this.computeHash(v.getText())
        });
      }
    });

    return symbolMap;
  }

  private computeHash(text: string): string {
    // Basic hash for comparison (strip whitespace to avoid meta-changes)
    const clean = text.replace(/\s+/g, "");
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
        const char = clean.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return hash.toString();
  }
}
