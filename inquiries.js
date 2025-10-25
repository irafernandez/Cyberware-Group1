document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('inquiry-form');
    // Define the official inquiry email address
    const TARGET_EMAIL = 'press@cyberguardian.com'; // Placeholder/Example email

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent standard form submission

        // 1. Get user input values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const body = document.getElementById('body').value;

        // 2. Format the email body content
        const emailBody = `
Dear Cyber Guardian Press Team,

I am writing to you regarding the following inquiry:

---
Inquiry Details:
${body}
---

Sender Details:
Name/Organization: ${name}
Return Email: ${email}
        `;
        
        // 3. Encode values for the mailto URL
        const encodedSubject = encodeURIComponent(`[PRESS INQUIRY] ${subject}`);
        const encodedBody = encodeURIComponent(emailBody);

        // 4. Construct the final mailto URL
        const mailtoLink = `mailto:${TARGET_EMAIL}?subject=${encodedSubject}&body=${encodedBody}`;

        // 5. Open the user's default email client
        window.location.href = mailtoLink;

        // Optional: Provide quick feedback
        alert("Your email client is now opening with the drafted inquiry. Please review and send!");
    });
});