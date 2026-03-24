/* ============================================
   APP — SPA Router, Theme Toggle, Init
   ============================================ */

const App = {
    currentUser: null,
    currentPath: '/',

    /**
     * Initialize the application
     */
    async init() {
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);

        // Initialize components
        Components.initNavbar();
        Components.initScrollTop();
        Components.initNewsletter();

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Check auth state
        await this.checkAuth();

        // Handle routing
        this.handleRoute();

        // Listen for popstate (browser back/forward)
        window.addEventListener('popstate', () => this.handleRoute());

        // Listen for link clicks (SPA navigation)
        this.bindLinks();
    },

    /**
     * Bind all data-link elements for SPA navigation
     */
    bindLinks() {
        document.querySelectorAll('[data-link]').forEach(link => {
            // Don't re-bind
            if (link.dataset.bound) return;
            link.dataset.bound = 'true';

            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href && href !== this.currentPath) {
                    this.navigate(href);
                }
            });
        });
    },

    /**
     * Navigate to a path
     */
    navigate(path) {
        window.history.pushState({}, '', path);
        this.handleRoute();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    /**
     * Handle the current route
     */
    async handleRoute() {
        const path = window.location.pathname;
        this.currentPath = path;
        const app = document.getElementById('app');

        // Reset reading progress
        document.getElementById('readingProgress').style.width = '0';

        // Set active nav link
        Components.setActiveNavLink(path);

        // Route matching
        if (path === '/' || path === '') {
            app.innerHTML = await Blog.renderHome();
            Blog.initHome();
        } else if (path === '/blog') {
            Blog.currentPage = 1;
            Blog.currentCategory = '';
            Blog.currentSearch = '';
            // Check for tag query param
            const urlParams = new URLSearchParams(window.location.search);
            Blog.currentTag = urlParams.get('tag') || '';
            app.innerHTML = Blog.renderBlogListing();
            Blog.initBlogListing();
        } else if (path === '/login') {
            if (this.currentUser) {
                this.navigate('/');
                return;
            }
            app.innerHTML = Auth.renderLogin();
            Auth.initLogin();
            this.bindLinks();
        } else if (path === '/register') {
            if (this.currentUser) {
                this.navigate('/');
                return;
            }
            app.innerHTML = Auth.renderRegister();
            Auth.initRegister();
            this.bindLinks();
        } else if (path === '/create') {
            if (!this.currentUser) {
                Components.showToast('Please log in to write posts', 'warning');
                this.navigate('/login');
                return;
            }
            app.innerHTML = Editor.renderEditor();
            Editor.initEditor();
        } else if (path.startsWith('/edit/')) {
            if (!this.currentUser) {
                this.navigate('/login');
                return;
            }
            const postId = path.split('/edit/')[1];
            app.innerHTML = Editor.renderEditor(postId);
            Editor.initEditor(postId);
        } else if (path.startsWith('/post/')) {
            const slug = path.split('/post/')[1];
            app.innerHTML = Post.renderPost(slug);
            Post.initPost(slug);
        } else if (path.startsWith('/profile/')) {
            const username = path.split('/profile/')[1];
            app.innerHTML = Profile.renderProfile(username);
            Profile.initProfile(username);
        } else if (path === '/profile') {
            if (this.currentUser) {
                this.navigate(`/profile/${this.currentUser.username}`);
            } else {
                this.navigate('/login');
            }
        } else {
            app.innerHTML = this.render404();
            this.bindLinks();
        }
    },

    /**
     * Check if user is authenticated
     */
    async checkAuth() {
        try {
            const user = await API.getMe();
            this.currentUser = user;
            Components.updateNavAuth(user);
        } catch {
            this.currentUser = null;
            Components.updateNavAuth(null);
        }
    },

    /**
     * Toggle theme
     */
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        this.updateThemeIcon(next);
    },

    /**
     * Update theme toggle icon
     */
    updateThemeIcon(theme) {
        const btn = document.getElementById('themeToggle');
        btn.textContent = theme === 'dark' ? '🌙' : '☀️';
    },

    /**
     * Logout
     */
    async logout() {
        try {
            await API.logout();
            this.currentUser = null;
            Components.updateNavAuth(null);
            Components.showToast('Logged out successfully', 'success');
            this.navigate('/');
        } catch {
            Components.showToast('Logout failed', 'error');
        }
    },

    /**
     * Render 404 page
     */
    render404() {
        return `
      <div class="page-spacer"></div>
      <div class="page-404 page-transition">
        <div>
          <div class="page-404-number">404</div>
          <h2>Page Not Found</h2>
          <p>Oops! The page you're looking for seems to have vanished into thin air.</p>
          <a data-link href="/" class="btn btn-primary">← Back to Home</a>
        </div>
      </div>
    `;
    }
};

// ============================================
// BOOT THE APP
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
