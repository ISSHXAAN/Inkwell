/* ============================================
   BLOG — Blog Listing, Filters, Search
   ============================================ */

const Blog = {
  currentPage: 1,
  currentCategory: '',
  currentSearch: '',
  currentTag: '',

  /**
   * Render home page with hero + featured + latest
   */
  async renderHome() {
    const particles = Array.from({ length: 8 }, () => '<div class="hero-particle"></div>').join('');

    let html = `
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-particles">${particles}</div>
        <div class="hero-content">
          <div class="hero-badge"> A platform for creative minds</div>
          <h1>Where Ideas Come to Life</h1>
          <p>Share your stories, and connect with a community of passionate writers.</p>
          <div class="hero-actions">
            <a data-link href="/blog" class="btn btn-primary">Explore Articles</a>
            <a data-link href="/register" class="btn btn-ghost">Start Writing</a>
          </div>
        </div>
        <div class="hero-divider">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path fill="var(--color-bg-primary)" d="M0,40 C360,80 720,0 1440,40 L1440,80 L0,80 Z"></path>
          </svg>
        </div>
      </section>

      <!-- Featured Posts -->
      <section class="section">
        <div class="container">
          <div class="text-center fade-in-up">
            <h2 class="section-title">Featured Stories</h2>
            <p class="section-subtitle">Handpicked articles from our best writers</p>
          </div>
          <div id="featuredPosts" class="featured-section">
            <div class="spinner"></div>
          </div>
        </div>
      </section>

      <!-- Latest Posts -->
      <section class="section" style="padding-top: 0">
        <div class="container">
          <div class="flex justify-between items-center flex-wrap gap-lg fade-in-up" style="margin-bottom: var(--space-2xl)">
            <div>
              <h2 class="section-title">Latest Articles</h2>
              <p class="section-subtitle" style="margin-bottom: 0">Fresh perspectives and insights</p>
            </div>
            <a data-link href="/blog" class="btn btn-secondary">View All →</a>
          </div>
          <div id="latestPosts" class="blog-grid stagger-children">
            ${Components.renderSkeletonCards(6)}
          </div>
        </div>
      </section>

      <!-- Newsletter -->
      <section class="section" style="padding-top: 0">
        <div class="container">
          <div class="newsletter fade-in-up">
            <h3>Stay in the Loop</h3>
            <p>Subscribe to our newsletter and never miss a new article. We promise no spam — just great content.</p>
            <form class="newsletter-form" id="newsletterForm">
              <input type="email" class="form-input" placeholder="Enter your email address" required />
              <button type="submit" class="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    `;

    return html;
  },

  /**
   * Initialize home page data loading
   */
  async initHome() {
    // Load featured posts
    try {
      const featured = await API.getFeaturedPosts();
      const container = document.getElementById('featuredPosts');

      if (featured.length > 0) {
        const post = featured[0];
        const gradient = Utils.getPlaceholderImage(post.title);
        const hasImage = post.coverImage && post.coverImage.length > 0;

        container.innerHTML = `
          <div class="featured-post fade-in-up" onclick="App.navigate('/post/${post.slug}')">
            <div class="featured-post-bg" style="${hasImage ? `background-image: url(${post.coverImage})` : `background: ${gradient}`}"></div>
            <div class="featured-post-overlay"></div>
            <div class="featured-post-content">
              <span class="card-category">${Utils.escapeHtml(post.category || 'General')}</span>
              <h2>${Utils.escapeHtml(post.title)}</h2>
              <p>${Utils.escapeHtml(Utils.stripHtml(post.excerpt || ''))}</p>
              <div class="card-meta" style="color: rgba(255,255,255,0.6); margin-top: 12px;">
                <span class="card-meta-item">By ${Utils.escapeHtml(post.author?.username || 'Anonymous')}</span>
                <span class="card-meta-item">📖 ${post.readTime || 1} min read</span>
                <span class="card-meta-item">📅 ${Utils.formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="featured-post" style="background: linear-gradient(135deg, #667eea, #764ba2); min-height: 300px; align-items: center; justify-content: center; display: flex; cursor: default;">
            <div class="featured-post-content" style="text-align: center;">
              <h2 style="color: white;">No Featured Posts Yet</h2>
              <p style="color: rgba(255,255,255,0.7);">Be the first to write a featured article!</p>
            </div>
          </div>
        `;
      }
    } catch {
      document.getElementById('featuredPosts').innerHTML = '';
    }

    // Load latest posts
    try {
      const data = await API.getPosts({ limit: 6 });
      const container = document.getElementById('latestPosts');

      if (data.posts.length > 0) {
        container.innerHTML = data.posts.map(p => Components.renderBlogCard(p)).join('');
      } else {
        container.innerHTML = `
          <div class="empty-state" style="grid-column: 1/-1">
            <div class="empty-state-icon">📝</div>
            <h3>No Posts Yet</h3>
            <p>Be the first to share your thoughts!</p>
            <a data-link href="/create" class="btn btn-primary">Write a Post</a>
          </div>
        `;
      }
    } catch {
      document.getElementById('latestPosts').innerHTML = '<p class="text-center text-muted">Could not load posts.</p>';
    }

    // Init
    Utils.initScrollAnimations();
    Utils.initLazyLoad();
    this.initHomeNewsletter();
    App.bindLinks();
  },

  /**
   * Newsletter form on home page
   */
  initHomeNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value;
      try {
        await API.subscribe(email);
        Components.showToast('Subscribed successfully! 🎉', 'success');
        form.reset();
      } catch (error) {
        Components.showToast(error.message, 'error');
      }
    });
  },

  /**
   * Render blog listing page
   */
  renderBlogListing() {
    return `
      <div class="page-spacer"></div>
      <div class="blog-listing page-transition">
        <div class="container">
          <div class="blog-listing-header">
            <div>
              <h1 class="section-title">All Articles</h1>
              <p class="text-muted">Browse through our collection of articles</p>
            </div>
            <div class="search-bar">
              <span class="search-bar-icon">🔍</span>
              <input type="text" class="form-input" id="blogSearch" placeholder="Search articles..." value="${Utils.escapeHtml(this.currentSearch)}" />
            </div>
          </div>

          <div class="blog-filters" id="blogFilters">
            <span class="tag ${!this.currentCategory ? 'active' : ''}" data-category="">All</span>
          </div>

          <div id="blogGrid" class="blog-grid" style="margin-top: var(--space-xl)">
            ${Components.renderSkeletonCards(6)}
          </div>

          <div id="blogPagination"></div>
        </div>
      </div>
    `;
  },

  /**
   * Initialize blog listing page
   */
  async initBlogListing() {
    // Load categories for filter
    try {
      const categories = await API.getCategories();
      const filtersEl = document.getElementById('blogFilters');
      const defaultCategories = ['Technology', 'Design', 'Lifestyle', 'Travel', 'Programming'];
      const allCats = categories.length > 0
        ? categories.map(c => c.name)
        : defaultCategories;

      filtersEl.innerHTML = `
        <span class="tag ${!this.currentCategory ? 'active' : ''}" data-category="" onclick="Blog.filterByCategory('')">All</span>
        ${allCats.map(cat => `
          <span class="tag ${this.currentCategory === cat ? 'active' : ''}" data-category="${cat}" onclick="Blog.filterByCategory('${cat}')">${Utils.escapeHtml(cat)}</span>
        `).join('')}
      `;
    } catch { /* use defaults */ }

    // Search handler
    const searchInput = document.getElementById('blogSearch');
    searchInput.addEventListener('input', Utils.debounce(() => {
      this.currentSearch = searchInput.value;
      this.currentPage = 1;
      this.loadPosts();
    }, 400));

    // Load posts
    await this.loadPosts();
  },

  /**
   * Load posts with current filters
   */
  async loadPosts() {
    const grid = document.getElementById('blogGrid');
    grid.innerHTML = Components.renderSkeletonCards(6);

    try {
      const params = { page: this.currentPage, limit: 9 };
      if (this.currentCategory) params.category = this.currentCategory;
      if (this.currentSearch) params.search = this.currentSearch;
      if (this.currentTag) params.tag = this.currentTag;

      const data = await API.getPosts(params);

      if (data.posts.length > 0) {
        grid.innerHTML = data.posts.map(p => Components.renderBlogCard(p)).join('');

        // Pagination
        const pagEl = document.getElementById('blogPagination');
        pagEl.innerHTML = Components.renderPagination(data.page, data.pages, 'Blog.goToPage');
      } else {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column: 1/-1">
            <div class="empty-state-icon">🔍</div>
            <h3>No Posts Found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        `;
        document.getElementById('blogPagination').innerHTML = '';
      }

      Utils.initScrollAnimations();
      Utils.initLazyLoad();
      App.bindLinks();
    } catch (error) {
      grid.innerHTML = '<p class="text-center text-muted">Failed to load posts.</p>';
    }
  },

  /**
   * Filter by category
   */
  filterByCategory(category) {
    this.currentCategory = category;
    this.currentPage = 1;

    // Update active tag visually
    document.querySelectorAll('#blogFilters .tag').forEach(tag => {
      tag.classList.toggle('active', tag.dataset.category === category);
    });

    this.loadPosts();
  },

  /**
   * Go to specific page
   */
  goToPage(page) {
    this.currentPage = page;
    this.loadPosts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /**
   * Toggle like on a post
   */
  async toggleLike(postId, btn) {
    if (!App.currentUser) {
      Components.showToast('Please log in to like posts', 'warning');
      return;
    }

    try {
      const result = await API.toggleLike(postId);
      btn.classList.toggle('liked', result.liked);
      btn.querySelector('span').textContent = result.likes;
    } catch (error) {
      Components.showToast(error.message, 'error');
    }
  }
};
