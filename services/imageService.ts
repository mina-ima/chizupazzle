
import { GameMode } from '../types';

const WIKI_API_BASE = 'https://ja.wikipedia.org/w/api.php';

// In-memory cache to store fetched URLs during the session.
// This ensures images load instantly if the user restarts the game or switches modes back.
const IMAGE_CACHE: Record<string, string> = {};

// Helper to clean keywords (e.g. "じゃがいも日本一" -> "じゃがいも")
const cleanSearchTerm = (term: string): string => {
  if (!term) return "";
  return term
    .replace(/日本一|生産量|（.*?）|\(.*?\)/g, '') // Remove rankings and brackets
    .split('\n')[0] // Take first line if multiline
    .trim();
};

/**
 * Fetches a thumbnail image URL from Wikipedia for a given keyword.
 * Uses specific query parameters to handle CORS and get suitable thumbnails.
 */
export const fetchImageForKeyword = async (rawKeyword: string, context: string, mode: GameMode): Promise<string | null> => {
  
  const cleanKey = cleanSearchTerm(rawKeyword);
  if (!cleanKey) return null;

  // Construct search query based on mode to improve accuracy
  let searchQuery = "";
  
  if (mode === GameMode.MASCOT) {
    // Mascots are usually unique names (e.g., "Kumamon"). 
    // Adding prefecture name might actually hurt if the mascot page is more popular than the "Mascots of X" page.
    searchQuery = cleanKey;
  } else if (mode === GameMode.RANKING) {
    // For ranking, we cleaned "No.1", so we have a generic term like "Potato".
    // We need the prefecture to find "Hokkaido Potato".
    searchQuery = `${context} ${cleanKey}`;
  } else {
    // Default strategy: combine context + keyword (e.g., "Kyoto Kinkakuji")
    searchQuery = `${context} ${cleanKey}`;
  }

  // Check cache first
  if (IMAGE_CACHE[searchQuery]) {
    return IMAGE_CACHE[searchQuery];
  }

  try {
    // 1. Search for the page title first
    const searchUrl = `${WIKI_API_BASE}?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&utf8=&format=json&origin=*&srlimit=1`;
    
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.query?.search?.length) {
      return null;
    }

    const title = searchData.query.search[0].title;

    // 2. Get the page image for the found title
    const imgUrl = `${WIKI_API_BASE}?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=400&origin=*`;
    
    const imgRes = await fetch(imgUrl);
    const imgData = await imgRes.json();

    const pages = imgData.query?.pages;
    if (!pages) return null;

    const pageId = Object.keys(pages)[0];
    if (pageId === '-1') return null;

    const thumbnail = pages[pageId]?.thumbnail;
    
    if (thumbnail && thumbnail.source) {
      const url = thumbnail.source;
      
      // 3. Filter out obviously wrong images (Maps, Flags, Emblems)
      // Wikipedia often returns these if the page is a generic Prefecture page.
      const lowerUrl = url.toLowerCase();
      const invalidPatterns = [
        'map', 'location', 'flag', 'emblem', 'symbol', 'pref', 'ken_iso', 'montage', 'outline'
      ];
      
      // If the URL contains these keywords, it's likely not the specific item we want
      // EXCEPT if the keyword itself implies a map/flag (unlikely in this game)
      const isInvalid = invalidPatterns.some(pattern => lowerUrl.includes(pattern));

      if (isInvalid) {
        // Store null to prevent refetching
        IMAGE_CACHE[searchQuery] = ''; 
        return null;
      }

      // Save to cache
      IMAGE_CACHE[searchQuery] = url;
      return url;
    }

  } catch (error) {
    console.warn(`Image fetch failed for: ${searchQuery}`, error);
  }
  
  return null;
};
