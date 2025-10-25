document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');

    // 1. Site Map: Define all searchable content across your files
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

    // 2. Function to create and manage the results dropdown
    function createDropdown() {
        // Remove existing dropdowns
        document.querySelectorAll('.search-results-dropdown').forEach(el => el.remove());

        const dropdown = document.createElement('div');
        dropdown.className = 'search-results-dropdown';
        // Insert it right after the search input/button container
        searchForm.appendChild(dropdown); 
        return dropdown;
    }

    // 3. Function to perform the search and update the display
    function performSearch(query) {
        const dropdown = createDropdown();

        if (query.trim() === '') {
            return; // Exit if the search box is empty
        }

        const normalizedQuery = query.toLowerCase().trim();
        const results = {};

        // Search the site map for matches
        for (const file in siteMap) {
            const keywords = siteMap[file];
            // Check if the query matches the filename or any keyword
            if (keywords.some(k => k.includes(normalizedQuery))) {
                // Use the first keyword as the display title
                const displayTitle = keywords[0].replace(/\b\w/g, c => c.toUpperCase()); // Capitalize first letter of each word
                results[file] = displayTitle;
            }
        }

        const resultKeys = Object.keys(results);

        if (resultKeys.length > 0) {
            // Display results
            resultKeys.forEach(file => {
                const link = document.createElement('a');
                link.href = file;
                link.className = 'dropdown-item';
                link.textContent = results[file];
                dropdown.appendChild(link);
            });
        } else {
            // Display "No results found"
            const noResults = document.createElement('div');
            noResults.className = 'dropdown-item no-results';
            noResults.textContent = '❌ NO RESULTS FOUND';
            dropdown.appendChild(noResults);
        }
    }

    // 4. Attach event listeners for real-time search
    searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });

    // Hide dropdown when clicking outside the search form
    document.addEventListener('click', (e) => {
        if (!searchForm.contains(e.target)) {
            document.querySelectorAll('.search-results-dropdown').forEach(el => el.remove());
        }
    });
    
    // Prevent the form submission (which causes a page reload)
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // You can keep the dropdown open or perform a final search
        performSearch(searchInput.value); 
    });
});