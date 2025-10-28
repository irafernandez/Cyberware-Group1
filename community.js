document.addEventListener('DOMContentLoaded', () => {
    // --- Initial DOM and Modal Setup ---
    const form = document.getElementById('post-submission-form');
    const contentInput = document.getElementById('post-content');
    const charCounter = document.getElementById('char-counter');
    
    // Modals
    const alertModalElement = document.getElementById('alertModal'); 
    const alertModal = new bootstrap.Modal(alertModalElement);
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmPostModal'));
    const deleteModal = new bootstrap.Modal(document.getElementById('deletePostModal'));
    
    // Buttons and Lists
    const finalSubmitBtn = document.getElementById('final-submit-btn');
    const finalDeleteBtn = document.getElementById('final-delete-btn');
    const feedList = document.getElementById('community-feed-list');
    
    // Constants for LocalStorage, SessionStorage, and Filtering
    const STORAGE_KEY = 'cyberwareCommunityPosts';
    const SESSION_ID_KEY = 'cyberwareUserSessionId';
    const MIN_CONTENT_LENGTH = 30;
    const MAX_CONTENT_LENGTH = 1000;
    
  
    const FORBIDDEN_WORDS = [
        // Spam & Scam
        "scam", "cheat", "hack", "phishing", "malware", "virus", "trojan", 
        "link", "http", "www", ".com", ".net", ".org", "telegram", "whatsapp",
        "crypto", "bitcoin", "money now", "free money",

    ];

    // --- Session ID Management ---
    let currentUserSessionId = sessionStorage.getItem(SESSION_ID_KEY);
    if (!currentUserSessionId) {
        currentUserSessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem(SESSION_ID_KEY, currentUserSessionId);
    }
    
    // Initial static posts definition (Remains the same)
    const initialPosts = [
        {
            id: 'static-1',
            title: 'Major Ransomware Attack on a Small Business?',
            content: "My friend's company was hit; all files encrypted. They didn't have backups. Is there any way to fight this without paying the ransom?",
            guardianId: '3087',
            category: 'danger',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), 
            userSessionId: 'system-static' 
        },
        {
            id: 'static-2',
            title: "Don't Forget to Check Your Router Firmware!",
            content: "Just updated my router; found out I was running five versions behind. Router security is often the weakest link in a home network. Patch everything!",
            guardianId: '5193',
            category: 'tip',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), 
            userSessionId: 'system-static'
        },
        {
            id: 'static-3',
            title: 'Are hardware security keys worth the investment?',
            content: 'I use an authenticator app, but keep seeing YubiKeys recommended. For a normal user, is the extra cost justified for better protection?',
            guardianId: '1402',
            category: 'question',
            timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), 
            userSessionId: 'system-static'
        }
    ];

    let currentPostData = {};
    let postToDeleteId = null;

    // --- Custom Alert Function (Replaces standard alert()) ---
    function showCustomAlert(title, message, isSuccess = false) {
        const header = alertModalElement.querySelector('.modal-header');
        const titleElement = alertModalElement.querySelector('.modal-title');

        // Reset classes for dynamic coloring
        header.classList.remove('border-danger', 'border-info');
        titleElement.classList.remove('text-danger', 'text-info');

        if (isSuccess) {
            header.classList.add('border-info');
            titleElement.classList.add('text-info');
        } else {
            header.classList.add('border-danger');
            titleElement.classList.add('text-danger');
        }

        titleElement.textContent = title;
        document.getElementById('alert-message').innerHTML = message;
        alertModal.show();
    }
    
    // --- Real-time Character Counter Function ---
    function updateCharCounter() {
        const currentLength = contentInput.value.length;
        charCounter.textContent = `${currentLength} / ${MAX_CONTENT_LENGTH}`;
        
        // Change color if minimum not met or maximum exceeded
        if (currentLength < MIN_CONTENT_LENGTH || currentLength > MAX_CONTENT_LENGTH) {
            charCounter.classList.add('char-error');
        } else {
            charCounter.classList.remove('char-error');
        }
    }
    
    // Attach the counter update listener
    contentInput.addEventListener('input', updateCharCounter);
    
    // --- Utility Functions ---
    function containsForbiddenContent(text) {
        const normalizedText = text.toLowerCase();
        for (const word of FORBIDDEN_WORDS) {
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            if (regex.test(normalizedText)) {
                return true;
            }
        }
        return false;
    }
    
    function loadPosts() { 
        const storedPosts = localStorage.getItem(STORAGE_KEY);
        if (storedPosts) {
            return JSON.parse(storedPosts);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPosts));
        return initialPosts;
    }

    function savePosts(posts) { 
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    }
    
    function formatPostTime(timestamp) {
        const now = new Date();
        const postDate = new Date(timestamp);
        const diffInSeconds = Math.floor((now - postDate) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } 
        if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } 
        if (diffInSeconds < 604800) {
             const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } 
        return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    // --- Rendering and Deletion Logic ---
    function renderPosts() {
        feedList.innerHTML = '';
        const posts = loadPosts().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        posts.forEach(post => {
            const timeAgo = formatPostTime(post.timestamp);
            let tagClass, itemClass, tagText;

            switch (post.category) {
                case 'danger': tagClass = 'bg-danger'; itemClass = 'post-danger'; tagText = 'BREACH ALERT'; break;
                case 'tip': tagClass = 'bg-success'; itemClass = 'post-tip'; tagText = 'SECURITY TIP'; break;
                default: tagClass = 'bg-info'; itemClass = 'post-question'; tagText = 'GENERAL QUERY'; break;
            }

            const canDelete = post.userSessionId === currentUserSessionId;

            const deleteButtonHtml = canDelete ? `
                <button type="button" class="btn btn-sm btn-danger delete-post-btn" data-post-id="${post.id}" title="Delete Your Post">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path d="M14.5 3a1 1 0 0 1-1 1H13V9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4H1.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H4a.5.5 0 0 1 .5-.5h7A.5.5 0 0 1 12 1h2.5a1 1 0 0 1 1 1v1zM4.118 4h7.764L13 13H3L4.118 4zM2.5 3V2h11v1h-11z"/>
                    </svg>
                </button>
            ` : '';
            
            const postElement = document.createElement('div');
            postElement.className = `card post-item ${itemClass} p-3 shadow`;
            postElement.setAttribute('data-post-id', post.id);

            postElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <span class="post-tag badge ${tagClass} text-uppercase fw-bold">${tagText}</span>
                    ${deleteButtonHtml} 
                </div>
                <h4 class="h5 fw-bold mt-2">${post.title}</h4>
                <p class="post-text mb-2">${post.content}</p>
                <div class="d-flex justify-content-between align-items-center post-meta">
                    <span class="text-white-50">Posted by: <strong class="text-info-neon">Guardian#${post.guardianId}</strong></span>
                    <span class="text-white-50">${timeAgo}</span>
                </div>
            `;
            
            feedList.appendChild(postElement);
        });

        attachDeleteListeners();
    }

    function deletePost(id) {
        let posts = loadPosts();
        posts = posts.filter(post => post.id !== id);
        
        savePosts(posts);
        renderPosts();
        
        showCustomAlert('Post Deleted', 'Your post was successfully removed from the feed.', true);
    }

    function attachDeleteListeners() {
        document.querySelectorAll('.delete-post-btn').forEach(button => {
            button.onclick = function() {
                postToDeleteId = this.getAttribute('data-post-id');
                deleteModal.show();
            };
        });
    }

    // --- Main Event Listener: Form Submission ---
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const title = document.getElementById('post-title').value.trim();
        const content = contentInput.value.trim(); // Use the trimmed value
        const category = document.getElementById('post-category').value;
        const categoryText = form.querySelector(`#post-category option[value="${category}"]`).textContent;

        if (title === '' || content === '') {
            showCustomAlert("Input Required", "Please fill out both the title and the details before posting.");
            return;
        }

        // --- FRIENDLY POST FILTERS ---
        if (containsForbiddenContent(title) || containsForbiddenContent(content)) {
            showCustomAlert(
                "🚫 Content Violation", 
                "Your post contains language that violates the Friendly Posts guidelines. Please revise and remove profanity or spam content."
            );
            return;
        }

        if (content.length < MIN_CONTENT_LENGTH || content.length > MAX_CONTENT_LENGTH) {
            showCustomAlert(
                "📝 Length Restriction", 
                `Details must be between ${MIN_CONTENT_LENGTH} and ${MAX_CONTENT_LENGTH} characters long to ensure thoughtful discussion.`
            );
            return;
        }
        // --- END FILTERS ---

        // Store the data temporarily and show confirmation modal
        currentPostData = {
            title: title,
            content: content,
            category: category
        };

        document.getElementById('confirm-title').textContent = currentPostData.title;
        document.getElementById('confirm-content').textContent = currentPostData.content;
        document.getElementById('confirm-category').textContent = categoryText;

        confirmModal.show();
    });

    // 2. Handle the final "Confirm & Post" button click
    finalSubmitBtn.addEventListener('click', () => {
        confirmModal.hide(); 

        if (currentPostData.title && currentPostData.content) {
            const newPost = {
                id: `user-${Date.now()}`,
                title: currentPostData.title,
                content: currentPostData.content,
                guardianId: String(Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000),
                category: currentPostData.category,
                timestamp: new Date().toISOString(),
                userSessionId: currentUserSessionId 
            };
            
            const posts = loadPosts();
            posts.push(newPost);
            savePosts(posts);
            renderPosts();
            
            form.reset();
            currentPostData = {};
            updateCharCounter(); // Reset counter after successful post

            showCustomAlert(
                "Post Successful", 
                "Your anonymous post has been successfully submitted to the feed!",
                true
            );
        }
    });

    // 3. Handle the final "Delete Post" button click
    finalDeleteBtn.addEventListener('click', () => {
        if (postToDeleteId) {
            deleteModal.hide(); 
            deletePost(postToDeleteId);
            postToDeleteId = null;
        }
    });
    
    // Initial calls
    renderPosts();
    updateCharCounter(); // Set initial counter state
});