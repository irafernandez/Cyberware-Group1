document.addEventListener('DOMContentLoaded', () => {
    // UPDATED RSS Feed URL: Wired Security is a good source for tech/cyber-focused news
    const CYBER_RSS_URL = 'https://www.wired.com/feed/category/security/latest/rss'; 
    
    // Public RSS-to-JSON proxy to bypass CORS restrictions
    const RSS_TO_JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

    const feedContainer = document.getElementById('news-feed-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const heroParagraph = document.querySelector('.news-hero .lead');

    fetchNewsFeed();

    function fetchNewsFeed() {
        const apiURL = RSS_TO_JSON_API + encodeURIComponent(CYBER_RSS_URL);

        fetch(apiURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Hide the loading indicator
                if (loadingSpinner) {
                    loadingSpinner.remove();
                }

                if (data.status === 'ok' && data.items && data.items.length > 0) {
                    // Update the hero text to reflect the source
                    if (heroParagraph) {
                        heroParagraph.innerHTML = 'Powered by <a href="https://www.wired.com/category/security/" target="_blank" class="custom-neon-blue-text-link">WIRED Security</a> | Real-time Cybersecurity Intelligence.';
                    }
                    renderArticles(data.items);
                } else {
                    displayError('The WIRED Security feed is currently unavailable or empty. Check the console for data status.');
                }
            })
            .catch(error => {
                console.error('Error fetching the news feed:', error);
                if (loadingSpinner) {
                    loadingSpinner.remove();
                }
                displayError('Failed to load cyber news. The proxy or target RSS feed is inaccessible.');
            });
    }

    /**
     * Extracts the image URL from the RSS feed item, checking multiple common places.
     * @param {Object} item - The news item.
     * @returns {string|null} The image URL or null.
     */
    function getNewsImageUrl(item) {
        // 1. Check for enclosure (common for images)
        if (item.enclosure && item.enclosure.link && item.enclosure.type.startsWith('image')) {
            return item.enclosure.link;
        }
        // 2. Check for thumbnail
        if (item.thumbnail) {
            return item.thumbnail;
        }
        // 3. Parse content/description HTML for the first <img> tag
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = item.content || item.description || '';
        const imgTag = tempDiv.querySelector('img');
        if (imgTag && imgTag.src) {
            return imgTag.src;
        }
        // Fallback to a generic image placeholder for design consistency
        return 'https://via.placeholder.com/600x400/121A2C/39FF14?text=CYBERWARE+SCAN'; 
    }

    function renderArticles(items) {
        feedContainer.innerHTML = '';
        
        const articlesToRender = items.slice(0, 12); 

        articlesToRender.forEach(item => {
            const imageUrl = getNewsImageUrl(item);
            
            // WIRED feeds usually have a description in item.content
            const rawDescription = item.content ? stripHtml(item.content) : (item.description ? stripHtml(item.description) : 'Click to view the full article for details.');
            const description = rawDescription.substring(0, 200).trim() + (rawDescription.length > 200 ? '...' : '');

            // Format the publication date
            const pubDate = new Date(item.pubDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Create the HTML structure for one article, including the image container
            const articleHTML = `
                <div class="col-lg-4 col-md-6 mb-4">
                    <a href="${item.link}" target="_blank" class="text-decoration-none d-block h-100">
                        <div class="card article-card shadow-lg">
                            <div class="article-img-container">
                                <img src="${imageUrl}" alt="${item.title}" loading="lazy">
                            </div>
                            <div class="article-card-body">
                                <h5 class="article-card-title">${item.title}</h5>
                                <p class="article-meta text-white-50">
                                    Published: ${pubDate} 
                                    ${item.author ? ` | By: ${item.author}` : ''}
                                </p>
                                <p>${description}</p>
                                <div class="mt-auto pt-2">
                                    <span class="read-more-link">
                                        Read Full Article 
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path fill-rule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h5.793l-8.147 8.146a.5.5 0 0 0 .708.708l8.146-8.147V13.5a.5.5 0 0 0 1 0v-11z"/>
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            `;
            
            feedContainer.insertAdjacentHTML('beforeend', articleHTML);
        });
    }
    
    // Utility function to clean up HTML content from the feed description
    function stripHtml(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    }

    function displayError(message) {
        feedContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading text-neon-red">Feed Connection Error</h4>
                    <p class="text-light">${message}</p>
                    <hr>
                    <p class="mb-0 text-light">If the feed URL is correct, the proxy service may be having issues.</p>
                </div>
            </div>
        `;
    }
});