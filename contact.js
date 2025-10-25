document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    // Set a central, official email address for general contact
    const TARGET_EMAIL = 'support@cyberguardian.com'; 

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent standard form submission

        // 1. Get user input values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        // 2. Format the email body content
        const emailBody = `
Dear Cyber Guardian Support Team,

I am writing regarding a general inquiry:

---
Message:
${message}
---

Sender Details:
Full Name: ${name}
Return Email: ${email}
        `;
        
        // 3. Encode values for the mailto URL
        const encodedSubject = encodeURIComponent(`[GENERAL CONTACT] Message from ${name}`);
        const encodedBody = encodeURIComponent(emailBody);

        // 4. Construct the final mailto URL
        const mailtoLink = `mailto:${TARGET_EMAIL}?subject=${encodedSubject}&body=${encodedBody}`;

        // 5. Open the user's default email client
        window.location.href = mailtoLink;

        // Optional: Provide quick feedback
        alert("Your email client is now opening with the drafted message. Please review and send!");
    });
});