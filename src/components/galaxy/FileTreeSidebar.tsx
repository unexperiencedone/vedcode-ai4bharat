'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, FileCode, Folder, FolderOpen } from 'lucide-react';
import type { Node } from '@xyflow/react';

interface FileTreeSidebarProps {
    nodes: Node[];
    onNodeClick: (filePath: string, language: string) => void;
}

// Internal tree structure
interface TreeNode {
    name: string;
    path: string;
    isDirectory: boolean;
    children?: TreeNode[];
    language?: string;
}

/**
 * Converts a flat list of file paths (from graph nodes) into a nested tree structure.
 */
function buildTree(nodes: Node[]): TreeNode[] {
    const root: TreeNode[] = [];

    for (const node of nodes) {
        const d = node.data as Record<string, unknown>;
        if (d.nodeType === 'solar-system') continue; // Skip cluster backgrounds

        const filePath = d.filePath as string;
        if (!filePath) continue;

        const parts = filePath.split('/');
        let currentLevel = root;
        let currentPath = '';

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            currentPath += (currentPath === '' ? '' : '/') + part;
            const isFile = i === parts.length - 1;

            let existingNode = currentLevel.find((n) => n.name === part);

            if (!existingNode) {
                existingNode = {
                    name: part,
                    path: currentPath,
                    isDirectory: !isFile,
                    children: isFile ? undefined : [],
                    language: isFile ? (d.language as string) : undefined,
                };
                currentLevel.push(existingNode);
            }

            if (!isFile && existingNode.children) {
                currentLevel = existingNode.children;
            }
        }
    }

    // Sort: directories first, then alphabetical
    const sortTree = (nodes: TreeNode[]) => {
        nodes.sort((a, b) => {
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;
            return a.name.localeCompare(b.name);
        });
        for (const node of nodes) {
            if (node.children) sortTree(node.children);
        }
    };

    sortTree(root);
    return root;
}

// Recursive row component
function TreeRow({
    node,
    depth = 0,
    onNodeClick,
}: {
    node: TreeNode;
    depth?: number;
    onNodeClick: (filePath: string, language: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(depth < 2); // Default open top 2 levels

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleClick = () => {
        if (node.isDirectory) {
            setIsOpen(!isOpen);
        } else {
            onNodeClick(node.path, node.language ?? '');
        }
    };

    return (
        <div>
            <div
                onClick={handleClick}
                className="group flex items-center gap-1.5 py-1 px-2 mx-1 rounded-md cursor-pointer hover:bg-muted/50 text-sm transition-colors"
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
                {/* Expand/Collapse Icon */}
                <div
                    className={`w-4 h-4 flex items-center justify-center shrink-0 ${node.isDirectory ? 'text-muted-foreground hover:text-foreground' : 'opacity-0'}`}
                    onClick={node.isDirectory ? handleToggle : undefined}
                >
                    {node.isDirectory && (isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
                </div>

                {/* File/Folder Icon */}
                <div className="shrink-0">
                    {node.isDirectory ? (
                        isOpen ? (
                            <FolderOpen className="w-4 h-4 text-blue-400" />
                        ) : (
                            <Folder className="w-4 h-4 text-blue-400" />
                        )
                    ) : (
                        <FileCode className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                </div>

                {/* Label */}
                <span className={`truncate ${node.isDirectory ? 'font-medium text-foreground py-0.5' : 'text-muted-foreground group-hover:text-foreground'}`}>
                    {node.name}
                </span>
            </div>

            {/* Recursion for children */}
            {node.isDirectory && isOpen && node.children && (
                <div className="animate-in slide-in-from-top-1 fade-in duration-200">
                    {node.children.map((child) => (
                        <TreeRow key={child.path} node={child} depth={depth + 1} onNodeClick={onNodeClick} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function FileTreeSidebar({ nodes, onNodeClick }: FileTreeSidebarProps) {
    const tree = useMemo(() => buildTree(nodes), [nodes]);

    return (
        <div className="w-72 border-r border-border/50 bg-card/20 flex flex-col h-full overflow-hidden shrink-0">
            <div className="p-4 border-b border-border/50 bg-card/40 shrink-0">
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-primary" />
                    Project Files
                </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto py-2 pr-2 custom-scrollbar">
                {tree.map((node) => (
                    <TreeRow key={node.path} node={node} onNodeClick={onNodeClick} />
                ))}
                {tree.length === 0 && (
                    <div className="p-4 text-xs text-muted-foreground text-center italic">
                        No code files found in analysis.
                    </div>
                )}
            </div>
        </div>
    );
}
