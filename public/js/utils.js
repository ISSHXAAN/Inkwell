/* ============================================
   UTILS — Helper Functions
   ============================================ */

const Utils = {
    /**
     * Debounce function — delays execution until pause in calls
     */
    debounce(fn, delay = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    },

    /**
     * Throttle function — limits execution rate
     */
    throttle(fn, limit = 100) {
        let inThrottle = false;
        return (...args) => {
            if (!inThrottle) {
                fn(...args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    },

    /**
     * Format date to readable string
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    /**
     * Time ago format (e.g., "2 hours ago")
     */
    timeAgo(dateStr) {
        const now = new Date();
        const date = new Date(dateStr);
        const seconds = Math.floor((now - date) / 1000);

        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'week', seconds: 604800 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 }
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
            }
        }
        return 'Just now';
    },

    /**
     * Calculate estimated read time
     */
    calculateReadTime(content) {
        const text = content.replace(/<[^>]*>/g, '');
        const words = text.split(/\s+/).filter(w => w.length > 0).length;
        return Math.max(1, Math.ceil(words / 200));
    },

    /**
     * Generate user initials from username
     */
    getInitials(username) {
        if (!username) return '?';
        return username.charAt(0).toUpperCase();
    },

    /**
     * Truncate text
     */
    truncate(text, maxLength = 150) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    },

    /**
     * Strip HTML tags
     */
    stripHtml(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    },

    /**
     * Lazy load images using IntersectionObserver
     */
    initLazyLoad() {
        const images = document.querySelectorAll('img[data-src]');
        if (!images.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.classList.add('fade-in');
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '100px' });

        images.forEach(img => observer.observe(img));
    },

    /**
     * Scroll-triggered fade-in animations
     */
    initScrollAnimations() {
        const elements = document.querySelectorAll('.fade-in-up');
        if (!elements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        elements.forEach(el => observer.observe(el));
    },

    /**
     * Generate a placeholder cover image URL with gradient
     */
    getPlaceholderImage(seed) {
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
            'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
            'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
        ];
        const index = seed ? seed.charCodeAt(0) % gradients.length : 0;
        return gradients[index];
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
