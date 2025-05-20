// Client-side JavaScript for interactive elements
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle (if needed)
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuButton && navLinks) {
        mobileMenuButton.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }
    
    // Any other client-side functionality can be added here
});