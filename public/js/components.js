/* ============================================
   COMPONENTS — Toast, Skeleton, Share, Navbar
   ============================================ */

const Components = {
    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - 'success' | 'error' | 'warning' | 'info'
     * @param {number} duration - Time in ms before auto-dismiss
     */
    showToast(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toastContainer');
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.position = 'relative';
        toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${Utils.escapeHtml(message)}</span>
      <button class="toast-close" onclick="this.closest('.toast').remove()">✕</button>
      <div class="toast-progress" style="width: 100%;"></div>
    `;

        container.appendChild(toast);

        // Animate progress bar
        const progress = toast.querySelector('.toast-progress');
        progress.style.transition = `width ${duration}ms linear`;
        requestAnimationFrame(() => {
            progress.style.width = '0%';
        });

        // Auto-remove
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    /**
     * Render skeleton card loaders
     */
    renderSkeletonCards(count = 6) {
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
        <div class="skeleton-card">
          <div class="skeleton skeleton-image"></div>
          <div class="skeleton-body">
            <div class="skeleton skeleton-text-sm" style="width: 40%"></div>
            <div class="skeleton skeleton-text-lg"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width: 75%"></div>
            <div style="display:flex; align-items:center; gap:8px; margin-top:12px">
              <div class="skeleton skeleton-avatar"></div>
              <div class="skeleton skeleton-text-sm" style="width: 30%; margin-bottom:0"></div>
            </div>
          </div>
        </div>
      `;
        }
        return html;
    },

    /**
     * Render a single blog card
     */
    renderBlogCard(post) {
        const authorInitial = Utils.getInitials(post.author?.username);
        const date = Utils.formatDate(post.createdAt);
        const hasImage = post.coverImage && post.coverImage.length > 0;
        const gradient = Utils.getPlaceholderImage(post.title);

        return `
      <article class="card fade-in-up" data-post-slug="${post.slug}">
        <div class="card-image-wrapper">
          ${hasImage
                ? `<img class="card-image" data-src="${post.coverImage}" alt="${Utils.escapeHtml(post.title)}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 220'%3E%3C/svg%3E" />`
                : `<div class="card-image" style="background: ${gradient}"></div>`}
          <span class="card-category">${Utils.escapeHtml(post.category || 'General')}</span>
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span class="card-meta-item">📅 ${date}</span>
            <span class="card-meta-item">📖 ${post.readTime || 1} min read</span>
          </div>
          <h3 class="card-title" onclick="App.navigate('/post/${post.slug}')">${Utils.escapeHtml(post.title)}</h3>
          <p class="card-excerpt">${Utils.escapeHtml(Utils.stripHtml(post.excerpt || post.content || ''))}</p>
          <div class="card-footer">
            <div class="card-author" onclick="App.navigate('/profile/${post.author?.username}')">
              <div class="card-author-avatar">${authorInitial}</div>
              <span>${Utils.escapeHtml(post.author?.username || 'Anonymous')}</span>
            </div>
            <div class="card-actions">
              <button class="card-action-btn ${post.likes?.includes(App.currentUser?._id) ? 'liked' : ''}"
                onclick="event.stopPropagation(); Blog.toggleLike('${post._id}', this)">
                ♥ <span>${post.likes?.length || 0}</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
    },

    /**
     * Render share buttons for a post
     */
    renderShareButtons(post) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(post.title);

        return `
      <div class="share-buttons">
        <button class="share-btn twitter" onclick="window.open('https://twitter.com/intent/tweet?text=${title}&url=${url}', '_blank')">
          𝕏 Share
        </button>
        <button class="share-btn linkedin" onclick="window.open('https://www.linkedin.com/sharing/share-offsite/?url=${url}', '_blank')">
          in Share
        </button>
        <button class="share-btn copy" onclick="Components.copyLink()">
          📋 Copy Link
        </button>
      </div>
    `;
    },

    /**
     * Copy current page link to clipboard
     */
    async copyLink() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            this.showToast('Link copied to clipboard!', 'success');
        } catch {
            this.showToast('Failed to copy link', 'error');
        }
    },

    /**
     * Initialize the sticky navbar scroll behavior
     */
    initNavbar() {
        const navbar = document.getElementById('navbar');
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');

        // Scroll effect
        window.addEventListener('scroll', Utils.throttle(() => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, 100));

        // Mobile menu toggle
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('open');
        });

        // Close mobile menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('open');
            });
        });
    },

    /**
     * Initialize scroll-to-top button
     */
    initScrollTop() {
        const btn = document.getElementById('scrollTop');
        window.addEventListener('scroll', Utils.throttle(() => {
            if (window.scrollY > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }, 100));

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },

    /**
     * Reading progress bar
     */
    updateReadingProgress() {
        const bar = document.getElementById('readingProgress');
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = `${Math.min(progress, 100)}%`;
    },

    /**
     * Initialize newsletter form handlers
     */
    initNewsletter() {
        const form = document.getElementById('footerNewsletter');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = form.querySelector('input[type="email"]').value;
                try {
                    await API.subscribe(email);
                    this.showToast('Subscribed successfully! 🎉', 'success');
                    form.reset();
                } catch (error) {
                    this.showToast(error.message, 'error');
                }
            });
        }
    },

    /**
     * Update navbar based on auth state
     */
    updateNavAuth(user) {
        const navAuth = document.getElementById('navAuth');
        const navUser = document.getElementById('navUser');
        const navCreate = document.getElementById('navCreate');
        const navAvatar = document.getElementById('navAvatar');
        const navLinks = document.getElementById('navLinks');

        // Remove any existing mobile auth links
        navLinks.querySelectorAll('.mobile-auth-link').forEach(el => el.remove());

        if (user) {
            navAuth.classList.add('hidden');
            navUser.classList.remove('hidden');
            navCreate.classList.remove('hidden');
            navAvatar.textContent = Utils.getInitials(user.username);
            navAvatar.href = `/profile/${user.username}`;

            // Add mobile-only logout link to dropdown
            const logoutLink = document.createElement('a');
            logoutLink.className = 'mobile-auth-link';
            logoutLink.href = '#';
            logoutLink.textContent = 'Logout';
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                App.logout();
                document.getElementById('menuToggle').classList.remove('active');
                navLinks.classList.remove('open');
            });
            navLinks.appendChild(logoutLink);
        } else {
            navAuth.classList.remove('hidden');
            navUser.classList.add('hidden');
            navCreate.classList.add('hidden');

            // Add mobile-only login/signup links to dropdown
            const loginLink = document.createElement('a');
            loginLink.className = 'mobile-auth-link';
            loginLink.setAttribute('data-link', '');
            loginLink.href = '/login';
            loginLink.textContent = 'Log In';
            loginLink.addEventListener('click', () => {
                document.getElementById('menuToggle').classList.remove('active');
                navLinks.classList.remove('open');
            });

            const signupLink = document.createElement('a');
            signupLink.className = 'mobile-auth-link';
            signupLink.setAttribute('data-link', '');
            signupLink.href = '/register';
            signupLink.textContent = 'Sign Up';
            signupLink.addEventListener('click', () => {
                document.getElementById('menuToggle').classList.remove('active');
                navLinks.classList.remove('open');
            });

            navLinks.appendChild(loginLink);
            navLinks.appendChild(signupLink);
        }
    },

    /**
     * Set active nav link
     */
    setActiveNavLink(path) {
        const links = document.querySelectorAll('.nav-links a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === path || (path.startsWith(href) && href !== '/')) {
                link.classList.add('active');
            } else if (href === '/' && path === '/') {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },

    /**
     * Render pagination controls
     */
    renderPagination(currentPage, totalPages, onPageChange) {
        if (totalPages <= 1) return '';

        let html = '<div class="pagination">';

        html += `<button class="pagination-btn" ${currentPage <= 1 ? 'disabled' : ''} 
      onclick="${onPageChange}(${currentPage - 1})">←</button>`;

        const start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, currentPage + 2);

        if (start > 1) {
            html += `<button class="pagination-btn" onclick="${onPageChange}(1)">1</button>`;
            if (start > 2) html += `<span class="text-muted">…</span>`;
        }

        for (let i = start; i <= end; i++) {
            html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
        onclick="${onPageChange}(${i})">${i}</button>`;
        }

        if (end < totalPages) {
            if (end < totalPages - 1) html += `<span class="text-muted">…</span>`;
            html += `<button class="pagination-btn" onclick="${onPageChange}(${totalPages})">${totalPages}</button>`;
        }

        html += `<button class="pagination-btn" ${currentPage >= totalPages ? 'disabled' : ''} 
      onclick="${onPageChange}(${currentPage + 1})">→</button>`;

        html += '</div>';
        return html;
    }
};
