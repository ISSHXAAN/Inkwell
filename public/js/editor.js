/* ============================================
   EDITOR — Create/Edit Post with Quill.js
   ============================================ */

const Editor = {
    quill: null,
    tags: [],
    coverImage: '',
    editingPost: null,

    /**
     * Render editor page
     */
    renderEditor(editId) {
        const isEditing = !!editId;

        return `
      <div class="page-spacer"></div>
      <div class="editor-page page-transition">
        <div class="container">
          <div class="editor-form">
            <div class="editor-header">
              <h1>${isEditing ? 'Edit Post' : 'Create New Post'}</h1>
              <div class="flex gap-md">
                <button class="btn btn-ghost" onclick="App.navigate('/blog')">Cancel</button>
                <button class="btn btn-primary" id="publishBtn" onclick="Editor.submit()">
                  ${isEditing ? 'Update' : 'Publish'}
                </button>
              </div>
            </div>

            <!-- Cover Image Upload -->
            <div class="editor-cover-upload" id="coverUpload" onclick="document.getElementById('coverInput').click()">
              <span style="font-size: 2rem">📸</span>
              <span>Click to upload cover image</span>
              <input type="file" id="coverInput" accept="image/*" style="display:none" onchange="Editor.uploadCover(event)" />
            </div>

            <!-- Title -->
            <div class="form-group">
              <input type="text" id="postTitle" class="form-input" placeholder="Enter your post title..." 
                style="font-size: var(--fs-2xl); font-family: var(--font-heading); font-weight: var(--fw-bold); border: none; padding: 0; background: transparent;"
                maxlength="200" />
            </div>

            <!-- Category -->
            <div class="form-group">
              <label class="form-label">Category</label>
              <select id="postCategory" class="form-select">
                <option value="">Select a category</option>
                <option value="Technology">Technology</option>
                <option value="Design">Design</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Travel">Travel</option>
                <option value="Programming">Programming</option>
                <option value="Business">Business</option>
                <option value="Science">Science</option>
                <option value="Health">Health</option>
              </select>
            </div>

            <!-- Tags -->
            <div class="form-group">
              <label class="form-label">Tags</label>
              <div class="editor-tags-input" id="tagsContainer" onclick="document.getElementById('tagInput').focus()">
                <input type="text" id="tagInput" placeholder="Type a tag and press Enter..." />
              </div>
            </div>

            <!-- Excerpt -->
            <div class="form-group">
              <label class="form-label">Excerpt (optional)</label>
              <textarea id="postExcerpt" class="form-textarea" placeholder="Brief summary of your post (auto-generated if left blank)" maxlength="500" style="min-height:80px"></textarea>
            </div>

            <!-- Rich Text Editor -->
            <div class="form-group">
              <label class="form-label">Content</label>
              <div id="quillEditor"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    },

    /**
     * Initialize the editor
     */
    async initEditor(editId) {
        // Initialize Quill
        this.quill = new Quill('#quillEditor', {
            theme: 'snow',
            placeholder: 'Start writing your story...',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    ['blockquote', 'code-block'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                ]
            }
        });

        // Tag input handler
        const tagInput = document.getElementById('tagInput');
        tagInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const tag = tagInput.value.trim().toLowerCase();
                if (tag && !this.tags.includes(tag) && this.tags.length < 10) {
                    this.tags.push(tag);
                    this.renderTags();
                }
                tagInput.value = '';
            }
        });

        // Load post data if editing
        if (editId) {
            try {
                // We need to get the post by ID — use a workaround
                // The API uses slugs, so we'll need to fetch it differently
                const response = await fetch(`/api/posts?limit=100`, { credentials: 'include' });
                const data = await response.json();
                const post = data.posts.find(p => p._id === editId);

                if (post) {
                    this.editingPost = post;
                    document.getElementById('postTitle').value = post.title;
                    document.getElementById('postCategory').value = post.category || '';
                    document.getElementById('postExcerpt').value = post.excerpt || '';
                    this.quill.root.innerHTML = post.content;
                    this.tags = post.tags || [];
                    this.coverImage = post.coverImage || '';
                    this.renderTags();

                    if (this.coverImage) {
                        const upload = document.getElementById('coverUpload');
                        upload.innerHTML = `<img src="${this.coverImage}" alt="Cover" /><input type="file" id="coverInput" accept="image/*" style="display:none" onchange="Editor.uploadCover(event)" />`;
                    }
                }
            } catch (error) {
                Components.showToast('Could not load post for editing', 'error');
            }
        } else {
            this.editingPost = null;
            this.tags = [];
            this.coverImage = '';
        }

        // Image upload handler in Quill
        this.quill.getModule('toolbar').addHandler('image', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async () => {
                const file = input.files[0];
                if (!file) return;
                try {
                    const result = await API.uploadImage(file);
                    const range = this.quill.getSelection(true);
                    this.quill.insertEmbed(range.index, 'image', result.url);
                } catch (error) {
                    Components.showToast('Image upload failed', 'error');
                }
            };
            input.click();
        });
    },

    /**
     * Render tags in the input
     */
    renderTags() {
        const container = document.getElementById('tagsContainer');
        const input = container.querySelector('input');
        // Remove existing tag elements
        container.querySelectorAll('.editor-tag').forEach(el => el.remove());
        // Add tag elements before input
        this.tags.forEach(tag => {
            const el = document.createElement('span');
            el.className = 'editor-tag';
            el.innerHTML = `${Utils.escapeHtml(tag)} <span class="editor-tag-remove" onclick="Editor.removeTag('${tag}')">✕</span>`;
            container.insertBefore(el, input);
        });
    },

    /**
     * Remove a tag
     */
    removeTag(tag) {
        this.tags = this.tags.filter(t => t !== tag);
        this.renderTags();
    },

    /**
     * Upload cover image
     */
    async uploadCover(event) {
        const file = event.target.files[0];
        if (!file) return;

        const upload = document.getElementById('coverUpload');
        upload.innerHTML = '<div class="spinner"></div><span>Uploading...</span>';

        try {
            const result = await API.uploadImage(file);
            this.coverImage = result.url;
            upload.innerHTML = `<img src="${result.url}" alt="Cover" /><input type="file" id="coverInput" accept="image/*" style="display:none" onchange="Editor.uploadCover(event)" />`;
            Components.showToast('Cover image uploaded!', 'success');
        } catch (error) {
            upload.innerHTML = `<span style="font-size: 2rem">📸</span><span>Click to upload cover image</span><input type="file" id="coverInput" accept="image/*" style="display:none" onchange="Editor.uploadCover(event)" />`;
            Components.showToast('Upload failed: ' + error.message, 'error');
        }
    },

    /**
     * Submit the post (create or update)
     */
    async submit() {
        const title = document.getElementById('postTitle').value.trim();
        const category = document.getElementById('postCategory').value;
        const excerpt = document.getElementById('postExcerpt').value.trim();
        const content = this.quill.root.innerHTML;

        // Validation
        if (!title) {
            Components.showToast('Please enter a title', 'warning');
            return;
        }
        if (!category) {
            Components.showToast('Please select a category', 'warning');
            return;
        }
        if (!content || content === '<p><br></p>') {
            Components.showToast('Please write some content', 'warning');
            return;
        }

        const btn = document.getElementById('publishBtn');
        btn.textContent = this.editingPost ? 'Updating...' : 'Publishing...';
        btn.disabled = true;

        const postData = {
            title,
            content,
            category,
            excerpt,
            tags: this.tags,
            coverImage: this.coverImage
        };

        try {
            let result;
            if (this.editingPost) {
                result = await API.updatePost(this.editingPost._id, postData);
                Components.showToast('Post updated successfully! ✏️', 'success');
            } else {
                result = await API.createPost(postData);
                Components.showToast('Post published! 🎉', 'success');
            }
            App.navigate(`/post/${result.slug}`);
        } catch (error) {
            Components.showToast(error.message, 'error');
        } finally {
            btn.textContent = this.editingPost ? 'Update' : 'Publish';
            btn.disabled = false;
        }
    }
};
