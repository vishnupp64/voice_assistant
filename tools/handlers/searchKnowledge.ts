import { KNOWLEDGE_STORE } from '../data-store';
import { SearchKnowledgeInput } from '../schemas';
import { ToolExecutionContext, ToolExecutionResult } from '@/types/tools';

export async function handleSearchKnowledge(
  input: SearchKnowledgeInput,
  _context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const queryLower = input.query.toLowerCase();
  const searchTerms = queryLower.split(/\s+/).filter(Boolean);

  let results = KNOWLEDGE_STORE.filter((article) => {
    if (input.category && input.category !== 'all' && article.category !== input.category) {
      return false;
    }
    const matchesKeyword = article.keywords.some((kw) => queryLower.includes(kw) || kw.includes(queryLower));
    const matchesContent = searchTerms.some((term) =>
      article.content.toLowerCase().includes(term) || article.title.toLowerCase().includes(term)
    );
    return matchesKeyword || matchesContent;
  });

  if (results.length === 0) {
    // Return all articles if category was specified or generic results
    results = KNOWLEDGE_STORE.slice(0, 2);
  }

  const limitedResults = results.slice(0, input.limit || 3).map((a) => ({
    title: a.title,
    category: a.category,
    content: a.content,
  }));

  return {
    success: true,
    data: {
      found: limitedResults.length,
      articles: limitedResults,
    },
  };
}
