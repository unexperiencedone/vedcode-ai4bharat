"use client";

import React, { useEffect, useState } from 'react';
import { MentorInsightWidget } from './MentorInsightWidget';

interface InsightPayload {
    type: 'architecture' | 'learning' | 'refactor';
    patternType: string;
    severityScore: number;
    title: string;
    actionableAdvice: string;
    relatedConcepts: string[];
}

export function GlobalMentorOverlay() {
    const [insight, setInsight] = useState<InsightPayload | null>(null);

    useEffect(() => {
        // In a real application, this would listen to an EventSource (SSE), WebSockets, or a Redux store.
        // For demonstration of the UX Consolidation layer, we'll simulate a delayed arrival of a highly critical insight
        // simulating the RegressionCorrelationEngine calculating a risk_score > threshold.

        const timer = setTimeout(() => {
            // Simulated high-severity insight breaching the "quiet" threshold
            setInsight({
                type: 'architecture',
                patternType: 'async_error_handling_regression',
                severityScore: 0.85,
                title: 'Concept Regression Detected',
                actionableAdvice: 'The failure likely involves the Async/Await concept introduced in your last commit. Review asynchronous error propagation.',
                relatedConcepts: ['async_await', 'error_handling']
            });
        }, 8000); // Wait 8 seconds before interrupting the user

        return () => clearTimeout(timer);
    }, []);

    if (!insight) return null; // STRICT RULE: Remain completely hidden unless triggered

    return <MentorInsightWidget initialInsight={insight} />;
}
