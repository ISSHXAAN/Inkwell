/* ============================================
   PROFILE — Author Profile Page
   ============================================ */

const Profile = {
    /**
     * Render profile page
     */
    renderProfile(username) {
        return `
      <div class="page-spacer"></div>
      <div class="profile-page page-transition">
        <div class="container" id="profileContainer">
          <div class="text-center" style="padding: var(--space-3xl)">
            <div class="spinner"></div>
          </div>
        </div>
      </div>
    `;
    },

    /**
     * Initialize profile page
     */
    async initProfile(username) {
        const container = document.getElementById('profileContainer');

        try {
            const data = await API.getUserProfile(username);
            const { user, posts } = data;
            const isOwn = App.currentUser && App.currentUser._id === user._id;
            const initial = Utils.getInitials(user.username);

            container.innerHTML = `
        <div class="profile-header fade-in-up">
          <div class="avatar avatar-xl" style="margin: 0 auto var(--space-lg);">
            ${user.avatar ? `<img src="${user.avatar}" alt="${Utils.escapeHtml(user.username)}" />` : initial}
          </div>
          <h1>${Utils.escapeHtml(user.username)}</h1>
          <p class="profile-bio">${Utils.escapeHtml(user.bio || 'No bio yet.')}</p>
          <p class="text-muted text-sm">Joined ${Utils.formatDate(user.createdAt)}</p>

          ${user.socialLinks ? `
            <div class="profile-social" style="margin-top: var(--space-md);">
              ${user.socialLinks.twitter ? `<a href="${user.socialLinks.twitter}" target="_blank" title="Twitter">𝕏</a>` : ''}
              ${user.socialLinks.github ? `<a href="${user.socialLinks.github}" target="_blank" title="GitHub">⌂</a>` : ''}
              ${user.socialLinks.linkedin ? `<a href="${user.socialLinks.linkedin}" target="_blank" title="LinkedIn">in</a>` : ''}
              ${user.socialLinks.website ? `<a href="${user.socialLinks.website}" target="_blank" title="Website">🌐</a>` : ''}
            </div>
          ` : ''}

          ${isOwn ? `<button class="btn btn-secondary btn-sm" style="margin-top: var(--space-lg)" onclick="Profile.showEditModal()">✏️ Edit Profile</button>` : ''}
        </div>

        <h2 class="profile-posts-title">${isOwn ? 'Your' : `${Utils.escapeHtml(user.username)}'s`} Posts (${posts.length})</h2>

        ${posts.length > 0
                    ? `<div class="blog-grid stagger-children">${posts.map(p => Components.renderBlogCard(p)).join('')}</div>`
                    : `<div class="empty-state">
              <div class="empty-state-icon">📝</div>
              <h3>No Posts Yet</h3>
              <p>${isOwn ? 'Start writing your first post!' : 'This author hasn\'t published any posts yet.'}</p>
              ${isOwn ? '<a data-link href="/create" class="btn btn-primary">Write a Post</a>' : ''}
            </div>`
                }
      `;

            Utils.initScrollAnimations();
            Utils.initLazyLoad();
            App.bindLinks();
        } catch (error) {
            container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">😢</div>
          <h3>User Not Found</h3>
          <p>The user you're looking for doesn't exist.</p>
          <a data-link href="/" class="btn btn-primary">Go Home</a>
        </div>
      `;
            App.bindLinks();
        }
    },

    /**
     * Show edit profile modal
     */
    showEditModal() {
        const user = App.currentUser;
        if (!user) return;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'editProfileModal';
        overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Edit Profile</h3>
          <button class="btn btn-icon btn-ghost" onclick="Profile.closeEditModal()">✕</button>
        </div>
        <form id="editProfileForm">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" class="form-input" id="editUsername" value="${Utils.escapeHtml(user.username)}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Bio</label>
            <textarea class="form-textarea" id="editBio" maxlength="500" style="min-height:80px">${Utils.escapeHtml(user.bio || '')}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Twitter URL</label>
            <input type="url" class="form-input" id="editTwitter" value="${Utils.escapeHtml(user.socialLinks?.twitter || '')}" placeholder="https://twitter.com/..." />
          </div>
          <div class="form-group">
            <label class="form-label">GitHub URL</label>
            <input type="url" class="form-input" id="editGithub" value="${Utils.escapeHtml(user.socialLinks?.github || '')}" placeholder="https://github.com/..." />
          </div>
          <div class="form-group">
            <label class="form-label">LinkedIn URL</label>
            <input type="url" class="form-input" id="editLinkedin" value="${Utils.escapeHtml(user.socialLinks?.linkedin || '')}" placeholder="https://linkedin.com/in/..." />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%">Save Changes</button>
        </form>
      </div>
    `;

        document.body.appendChild(overlay);

        // Close on outside click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeEditModal();
        });

        // Form submit
        document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const updated = await API.updateProfile({
                    username: document.getElementById('editUsername').value.trim(),
                    bio: document.getElementById('editBio').value.trim(),
                    socialLinks: {
                        twitter: document.getElementById('editTwitter').value.trim(),
                        github: document.getElementById('editGithub').value.trim(),
                        linkedin: document.getElementById('editLinkedin').value.trim()
                    }
                });
                App.currentUser = updated;
                Components.updateNavAuth(updated);
                this.closeEditModal();
                Components.showToast('Profile updated!', 'success');
                // Reload profile
                App.navigate(`/profile/${updated.username}`);
            } catch (error) {
                Components.showToast(error.message, 'error');
            }
        });
    },

    /**
     * Close edit profile modal
     */
    closeEditModal() {
        const modal = document.getElementById('editProfileModal');
        if (modal) modal.remove();
    }
};
