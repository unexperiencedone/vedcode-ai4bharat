import hljs from 'highlight.js/lib/core';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import java from 'highlight.js/lib/languages/java';
import python from 'highlight.js/lib/languages/python';
import javascript from 'highlight.js/lib/languages/javascript';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';

// Register only the languages we support to keep bundle size small
hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('java', java);
hljs.registerLanguage('python', python);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);

const supportedLanguages = ['c', 'cpp', 'java', 'python', 'javascript', 'go', 'rust'];

/**
 * Attempts to detect the programming language of the given code snippet.
 * Defaults to 'javascript' if detection fails or confidence is too low.
 *
 * @param {string} code - The source code to analyze
 * @returns {string} The detected language ID (e.g., 'python', 'javascript')
 */
export const detectLanguage = (code: string): string => {
  if (!code || code.trim() === '') {
    return 'javascript'; // Default for empty code
  }

  try {
    // Only check against our supported languages
    const result = hljs.highlightAuto(code, supportedLanguages);
    
    // hljs sometimes returns a slightly different name (e.g. 'js' instead of 'javascript', 'c++' instead of 'cpp')
    // but limiting the subset usually makes it return the identifier we provided.
    // Let's normalize just in case.
    let detectedObj = result.language;
    
    if(!detectedObj) return 'javascript';
    
    const detected = detectedObj.toLowerCase();
    
    if (detected === 'c++') return 'cpp';
    if (detected === 'js') return 'javascript';
    if (detected === 'golang') return 'go';
    
    if (supportedLanguages.includes(detected)) {
        return detected;
    }

    return 'javascript'; // Fallback
  } catch (error) {
    console.error("Language detection failed:", error);
    return 'javascript'; // Fallback
  }
};
