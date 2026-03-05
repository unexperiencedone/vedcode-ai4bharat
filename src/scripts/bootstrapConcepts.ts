import "dotenv/config";
import { db } from "../lib/db";
import { conceptCards, technologies } from "../db/schema";
import { eq } from "drizzle-orm";

async function bootstrap() {
    console.log("🚀 Bootstrapping core concepts...");

    // 1. Ensure Technologies exist
    const techs = [
        { slug: "javascript", name: "JavaScript", category: "language" },
        { slug: "typescript", name: "TypeScript", category: "language" },
        { slug: "react", name: "React", category: "frontend" },
    ];

    for (const t of techs) {
        const existing = await db.query.technologies.findFirst({ where: eq(technologies.slug, t.slug) });
        if (!existing) {
            await db.insert(technologies).values(t);
            console.log(`✅ Created technology: ${t.name}`);
        }
    }

    const js = await db.query.technologies.findFirst({ where: eq(technologies.slug, "javascript") });
    const react = await db.query.technologies.findFirst({ where: eq(technologies.slug, "react") });

    // 2. Core Concepts
    const concepts = [
        { techId: js!.id, slug: "async-await", name: "Async/Await", oneLiner: "Modern way to handle asynchronous code." },
        { techId: js!.id, slug: "promises", name: "Promises", oneLiner: "Value that might be available now, or in the future." },
        { techId: react!.id, slug: "useeffect", name: "useEffect", oneLiner: "Hook for side effects in functional components." },
        { techId: react!.id, slug: "usestate", name: "useState", oneLiner: "Hook for state management in functional components." },
        { techId: react!.id, slug: "components", name: "Components", oneLiner: "Building blocks of a React UI." },
        { techId: react!.id, slug: "props", name: "Props", oneLiner: "Input to a React component." },
    ];

    for (const c of concepts) {
        const existing = await db.query.conceptCards.findFirst({ where: eq(conceptCards.slug, c.slug) });
        if (!existing) {
            await db.insert(conceptCards).values({
                technologyId: c.techId,
                slug: c.slug,
                name: c.name,
                oneLiner: c.oneLiner,
                beginnerExplanation: "Bootstrap",
                intermediateExplanation: "Bootstrap",
                advancedExplanation: "Bootstrap",
            });
            console.log(`✅ Created concept: ${c.name}`);
        }
    }

    process.exit(0);
}

bootstrap();
