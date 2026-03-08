import { ASTDiff } from "./astDiff";
import { ImpactTraversal } from "./impactTraversal";
import { ConceptImpact } from "./conceptImpact";
import { GuardAdvisor, GuardAdvice } from "./guardAdvisor";
import { db } from "../db";
import { fileNodes } from "../../db/schema";
import { eq } from "drizzle-orm";

export interface GuardResult {
  filePath: string;
  impactedSymbols: any[];
  impactedConcepts: any[];
  advice: GuardAdvice[];
}

/**
 * Context Guard Engine
 * The main orchestrator for the VedCode "Reasoning Engine".
 */
export class ContextGuardEngine {
  private astDiff: ASTDiff;
  private traversal: ImpactTraversal;
  private conceptImpact: ConceptImpact;
  private advisor: GuardAdvisor;

  constructor() {
    this.astDiff = new ASTDiff();
    this.traversal = new ImpactTraversal();
    this.conceptImpact = new ConceptImpact();
    this.advisor = new GuardAdvisor();
  }

  /**
   * Runs the full guard pipeline for a file change.
   */
  async run(filePath: string, oldContent: string, newContent: string, userId: string = "default-user"): Promise<GuardResult> {
    // 1. Get file ID from DB
    const file = await db.query.fileNodes.findFirst({
      where: eq(fileNodes.path, filePath)
    });

    if (!file) {
      throw new Error(`File ${filePath} not found in codebase graph. Please index first.`);
    }

    // 2. AST Diff: What symbols changed?
    const changes = await this.astDiff.diff(oldContent, newContent, filePath);
    const modifiedNames = changes
      .filter(c => c.changeType === "modified" || c.changeType === "added")
      .map(c => c.name);

    if (modifiedNames.length === 0) {
      return { filePath, impactedSymbols: [], impactedConcepts: [], advice: [] };
    }

    // 3. Impact Traversal: Who calls these symbols?
    const impactedSymbols = await this.traversal.getImpactedSymbols(modifiedNames, file.id);

    // 4. Concept Correlation: What topics are affected?
    const symbolIds = impactedSymbols.map(s => s.id);
    const impactedConcepts = await this.conceptImpact.getImpactedConcepts(symbolIds);

    // 5. Guard Advisor: Mastery-based guidance
    const advice = await this.advisor.getAdvice(impactedConcepts, userId);

    return {
      filePath,
      impactedSymbols,
      impactedConcepts,
      advice
    };
  }
}
