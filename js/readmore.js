// Thêm vào cuối file home.js
function showReadMorePopup() {
    const popup = document.getElementById('readMorePopup');
    popup.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when popup is open
}

function closeReadMorePopup() {
    const popup = document.getElementById('readMorePopup');
    popup.classList.remove('show');
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    const readMoreBtn = document.querySelector('.about-btn a');
    const closeBtn = document.querySelector('.close-popup');
    
    readMoreBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showReadMorePopup();
    });
    
    closeBtn.addEventListener('click', closeReadMorePopup);
    
    // Close popup when clicking outside
    document.getElementById('readMorePopup').addEventListener('click', function(e) {
        if (e.target === this) {
            closeReadMorePopup();
        }
    });
    
    // Close popup with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeReadMorePopup();
        }
    });
});
// Thêm vào cuối file sign-up.js
document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const termsLink = document.querySelector('a[href="#"][target="_blank"]');
    const privacyLink = document.querySelectorAll('a[href="#"][target="_blank"]')[1];
    const termsPopup = document.getElementById('termsPopup');
    const privacyPopup = document.getElementById('privacyPopup');
    const closeButtons = document.querySelectorAll('.close-policy');

    // Show Terms & Conditions
    termsLink.addEventListener('click', function(e) {
        e.preventDefault();
        termsPopup.classList.add('show');
        document.body.style.overflow = 'hidden';
    });

    // Show Privacy Policy
    privacyLink.addEventListener('click', function(e) {
        e.preventDefault();
        privacyPopup.classList.add('show');
        document.body.style.overflow = 'hidden';
    });

    // Close popups
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            termsPopup.classList.remove('show');
            privacyPopup.classList.remove('show');
            document.body.style.overflow = 'auto';
        });
    });

    // Close on outside click
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('policy-popup')) {
            e.target.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            termsPopup.classList.remove('show');
            privacyPopup.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    });
});