document.addEventListener('DOMContentLoaded', () => {

    const CYBER_RSS_URL = 'https://www.wired.com/feed/category/security/latest/rss';
    const RSS_TO_JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

    const featuredDateMetaEl = document.getElementById('featured-news-date-meta');
    const featuredLinkEl = document.getElementById('featured-news-link');
    const featuredTitleEl = document.getElementById('featured-news-title');
    const newsImageEl = document.getElementById('news-image');
    const graphicFallbackEl = document.getElementById('dynamic-graphic-fallback');

    // --- Search Bar Elements ---
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    
    // 1. Site Map
    const siteMap = {
        'index.html': ['home', 'main page', 'digital realm', 'cyberware', 'protect'],
        'beware.html': ['beware', 'be aware', 'phishing', 'scams', 'vulnerabilities'],
        'unhackable.html': ['unhackable', 'security tools', 'protection', 'software', 'firewall'],
        'community.html': ['community', 'join', 'forum', 'discussion', 'users'],
        'cybernews.html': ['cybernews', 'news', 'articles', 'reports', 'updates'],
        'verify.html': ['verify number', 'check number', 'verification', 'phone'],
        'inquiries.html': ['press inquiries', 'media', 'inquiries', 'business', 'partnership'],
        'app.html': ['mobile app', 'app download', 'application', 'device', 'waitlist'],
        'contact.html': ['contact us', 'get in touch', 'email', 'phone', 'location', 'support'],
    };

    // --- Initialization ---
    fetchFeaturedNews();
    setupSearchFunctionality();

    // -------------------------------------------------------------------
    //                       RSS NEWS FUNCTIONALITY
    // -------------------------------------------------------------------

    function fetchFeaturedNews() {
        // Use the new Wired Security feed
        const apiURL = RSS_TO_JSON_API + encodeURIComponent(CYBER_RSS_URL);

        fetch(apiURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Remove loading spinner/text immediately
                const spinner = document.getElementById('featured-loading-spinner');
                if (spinner) spinner.remove();
                const loadingText = document.querySelector('.loading-text');
                if (loadingText) loadingText.remove();


                if (data.status === 'ok' && data.items && data.items.length > 0) {
                    // Items are usually sorted by date, so the first is the latest
                    updateFeaturedNews(data.items[0]);
                } else {
                    displayNewsError('Cyber news feed is empty or invalid.');
                }
            })
            .catch(error => {
                console.error('Error fetching the news feed:', error);
                displayNewsError('Failed to connect to the external feed.');
            });
    }

    /**
     * Extracts the image URL from the RSS feed item structure.
     * Wired uses 'media:content' which RSS2JSON often maps to 'enclosure' or provides a 'thumbnail'.
     * @param {Object} item - The news item.
     * @returns {string|null} The image URL or null.
     */
    function getNewsImageUrl(item) {
        // Check for common image fields provided by RSS2JSON
        if (item.enclosure && item.enclosure.link) {
            return item.enclosure.link;
        }
        if (item.thumbnail) {
            return item.thumbnail;
        }
        // Fallback: use the first image found in the description content if necessary
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = item.description || '';
        const imgTag = tempDiv.querySelector('img');
        if (imgTag && imgTag.src) {
            return imgTag.src;
        }
        return null;
    }

    /**
     * Updates the Hero Section with the latest news item, including the actual image and description.
     * @param {Object} item - The first news item from the RSS feed.
     */
    function updateFeaturedNews(item) {
        if (!item) return;

        // 1. Set the link and important description (title)
        featuredLinkEl.href = item.link;
        featuredTitleEl.textContent = item.title;

        // 2. Load the actual image
        const imageUrl = getNewsImageUrl(item);
        
        if (imageUrl) {
            newsImageEl.src = imageUrl;
            
            // Show the image and hide the fallback graphic once the image successfully loads
            newsImageEl.onload = () => {
                newsImageEl.style.display = 'block';
                graphicFallbackEl.style.display = 'none';
            };

            // If the image fails to load, use the fallback graphic
            newsImageEl.onerror = () => {
                newsImageEl.style.display = 'none';
                graphicFallbackEl.style.display = 'flex'; 
            };
        } else {
             // If no image URL is provided by the feed, always show the fallback
             if (graphicFallbackEl) graphicFallbackEl.style.display = 'flex';
             if (newsImageEl) newsImageEl.style.display = 'none';
        }

        // 3. Format and set the date meta
        const pubDate = new Date(item.pubDate);
        const formattedDate = pubDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const formattedTime = pubDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // 24-hour format for the aesthetic
        });

        featuredDateMetaEl.textContent = `${formattedDate} // ${formattedTime} UTC`;
    }

    function displayNewsError(message) {
        if (featuredTitleEl) {
            featuredTitleEl.textContent = `[ERROR]: ${message}`;
            featuredTitleEl.style.color = '#ff5555';
        }
        if (featuredDateMetaEl) {
            featuredDateMetaEl.textContent = 'NO DATA LINK';
        }
        // Ensure fallback is visible on error
        if (graphicFallbackEl) graphicFallbackEl.style.display = 'flex';
        if (newsImageEl) newsImageEl.style.display = 'none';
    }


    // -------------------------------------------------------------------
    //                       SEARCH BAR FUNCTIONALITY (Unchanged)
    // -------------------------------------------------------------------

    function createDropdown() {
        document.querySelectorAll('.search-results-dropdown').forEach(el => el.remove());

        const dropdown = document.createElement('div');
        dropdown.className = 'search-results-dropdown';
        searchForm.appendChild(dropdown); 
        return dropdown;
    }

    function performSearch(query) {
        const dropdown = createDropdown();

        if (query.trim() === '') {
            return; 
        }

        const normalizedQuery = query.toLowerCase().trim();
        const results = {};

        for (const file in siteMap) {
            const keywords = siteMap[file];
            if (keywords.some(k => k.includes(normalizedQuery))) {
                const displayTitle = keywords[0].replace(/\b\w/g, c => c.toUpperCase()); 
                results[file] = displayTitle;
            }
        }

        const resultKeys = Object.keys(results);

        if (resultKeys.length > 0) {
            resultKeys.forEach(file => {
                const link = document.createElement('a');
                link.href = file;
                link.className = 'dropdown-item';
                link.textContent = results[file];
                dropdown.appendChild(link);
            });
        } else {
            const noResults = document.createElement('div');
            noResults.className = 'dropdown-item no-results';
            noResults.textContent = '❌ NO PROTOCOL MATCHES';
            dropdown.appendChild(noResults);
        }
    }

    function setupSearchFunctionality() {
        searchInput.addEventListener('input', (e) => {
            performSearch(e.target.value);
        });

        document.addEventListener('click', (e) => {
            if (!searchForm.contains(e.target)) {
                document.querySelectorAll('.search-results-dropdown').forEach(el => el.remove());
            }
        });
        
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            performSearch(searchInput.value); 
        });
    }
});