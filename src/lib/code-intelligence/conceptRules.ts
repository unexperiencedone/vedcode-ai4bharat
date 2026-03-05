import { Node, SyntaxKind } from "ts-morph";

export interface ConceptRule {
    conceptSlug: string;
    nodeType: string;
    match: (node: Node) => boolean;
    confidence: number;
}

export const conceptRules: ConceptRule[] = [
    {
        conceptSlug: "useeffect",
        nodeType: "CallExpression",
        match: (node: Node) => {
            if (!Node.isCallExpression(node)) return false;
            const expression = node.getExpression();
            const text = expression.getText();
            return text === "useEffect" || text.endsWith(".useEffect");
        },
        confidence: 1.0,
    },
    {
        conceptSlug: "usestate",
        nodeType: "CallExpression",
        match: (node: Node) => {
            if (!Node.isCallExpression(node)) return false;
            const expression = node.getExpression();
            const text = expression.getText();
            return text === "useState" || text.endsWith(".useState");
        },
        confidence: 1.0,
    },
    {
        conceptSlug: "async-await",
        nodeType: "AwaitExpression",
        match: () => true,
        confidence: 1.0,
    },
    {
        conceptSlug: "promises",
        nodeType: "NewExpression",
        match: (node: Node) => {
            if (!Node.isNewExpression(node)) return false;
            return node.getExpression().getText() === "Promise";
        },
        confidence: 0.9,
    },
    {
        conceptSlug: "components",
        nodeType: "FunctionDeclaration",
        match: (node: Node) => {
            if (!Node.isFunctionDeclaration(node)) return false;
            const name = node.getName();
            // Heuristic: PascalCase name usually indicates a component
            return !!name && /^[A-Z]/.test(name);
        },
        confidence: 0.8,
    },
    {
        conceptSlug: "props",
        nodeType: "Parameter",
        match: (node: Node) => {
            if (!Node.isParameterDeclaration(node)) return false;
            const parent = node.getParent();
            if (Node.isFunctionDeclaration(parent)) {
                const name = parent.getName();
                return !!name && /^[A-Z]/.test(name); // Props of a PascalCase function
            }
            return false;
        },
        confidence: 0.7,
    }
];
