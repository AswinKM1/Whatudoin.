export const analyzeProductivity = (entries) => {
    // Keywords for scoring
    const POSITIVE_KEYWORDS = ['code', 'coding', 'debug', 'fix', 'implement', 'study', 'learn', 'work', 'meeting', 'plan', 'design', 'write', 'exercise', 'gym', 'cook'];
    const NEGATIVE_KEYWORDS = ['youtube', 'netflix', 'scroll', 'reddit', 'twitter', 'game', 'gaming', 'sleep', 'nap', 'waste', 'procrastinate'];

    let totalScore = 0;
    let productiveCount = 0;
    let unproductiveCount = 0;

    // Process each entry
    const processedEntries = entries.map(entry => {
        const text = entry.text.toLowerCase();
        let score = 5; // Neutral default
        let type = 'neutral';

        // Check positive
        if (POSITIVE_KEYWORDS.some(k => text.includes(k))) {
            score = 10;
            type = 'productive';
        }
        // Check negative
        else if (NEGATIVE_KEYWORDS.some(k => text.includes(k))) {
            score = 2;
            type = 'unproductive';
        }

        if (score > 5) productiveCount++;
        if (score < 5) unproductiveCount++;

        totalScore += score;

        return {
            ...entry,
            score,
            type
        };
    });

    // Calculate Overall Day score (0-100)
    // Simple average mapped to percent? Or accumulation?
    // Let's do Average Score * 10. Avg score is 0-10. So result is 0-100.
    const avgScore = entries.length > 0 ? totalScore / entries.length : 0;
    const finalScore = Math.round(avgScore * 10);

    // Generate Suggestions
    const suggestions = [];
    if (finalScore < 50) suggestions.push("Low productivity detected. Try focusing on one task at a time.");
    if (unproductiveCount > productiveCount) suggestions.push("You have more unproductive entries than productive ones.");
    if (entries.length < 3) suggestions.push("Tracking more activities gives better insights.");

    return {
        processedEntries,
        overallScore: finalScore,
        stats: {
            productive: productiveCount,
            unproductive: unproductiveCount,
            total: entries.length
        },
        suggestions
    };
};
