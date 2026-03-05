import { SourceFile, SyntaxKind, Node } from "ts-morph";

export interface ConceptPattern {
  conceptSlug: string;
  match: (sourceFile: SourceFile) => Array<{
    node: Node;
    confidence: number;
  }>;
}

export const conceptPatterns: ConceptPattern[] = [
  {
    conceptSlug: "async_error_handling",
    match: (sourceFile: SourceFile) => {
      const matches: Array<{ node: Node; confidence: number }> = [];
      
      // Look for try-catch blocks that contain await expressions
      sourceFile.getDescendantsOfKind(SyntaxKind.TryStatement).forEach(tryStmt => {
        const hasAwait = tryStmt.getDescendantsOfKind(SyntaxKind.AwaitExpression).length > 0;
        if (hasAwait) {
          matches.push({ node: tryStmt, confidence: 0.9 });
        }
      });
      
      return matches;
    }
  },
  {
    conceptSlug: "react_conditional_rendering",
    match: (sourceFile: SourceFile) => {
      const matches: Array<{ node: Node; confidence: number }> = [];
      
      // Look for ternary operators or logical AND in JSX
      sourceFile.getDescendantsOfKind(SyntaxKind.JsxExpression).forEach(jsxExpr => {
        const expression = jsxExpr.getExpression();
        if (expression && (Node.isConditionalExpression(expression) || Node.isBinaryExpression(expression))) {
          matches.push({ node: jsxExpr, confidence: 0.85 });
        }
      });

      // Look for early returns in components returning null or JSX
      sourceFile.getFunctions().forEach(fn => {
        const name = fn.getName();
        if (name && /^[A-Z]/.test(name)) {
          const returns = fn.getDescendantsOfKind(SyntaxKind.ReturnStatement);
          if (returns.length > 1) {
             matches.push({ node: fn, confidence: 0.8 });
          }
        }
      });
      
      return matches;
    }
  }
];
