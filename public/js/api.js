/* ============================================
   API — Fetch Wrapper for Backend
   ============================================ */

const API = {
    baseUrl: '/api',

    /**
     * Core fetch wrapper with error handling and credentials
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Remove Content-Type for FormData (file uploads)
        if (options.body instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            if (error.message === 'Failed to fetch') {
                throw new Error('Unable to connect to server. Please check your connection.');
            }
            throw error;
        }
    },

    // ---- AUTH ----
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    async logout() {
        return this.request('/auth/logout', { method: 'POST' });
    },

    async getMe() {
        return this.request('/auth/me');
    },

    // ---- POSTS ----
    async getPosts(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/posts${query ? '?' + query : ''}`);
    },

    async getFeaturedPosts() {
        return this.request('/posts/featured');
    },

    async getPost(slug) {
        return this.request(`/posts/${slug}`);
    },

    async createPost(postData) {
        return this.request('/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        });
    },

    async updatePost(id, postData) {
        return this.request(`/posts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(postData)
        });
    },

    async deletePost(id) {
        return this.request(`/posts/${id}`, { method: 'DELETE' });
    },

    async toggleLike(id) {
        return this.request(`/posts/${id}/like`, { method: 'POST' });
    },

    async toggleBookmark(id) {
        return this.request(`/posts/${id}/bookmark`, { method: 'POST' });
    },

    async getAllTags() {
        return this.request('/posts/tags');
    },

    // ---- COMMENTS ----
    async getComments(postId) {
        return this.request(`/posts/${postId}/comments`);
    },

    async addComment(postId, content, parentComment = null) {
        return this.request(`/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content, parentComment })
        });
    },

    async deleteComment(commentId) {
        return this.request(`/comments/${commentId}`, { method: 'DELETE' });
    },

    // ---- USERS ----
    async getUserProfile(username) {
        return this.request(`/users/${username}`);
    },

    async updateProfile(profileData) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    // ---- CATEGORIES ----
    async getCategories() {
        return this.request('/categories');
    },

    async createCategory(categoryData) {
        return this.request('/categories', {
            method: 'POST',
            body: JSON.stringify(categoryData)
        });
    },

    // ---- SUBSCRIBE ----
    async subscribe(email) {
        return this.request('/subscribe', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    },

    // ---- UPLOAD ----
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        return this.request('/upload', {
            method: 'POST',
            body: formData
        });
    }
};
