import { db } from "../db";
import { symbolEdges, conceptUsage, codeChangeLog, architectureMetrics, symbolNodes, fileNodes } from "../../db/schema";
import { eq, sql, and, count } from "drizzle-orm";

export interface StressMetrics {
  couplingScore: number;
  conceptDensity: number;
  changeFrequency: number;
  stressScore: number;
}

/**
 * Architectural Stress Engine
 * Computes fragilty and hotspot metrics based on graph topology and concept concentration.
 */
export class ArchitecturalStressEngine {

  /**
   * Computes the stress score for a specific symbol or file.
   */
  async computeStress(nodeId: string, nodeType: "file" | "symbol"): Promise<StressMetrics> {
    const coupling = await this.calculateCoupling(nodeId, nodeType);
    const density = await this.calculateDensity(nodeId, nodeType);
    const frequency = await this.calculateFrequency(nodeId, nodeType);

    // Normalized Weights: Coupling (40%), Density (30%), Frequency (30%)
    const stressScore = (coupling * 0.4) + (density * 0.3) + (frequency * 0.3);

    // Persist Metrics
    await db.insert(architectureMetrics).values({
      nodeId,
      nodeType,
      couplingScore: coupling,
      conceptDensity: density,
      changeFrequency: frequency,
      stressScore,
      lastComputed: new Date()
    }).onConflictDoUpdate({
      target: [architectureMetrics.nodeId],
      set: {
        couplingScore: coupling,
        conceptDensity: density,
        changeFrequency: frequency,
        stressScore,
        lastComputed: new Date()
      }
    });

    return { couplingScore: coupling, conceptDensity: density, changeFrequency: frequency, stressScore };
  }

  /**
   * Coupling: How many modules depend on this symbol.
   * Formula: dependents / total_symbols (simplified)
   */
  private async calculateCoupling(nodeId: string, nodeType: "file" | "symbol"): Promise<number> {
    if (nodeType === "symbol") {
      const result = await db.select({ value: count() })
        .from(symbolEdges)
        .where(eq(symbolEdges.targetSymbolId, nodeId));
      
      const dependents = Number(result[0].value);
      // Normalize: Cap at 10 dependents for a high score in MVP
      return Math.min(dependents / 10, 1.0);
    }
    return 0; // File level coupling could be imports count, simplified here
  }

  /**
   * Concept Density: How many distinct concepts in a module.
   */
  private async calculateDensity(nodeId: string, nodeType: "file" | "symbol"): Promise<number> {
    const filter = nodeType === "file" ? eq(conceptUsage.fileId, nodeId) : eq(conceptUsage.symbolId, nodeId);
    const result = await db.select({ value: count() })
      .from(conceptUsage)
      .where(filter);
    
    const conceptsCount = Number(result[0].value);
    // Normalize: 5+ concepts is considered high density
    return Math.min(conceptsCount / 5, 1.0);
  }

  /**
   * Change Frequency: Volatility of the code.
   */
  private async calculateFrequency(nodeId: string, nodeType: "file" | "symbol"): Promise<number> {
    if (nodeType === "file") {
      const result = await db.query.codeChangeLog.findFirst({
        where: eq(codeChangeLog.fileId, nodeId)
      });
      const count = result?.changeCount || 1;
      // Normalize: 20+ changes is considered high frequency
      return Math.min(count / 20, 1.0);
    }
    return 0.1; // Default for symbols
  }

  /**
   * Run full architectural scan.
   */
  async runFullScan() {
    console.log("🔍 Running Architectural Stress Scan...");
    const files = await db.select().from(fileNodes);
    
    for (const file of files) {
      await this.computeStress(file.id, "file");
      
      const symbols = await db.select().from(symbolNodes).where(eq(symbolNodes.fileId, file.id));
      for (const symbol of symbols) {
        await this.computeStress(symbol.id, "symbol");
      }
    }
    console.log("✅ Scan complete.");
  }
}
