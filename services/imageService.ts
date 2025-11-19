
const WIKI_API_BASE = 'https://ja.wikipedia.org/w/api.php';

// In-memory cache to store fetched URLs during the session.
// This ensures images load instantly if the user restarts the game or switches modes back.
const IMAGE_CACHE: Record<string, string> = {};

/**
 * Fetches a thumbnail image URL from Wikipedia for a given keyword.
 * Uses specific query parameters to handle CORS and get suitable thumbnails.
 */
export const fetchImageForKeyword = async (keyword: string, context?: string): Promise<string | null> => {
  // Combine context (e.g. Prefecture Name) + Keyword for better search accuracy
  // e.g. "熊本県 くまモン" instead of just "くまモン"
  const searchQuery = context ? `${context} ${keyword}` : keyword;

  // Check cache first for smooth display
  if (IMAGE_CACHE[searchQuery]) {
    return IMAGE_CACHE[searchQuery];
  }

  try {
    // 1. Search for the page title first
    // action=query&list=search...
    const searchUrl = `${WIKI_API_BASE}?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&utf8=&format=json&origin=*&srlimit=1`;
    
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.query?.search?.length) {
      return null;
    }

    const title = searchData.query.search[0].title;

    // 2. Get the page image for the found title
    // prop=pageimages&pithumbsize=300
    const imgUrl = `${WIKI_API_BASE}?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=300&origin=*`;
    
    const imgRes = await fetch(imgUrl);
    const imgData = await imgRes.json();

    const pages = imgData.query?.pages;
    if (!pages) return null;

    // The API returns pages keyed by PageID, so we grab the first value
    const pageId = Object.keys(pages)[0];
    if (pageId === '-1') return null;

    const thumbnail = pages[pageId]?.thumbnail;
    if (thumbnail && thumbnail.source) {
      // Save to cache
      IMAGE_CACHE[searchQuery] = thumbnail.source;
      return thumbnail.source;
    }

  } catch (error) {
    console.warn(`Image fetch failed for: ${searchQuery}`, error);
  }
  
  return null;
};
