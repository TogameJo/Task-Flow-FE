// Utility functions
const utils = {
    lockScroll: () => document.body.style.overflow = 'hidden',
    unlockScroll: () => document.body.style.overflow = 'auto',
    
    addEscapeListener: (callback) => {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') callback();
        });
    }
};

// ReadMore Popup Handler
class ReadMorePopup {
    constructor() {
        this.popup = document.getElementById('readMorePopup');
        this.readMoreBtn = document.querySelector('.about-btn a');
        this.closeBtn = this.popup.querySelector('.readmore-close');
        
        this.init();
    }
    
    init() {
        this.readMoreBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.show();
        });
        
        this.closeBtn?.addEventListener('click', () => this.close());
        
        this.popup?.addEventListener('click', (e) => {
            if (e.target === this.popup) this.close();
        });
        
        utils.addEscapeListener(() => this.close());
    }
    
    show() {
        this.popup.classList.add('show');
        utils.lockScroll();
        
        const gridItems = this.popup.querySelectorAll('.grid-item');
        gridItems.forEach((item, index) => {
            item.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
        });
        
        const statItems = this.popup.querySelectorAll('.stat-item');
        statItems.forEach((item, index) => {
            item.style.animation = `fadeInUp 0.5s ease forwards ${(index * 0.1) + 0.4}s`;
        });
    }
    
    close() {
        this.popup.classList.add('closing');
        
        setTimeout(() => {
            this.popup.classList.remove('show', 'closing');
            utils.unlockScroll();
            
            const animatedElements = this.popup.querySelectorAll('.grid-item, .stat-item');
            animatedElements.forEach(el => {
                el.style.animation = 'none';
            });
        }, 300);
    }
}

// Hero Icons Popup Handler
class HeroPopup {
    constructor() {
        this.popups = ['schedule', 'worksheet', 'jobConfirmations', 'security', 'comments'];
        this.currentIndex = 0;
        this.init();
    }
    
    init() {
        // Icon click handlers
        document.querySelectorAll('.icon_introduce, .comment').forEach((icon, index) => {
            icon.addEventListener('click', () => {
                this.currentIndex = index;
                this.showPopup(`${this.popups[index]}Popup`);
                this.updateNavigation();
            });
        });
        
        // Close button handlers
        document.querySelectorAll('.popup .close-popup').forEach(btn => {
            btn.addEventListener('click', () => this.hideAllPopups());
        });
        
        // Navigation handlers
        document.querySelectorAll('.popup-nav').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const direction = e.currentTarget.classList.contains('prev') ? -1 : 1;
                this.navigate(direction);
            });
        });
        
        // Outside click handler
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('popup')) this.hideAllPopups();
        });
        
        utils.addEscapeListener(() => this.hideAllPopups());
    }
    
    showPopup(popupId) {
        this.hideAllPopups();
        const popup = document.getElementById(popupId);
        if (popup) {
            popup.style.display = 'block';
            utils.lockScroll();
        }
    }
    
    hideAllPopups() {
        document.querySelectorAll('.popup').forEach(popup => {
            popup.style.display = 'none';
        });
        utils.unlockScroll();
    }
    
    navigate(direction) {
        this.currentIndex = (this.currentIndex + direction + this.popups.length) % this.popups.length;
        this.showPopup(`${this.popups[this.currentIndex]}Popup`);
        this.updateNavigation();
    }
    
    updateNavigation() {
        document.querySelectorAll('.popup').forEach(popup => {
            const prevBtn = popup.querySelector('.prev');
            const nextBtn = popup.querySelector('.next');
            
            if (prevBtn) prevBtn.disabled = this.currentIndex === 0;
            if (nextBtn) nextBtn.disabled = this.currentIndex === this.popups.length - 1;
        });
    }
}

// Feedback Carousel Handler
class FeedbackCarousel {
    constructor() {
        this.feedbacks = document.querySelectorAll('.feed-list');
        this.prevBtn = document.querySelector('.control-btn:first-child');
        this.nextBtn = document.querySelector('.control-btn:last-child');
        this.currentPage = 0;
        this.itemsPerPage = 3;
        this.totalPages = Math.ceil(this.feedbacks.length / this.itemsPerPage);
        
        this.init();
    }
    
    init() {
        this.prevBtn?.addEventListener('click', () => this.navigate(-1));
        this.nextBtn?.addEventListener('click', () => this.navigate(1));
        
        this.showFeedbacks(0);
        this.updateButtons();
    }
    
    showFeedbacks(page) {
        this.feedbacks.forEach(feedback => {
            feedback.classList.add('hidden');
            feedback.classList.remove('active');
        });
        
        for(let i = page * this.itemsPerPage; 
            i < (page + 1) * this.itemsPerPage && i < this.feedbacks.length; 
            i++) {
            this.feedbacks[i].classList.remove('hidden');
            this.feedbacks[i].classList.add('active');
        }
    }
    
    navigate(direction) {
        const newPage = this.currentPage + direction;
        if (newPage >= 0 && newPage < this.totalPages) {
            this.currentPage = newPage;
            this.showFeedbacks(this.currentPage);
            this.updateButtons();
        }
    }
    
    updateButtons() {
        if (this.prevBtn) this.prevBtn.style.opacity = this.currentPage === 0 ? '0.5' : '1';
        if (this.nextBtn) this.nextBtn.style.opacity = this.currentPage === this.totalPages - 1 ? '0.5' : '1';
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ReadMorePopup();
    new HeroPopup();
    new FeedbackCarousel();
});
// email popup
class SubscribeHandler {
    constructor() {
        this.form = document.getElementById('subscribeForm');
        this.popup = document.getElementById('subscribePopup');
        this.closeBtn = this.popup.querySelector('.subscribe-close');
        
        this.init();
    }
    
    init() {
        // Xử lý submit form
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Xử lý đóng popup
        this.closeBtn.addEventListener('click', () => this.closePopup());
        this.popup.addEventListener('click', (e) => {
            if (e.target === this.popup) this.closePopup();
        });
    }
    
    handleSubmit() {
        const email = this.form.querySelector('input[type="email"]').value;
        
        // Ở đây bạn có thể thêm code để gửi email đến server
        console.log('Email submitted:', email);
        
        // Reset form
        this.form.reset();
        
        // Hiển thị popup
        this.showPopup();
    }
    
    showPopup() {
        this.popup.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    closePopup() {
        this.popup.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Khởi tạo khi trang load xong
document.addEventListener('DOMContentLoaded', () => {
    new SubscribeHandler();
});
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