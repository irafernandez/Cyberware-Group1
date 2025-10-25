document.addEventListener('DOMContentLoaded', () => {
    // UPDATED RSS Feed URL: Hacker News Newest Posts (hnrss.org)
    const HACKERNEWS_RSS_URL = 'https://hnrss.org/newest'; 
    
    // Public RSS-to-JSON proxy to bypass CORS restrictions
    const RSS_TO_JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

    const feedContainer = document.getElementById('news-feed-container');
    const loadingSpinner = document.getElementById('loading-spinner');

    fetchNewsFeed();

    function fetchNewsFeed() {
        // Construct the full API request URL
        const apiURL = RSS_TO_JSON_API + encodeURIComponent(HACKERNEWS_RSS_URL);

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
                    // Update the hero text to reflect the source change
                    const heroParagraph = document.querySelector('.news-hero .lead');
                    if (heroParagraph) {
                        heroParagraph.innerHTML = 'Powered by <a href="https://news.ycombinator.com/" target="_blank" class="text-info-neon">Hacker News</a> | Real-time Tech & Security Intelligence.';
                    }
                    renderArticles(data.items);
                } else {
                    displayError('The news feed is currently unavailable or empty. Check the console for data status.');
                    console.log('API Response Data:', data);
                }
            })
            .catch(error => {
                console.error('Error fetching the news feed:', error);
                // Hide spinner and display a user-friendly error
                if (loadingSpinner) {
                    loadingSpinner.remove();
                }
                displayError('Failed to load cyber news. The proxy or target RSS feed is inaccessible.');
            });
    }

    function renderArticles(items) {
        // Clear any existing content
        feedContainer.innerHTML = '';
        
        // Loop through the first 12 articles
        const articlesToRender = items.slice(0, 12); 

        articlesToRender.forEach(item => {
            // Hacker News feeds sometimes lack a detailed description, 
            // so we'll use a placeholder or the title if description is missing.
            const description = item.content ? stripHtml(item.content).substring(0, 200) + '...' : 'Click to view the full article and discussion.';
            
            // Format the publication date
            const pubDate = new Date(item.pubDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Create the HTML structure for one article
            const articleHTML = `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card article-card p-4 shadow-lg">
                        <h5 class="article-card-title">${item.title}</h5>
                        <p class="article-meta text-white-50">
                            Published: ${pubDate} 
                            ${item.author ? ` | By: ${item.author}` : ''}
                        </p>
                        <p>${description}</p>
                        <div class="mt-auto">
                            <a href="${item.link}" target="_blank" class="read-more-link">
                                Read Full Article 
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h5.793l-8.147 8.146a.5.5 0 0 0 .708.708l8.146-8.147V13.5a.5.5 0 0 0 1 0v-11z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            `;
            
            // Append the new article to the container
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