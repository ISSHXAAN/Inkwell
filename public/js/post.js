/* ============================================
   POST — Single Post View, TOC, Comments
   ============================================ */

const Post = {
    currentPost: null,

    /**
     * Render single post page (initially loading state)
     */
    renderPost(slug) {
        return `
      <div class="page-spacer"></div>
      <div class="single-post page-transition">
        <div class="container" id="postContainer">
          <div class="container-narrow">
            <div class="skeleton skeleton-text-lg" style="width:40%;margin:0 auto var(--space-lg)"></div>
            <div class="skeleton skeleton-text-lg" style="width:80%;margin:0 auto;height:40px"></div>
            <div style="height:var(--space-lg)"></div>
            <div class="skeleton" style="width:100%;height:350px;border-radius:var(--radius-xl)"></div>
            <div style="height:var(--space-xl)"></div>
            <div class="skeleton skeleton-text" style="width:100%"></div>
            <div class="skeleton skeleton-text" style="width:90%"></div>
            <div class="skeleton skeleton-text" style="width:85%"></div>
          </div>
        </div>
      </div>
    `;
    },

    /**
     * Initialize and load the post
     */
    async initPost(slug) {
        try {
            const post = await API.getPost(slug);
            this.currentPost = post;
            this.renderFullPost(post);
            this.initReadingProgress();
            await this.loadComments(post._id);
            Utils.initScrollAnimations();
            Utils.initLazyLoad();
            App.bindLinks();

            // Syntax highlighting
            if (window.Prism) {
                setTimeout(() => Prism.highlightAll(), 100);
            }
        } catch (error) {
            document.getElementById('postContainer').innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">😢</div>
          <h3>Post Not Found</h3>
          <p>The post you're looking for doesn't exist or has been removed.</p>
          <a data-link href="/blog" class="btn btn-primary">Browse Posts</a>
        </div>
      `;
            App.bindLinks();
        }
    },

    /**
     * Render the full post content
     */
    renderFullPost(post) {
        const authorInitial = Utils.getInitials(post.author?.username);
        const date = Utils.formatDate(post.createdAt);
        const hasImage = post.coverImage && post.coverImage.length > 0;
        const isAuthor = App.currentUser && App.currentUser._id === post.author?._id;

        // Generate Table of Contents from content headings
        const toc = this.generateTOC(post.content);

        document.getElementById('postContainer').innerHTML = `
      <div class="container-narrow">
        <!-- Post Header -->
        <div class="post-header">
          <span class="card-category">${Utils.escapeHtml(post.category || 'General')}</span>
          <h1>${Utils.escapeHtml(post.title)}</h1>
          <div class="post-meta">
            <span class="post-meta-item card-author" onclick="App.navigate('/profile/${post.author?.username}')">
              <div class="card-author-avatar">${authorInitial}</div>
              ${Utils.escapeHtml(post.author?.username || 'Anonymous')}
            </span>
            <span class="post-meta-item">📅 ${date}</span>
            <span class="post-meta-item">📖 ${post.readTime || 1} min read</span>
            <span class="post-meta-item">♥ ${post.likes?.length || 0} likes</span>
          </div>
        </div>

        <!-- Cover Image -->
        ${hasImage ? `<img class="post-cover" src="${post.coverImage}" alt="${Utils.escapeHtml(post.title)}" />` : ''}

        <!-- Table of Contents -->
        ${toc ? `
          <div class="toc">
            <div class="toc-title">📑 Table of Contents</div>
            <div class="toc-list">${toc}</div>
          </div>
        ` : ''}

        <!-- Post Content -->
        <div class="post-content">${post.content}</div>

        <!-- Tags -->
        ${post.tags?.length ? `
          <div class="tags-list" style="margin: var(--space-2xl) auto; max-width: var(--container-narrow);">
            ${post.tags.map(tag => `<span class="tag" onclick="App.navigate('/blog?tag=${encodeURIComponent(tag)}')">#${Utils.escapeHtml(tag)}</span>`).join('')}
          </div>
        ` : ''}

        <!-- Actions Bar -->
        <div class="post-actions-bar">
          <div class="post-actions-left">
            <button class="btn btn-ghost btn-sm ${post.likes?.includes(App.currentUser?._id) ? 'liked' : ''}"
              id="postLikeBtn" onclick="Post.likePost('${post._id}')">
              ♥ Like <span id="postLikeCount">${post.likes?.length || 0}</span>
            </button>
            <button class="btn btn-ghost btn-sm" onclick="Post.bookmarkPost('${post._id}')" id="postBookmarkBtn">
              🔖 Bookmark
            </button>
            ${isAuthor ? `
              <a data-link href="/edit/${post._id}" class="btn btn-ghost btn-sm">✏️ Edit</a>
              <button class="btn btn-ghost btn-sm" onclick="Post.deletePost('${post._id}')" style="color: var(--color-error)">🗑️ Delete</button>
            ` : ''}
          </div>
          ${Components.renderShareButtons(post)}
        </div>

        <!-- Comments Section -->
        <div class="comments-section">
          <h3>💬 Comments</h3>
          ${App.currentUser ? `
            <div class="comment-form">
              <textarea class="form-textarea" id="commentInput" placeholder="Write a comment..." maxlength="2000"></textarea>
              <button class="btn btn-primary btn-sm" onclick="Post.submitComment('${post._id}')">Post Comment</button>
            </div>
          ` : `
            <p class="text-muted text-sm" style="margin-bottom: var(--space-lg)">
              <a data-link href="/login">Log in</a> to leave a comment.
            </p>
          `}
          <div class="comments-list" id="commentsList">
            <div class="spinner"></div>
          </div>
        </div>

        <!-- Related Posts -->
        <div class="related-posts" id="relatedPosts">
          <h3>Related Articles</h3>
          <div class="blog-grid" id="relatedGrid" style="margin-top: var(--space-lg)">
            ${Components.renderSkeletonCards(3)}
          </div>
        </div>
      </div>
    `;

        // Load related posts
        this.loadRelatedPosts(post);
    },

    /**
     * Generate table of contents from HTML headings
     */
    generateTOC(content) {
        const temp = document.createElement('div');
        temp.innerHTML = content;
        const headings = temp.querySelectorAll('h2, h3');

        if (headings.length < 2) return '';

        let tocHtml = '';
        headings.forEach((h, i) => {
            const id = `heading-${i}`;
            const level = h.tagName.toLowerCase();
            tocHtml += `<a class="toc-link toc-${level}" href="#${id}" onclick="Post.scrollToHeading('${id}')">${h.textContent}</a>`;
        });

        return tocHtml;
    },

    /**
     * Scroll to heading (and add IDs to actual content headings)
     */
    scrollToHeading(id) {
        // Add IDs to post content headings if not already
        const contentEl = document.querySelector('.post-content');
        if (contentEl) {
            const headings = contentEl.querySelectorAll('h2, h3');
            headings.forEach((h, i) => {
                if (!h.id) h.id = `heading-${i}`;
            });
        }

        const target = document.getElementById(id);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    /**
     * Initialize reading progress bar for single post
     */
    initReadingProgress() {
        // Add IDs to headings
        const contentEl = document.querySelector('.post-content');
        if (contentEl) {
            const headings = contentEl.querySelectorAll('h2, h3');
            headings.forEach((h, i) => {
                if (!h.id) h.id = `heading-${i}`;
            });
        }

        window.addEventListener('scroll', Utils.throttle(() => {
            Components.updateReadingProgress();
        }, 50));
    },

    /**
     * Load related posts
     */
    async loadRelatedPosts(post) {
        try {
            const data = await API.getPosts({ category: post.category, limit: 3 });
            const related = data.posts.filter(p => p._id !== post._id).slice(0, 3);
            const grid = document.getElementById('relatedGrid');

            if (related.length > 0) {
                grid.innerHTML = related.map(p => Components.renderBlogCard(p)).join('');
                Utils.initLazyLoad();
                App.bindLinks();
            } else {
                document.getElementById('relatedPosts').style.display = 'none';
            }
        } catch {
            document.getElementById('relatedPosts').style.display = 'none';
        }
    },

    /**
     * Load comments for a post
     */
    async loadComments(postId) {
        const container = document.getElementById('commentsList');
        try {
            const comments = await API.getComments(postId);

            if (comments.length === 0) {
                container.innerHTML = '<p class="text-center text-muted" style="padding:var(--space-xl)">No comments yet. Be the first!</p>';
                return;
            }

            container.innerHTML = comments.map(c => this.renderComment(c, postId)).join('');
        } catch {
            container.innerHTML = '<p class="text-center text-muted" style="padding:var(--space-xl)">Could not load comments.</p>';
        }
    },

    /**
     * Render a single comment with replies
     */
    renderComment(comment, postId) {
        const initial = Utils.getInitials(comment.author?.username);
        const isOwner = App.currentUser && App.currentUser._id === comment.author?._id;

        let html = `
      <div class="comment" id="comment-${comment._id}">
        <div class="comment-header">
          <div class="avatar avatar-sm">${initial}</div>
          <div>
            <span class="comment-author">${Utils.escapeHtml(comment.author?.username || 'Anonymous')}</span>
            <span class="comment-date">${Utils.timeAgo(comment.createdAt)}</span>
          </div>
        </div>
        <div class="comment-body">${Utils.escapeHtml(comment.content)}</div>
        <div class="comment-actions">
          ${App.currentUser ? `<button class="comment-action" onclick="Post.showReplyForm('${comment._id}', '${postId}')">Reply</button>` : ''}
          ${isOwner ? `<button class="comment-action" onclick="Post.deleteComment('${comment._id}', '${postId}')" style="color:var(--color-error)">Delete</button>` : ''}
        </div>
        <div id="replyForm-${comment._id}"></div>
        ${comment.replies?.length ? `
          <div class="comment-replies">
            ${comment.replies.map(r => {
            const rInitial = Utils.getInitials(r.author?.username);
            const rOwner = App.currentUser && App.currentUser._id === r.author?._id;
            return `
                <div class="comment" id="comment-${r._id}">
                  <div class="comment-header">
                    <div class="avatar avatar-sm">${rInitial}</div>
                    <div>
                      <span class="comment-author">${Utils.escapeHtml(r.author?.username || 'Anonymous')}</span>
                      <span class="comment-date">${Utils.timeAgo(r.createdAt)}</span>
                    </div>
                  </div>
                  <div class="comment-body">${Utils.escapeHtml(r.content)}</div>
                  ${rOwner ? `
                    <div class="comment-actions">
                      <button class="comment-action" onclick="Post.deleteComment('${r._id}', '${postId}')" style="color:var(--color-error)">Delete</button>
                    </div>
                  ` : ''}
                </div>
              `;
        }).join('')}
          </div>
        ` : ''}
      </div>
    `;
        return html;
    },

    /**
     * Show reply form under a comment
     */
    showReplyForm(commentId, postId) {
        const container = document.getElementById(`replyForm-${commentId}`);
        if (container.innerHTML.trim()) {
            container.innerHTML = '';
            return;
        }
        container.innerHTML = `
      <div class="reply-form">
        <textarea class="form-textarea" id="replyInput-${commentId}" placeholder="Write a reply..." maxlength="2000"></textarea>
        <button class="btn btn-primary btn-sm" onclick="Post.submitReply('${commentId}', '${postId}')">Reply</button>
      </div>
    `;
    },

    /**
     * Submit a new comment
     */
    async submitComment(postId) {
        const input = document.getElementById('commentInput');
        const content = input.value.trim();
        if (!content) {
            Components.showToast('Please write a comment', 'warning');
            return;
        }

        try {
            await API.addComment(postId, content);
            input.value = '';
            Components.showToast('Comment posted!', 'success');
            await this.loadComments(postId);
        } catch (error) {
            Components.showToast(error.message, 'error');
        }
    },

    /**
     * Submit a reply to a comment
     */
    async submitReply(parentId, postId) {
        const input = document.getElementById(`replyInput-${parentId}`);
        const content = input.value.trim();
        if (!content) return;

        try {
            await API.addComment(postId, content, parentId);
            Components.showToast('Reply posted!', 'success');
            await this.loadComments(postId);
        } catch (error) {
            Components.showToast(error.message, 'error');
        }
    },

    /**
     * Delete a comment
     */
    async deleteComment(commentId, postId) {
        if (!confirm('Delete this comment?')) return;
        try {
            await API.deleteComment(commentId);
            Components.showToast('Comment deleted', 'success');
            await this.loadComments(postId);
        } catch (error) {
            Components.showToast(error.message, 'error');
        }
    },

    /**
     * Like a post
     */
    async likePost(postId) {
        if (!App.currentUser) {
            Components.showToast('Please log in to like posts', 'warning');
            return;
        }
        try {
            const result = await API.toggleLike(postId);
            const btn = document.getElementById('postLikeBtn');
            const count = document.getElementById('postLikeCount');
            btn.classList.toggle('liked', result.liked);
            count.textContent = result.likes;
            Components.showToast(result.liked ? 'Post liked! ♥' : 'Like removed', 'success');
        } catch (error) {
            Components.showToast(error.message, 'error');
        }
    },

    /**
     * Bookmark a post
     */
    async bookmarkPost(postId) {
        if (!App.currentUser) {
            Components.showToast('Please log in to bookmark posts', 'warning');
            return;
        }
        try {
            const result = await API.toggleBookmark(postId);
            const btn = document.getElementById('postBookmarkBtn');
            if (result.bookmarked) {
                btn.innerHTML = '🔖 Bookmarked';
                Components.showToast('Post bookmarked!', 'success');
            } else {
                btn.innerHTML = '🔖 Bookmark';
                Components.showToast('Bookmark removed', 'info');
            }
        } catch (error) {
            Components.showToast(error.message, 'error');
        }
    },

    /**
     * Delete a post
     */
    async deletePost(postId) {
        if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
        try {
            await API.deletePost(postId);
            Components.showToast('Post deleted', 'success');
            App.navigate('/blog');
        } catch (error) {
            Components.showToast(error.message, 'error');
        }
    }
};
