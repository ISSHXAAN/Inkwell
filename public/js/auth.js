/* ============================================
   AUTH — Login & Register Logic
   ============================================ */

const Auth = {
    /**
     * Render login page
     */
    renderLogin() {
        return `
      <div class="page-spacer"></div>
      <div class="auth-page page-transition">
        <div class="auth-card">
          <div class="auth-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your Inkwell account</p>
          </div>
          <form id="loginForm">
            <div class="form-group">
              <label class="form-label" for="loginEmail">Email</label>
              <input type="email" id="loginEmail" class="form-input" placeholder="you@example.com" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="loginPassword">Password</label>
              <input type="password" id="loginPassword" class="form-input" placeholder="Enter your password" required />
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%">Sign In</button>
          </form>
          <div class="auth-footer">
            Don't have an account? <a data-link href="/register">Sign up</a>
          </div>
        </div>
      </div>
    `;
    },

    /**
     * Render register page
     */
    renderRegister() {
        return `
      <div class="page-spacer"></div>
      <div class="auth-page page-transition">
        <div class="auth-card">
          <div class="auth-header">
            <h1>Create Account</h1>
            <p>Join Inkwell and start writing today</p>
          </div>
          <form id="registerForm">
            <div class="form-group">
              <label class="form-label" for="regUsername">Username</label>
              <input type="text" id="regUsername" class="form-input" placeholder="Choose a username" required minlength="3" maxlength="30" />
            </div>
            <div class="form-group">
              <label class="form-label" for="regEmail">Email</label>
              <input type="email" id="regEmail" class="form-input" placeholder="you@example.com" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="regPassword">Password</label>
              <input type="password" id="regPassword" class="form-input" placeholder="Create a password (min 6 chars)" required minlength="6" />
            </div>
            <div class="form-group">
              <label class="form-label" for="regConfirm">Confirm Password</label>
              <input type="password" id="regConfirm" class="form-input" placeholder="Confirm your password" required />
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%">Create Account</button>
          </form>
          <div class="auth-footer">
            Already have an account? <a data-link href="/login">Sign in</a>
          </div>
        </div>
      </div>
    `;
    },

    /**
     * Initialize login form handler
     */
    initLogin() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            const btn = form.querySelector('button[type="submit"]');
            btn.textContent = 'Signing in...';
            btn.disabled = true;

            try {
                const user = await API.login({ email, password });
                App.currentUser = user;
                Components.updateNavAuth(user);
                Components.showToast(`Welcome back, ${user.username}! 👋`, 'success');
                App.navigate('/');
            } catch (error) {
                Components.showToast(error.message, 'error');
            } finally {
                btn.textContent = 'Sign In';
                btn.disabled = false;
            }
        });
    },

    /**
     * Initialize register form handler
     */
    initRegister() {
        const form = document.getElementById('registerForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('regUsername').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const confirm = document.getElementById('regConfirm').value;

            if (password !== confirm) {
                Components.showToast('Passwords do not match', 'error');
                return;
            }

            const btn = form.querySelector('button[type="submit"]');
            btn.textContent = 'Creating account...';
            btn.disabled = true;

            try {
                const user = await API.register({ username, email, password });
                App.currentUser = user;
                Components.updateNavAuth(user);
                Components.showToast('Account created! Welcome to Inkwell! 🎉', 'success');
                App.navigate('/');
            } catch (error) {
                Components.showToast(error.message, 'error');
            } finally {
                btn.textContent = 'Create Account';
                btn.disabled = false;
            }
        });
    }
};
