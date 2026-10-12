async function generateResponse(intent, context, message) {
    if (intent === 'cycle') {
        if (String(message || '').toLowerCase().match(/workout|exercise|intense/)) {
            return "Gentle movement can be helpful during your period. If you feel well, try walking, stretching, or light exercise, and reduce intensity if you have pain, dizziness, or unusual bleeding.";
        }
        return "It looks like you're asking about your cycle. Your current phase is " + (context?.phase || 'unknown') + ".";
    }
    if (intent === 'mood') return "I understand you're feeling " + (context?.latestMood || 'a certain way') + ". Take care of yourself.";
    if (intent === 'symptoms') {
        if (String(message || '').toLowerCase().match(/cramp|pain|ache/)) {
            return "Cramps can happen as the uterus contracts during a period. Gentle heat, rest, hydration, and light stretching may help; seek medical advice for severe, new, or worsening pain.";
        }
        return "If you are experiencing symptoms, make sure to rest and stay hydrated.";
    }
    if (intent === 'nutrition') return "During the follicular phase, try leafy greens, lentils, eggs, yogurt, whole grains, and colorful fruits and vegetables. Choose balanced meals with protein, fiber, and enough water.";
    return "I'm here to help you with your health companion needs.";
}

module.exports = { generateResponse };
