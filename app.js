document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('waitlist-form');
    const formContainer = document.getElementById('waitlist-form-container');
    const successContainer = document.getElementById('waitlist-success-container');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Stop the default browser form submission

        // In a real application, you would send this email (and perhaps name) 
        // to a server endpoint (like a database or mailing list service) here.
        
        // For this assignment, we focus on the visual user feedback:
        
        // 1. Get the email (optional, but good practice)
        const userEmail = document.getElementById('waitlist-email').value;
        console.log(`Waitlist signup simulated for: ${userEmail}`);
        
        // 2. Hide the form container
        formContainer.classList.add('d-none');
        
        // 3. Show the success confirmation panel
        successContainer.classList.remove('d-none');
        
        // Optional: Smooth scroll up to the confirmation message
        successContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});