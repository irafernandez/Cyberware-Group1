document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('post-submission-form');
    const modal = new bootstrap.Modal(document.getElementById('confirmPostModal'));
    const finalSubmitBtn = document.getElementById('final-submit-btn');
    const feedList = document.getElementById('community-feed-list');
    
    let currentPostData = {};

    // 1. Intercept the form submission to show the confirmation modal
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Stop the default form submission

        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();

        if (title === '' || content === '') {
            alert("Please fill out both the title and the details before posting.");
            return;
        }

        // Store the data temporarily
        currentPostData = {
            title: title,
            content: content
        };

        // Populate the modal with the post data
        document.getElementById('confirm-title').textContent = currentPostData.title;
        document.getElementById('confirm-content').textContent = currentPostData.content;

        // Show the confirmation modal
        modal.show();
    });

    // 2. Handle the final "Confirm & Post" button click
    finalSubmitBtn.addEventListener('click', () => {
        // Hide the modal immediately
        modal.hide(); 

        // Process the final post creation
        if (currentPostData.title && currentPostData.content) {
            addNewPostToFeed(currentPostData.title, currentPostData.content);
            
            // Clear the form after successful submission
            form.reset();
            currentPostData = {}; // Clear temporary data
        }
    });

    // 3. Function to create and add the new post to the feed
    function addNewPostToFeed(title, content) {
        // Simple function to generate a random Guardian number (e.g., #1000 to #9999)
        const guardianId = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
        
        // Use a generic 'GENERAL QUERY' or add a dropdown category to the form later
        const postType = 'GENERAL QUERY'; 
        const postClass = 'post-question'; // Corresponds to post-item styles in CSS
        
        // Get current time for meta data (e.g., "just now")
        const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const newPostHtml = `
            <div class="card post-item ${postClass} p-3 shadow animate__animated animate__fadeInDown">
                <span class="post-tag badge bg-info text-uppercase fw-bold">${postType}</span>
                <h4 class="h5 fw-bold mt-2">${title}</h4>
                <p class="post-text mb-2">${content}</p>
                <div class="d-flex justify-content-between align-items-center post-meta">
                    <span class="text-white-50">Posted by: <strong class="text-info-neon">Guardian#${guardianId}</strong></span>
                    <span class="text-white-50">Posted ${now} (Just now)</span>
                </div>
            </div>
        `;

        // Insert the new post at the very top of the feed list
        feedList.insertAdjacentHTML('afterbegin', newPostHtml);
    }
});