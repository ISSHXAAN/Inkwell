# Project: Inkwell — Full-Stack Blogging Platform

## Overview
Inkwell is a professional full-stack blogging website built as a modern content platform for writers, creators, and readers. The application combines a secure Node.js/Express backend with a polished single-page frontend powered by vanilla JavaScript, delivering a seamless writing and reading experience.

## Key Features
- User authentication and account management with secure registration, login, logout, and profile handling.
- Rich text post creation and editing using Quill.js, including cover image uploads, category selection, tags, and excerpt support.
- Blog post publishing workflow with dynamic slug generation, reading-time estimation, and excerpt auto-generation.
- Full-text search and filtering by category, tag, and keyword.
- Comments and subscriptions to support reader engagement.
- File upload handling for post cover images and embedded content.
- Responsive SPA navigation with client-side routing, theme toggle, toast notifications, scroll-to-top, and progressive UI components.

## Architecture and Technology
- Backend: `Node.js`, `Express`, `MongoDB`, `Mongoose`
- Frontend: `HTML`, `CSS`, `vanilla JavaScript`, `Quill.js`, `Prism.js`
- Security and middleware: `helmet`, `cors`, `express-mongo-sanitize`, `xss-clean`, `express-rate-limit`, `cookie-parser`
- Authentication and authorization: `jsonwebtoken`, `bcryptjs`
- Static asset handling: Express static file serving plus uploaded media routing
- API design: modular route structure for auth, posts, comments, users, categories, subscriptions, and uploads

## Technical Highlights
- Built a modular backend with separate controllers, routes, middleware, and models for scalable maintainability.
- Implemented JWT-based authentication with protected routes and secure user session handling.
- Added input sanitization and rate limiting to reduce attack surface and prevent malicious requests.
- Designed a rich article editor that supports image uploads within content and a modern writing UI.
- Created a fully client-side SPA router for smooth page transitions without full page reloads.
- Enabled server-side handling of uploaded media alongside frontend static content delivery.
- Used Mongoose schema middleware to generate SEO-friendly slugs and compute metadata automatically.

## Strong CV Points
- Developed a complete full-stack blog platform with both frontend and backend implementation.
- Demonstrated strong Node.js/Express API design, MongoDB data modeling, and RESTful route management.
- Integrated modern UX features such as a rich text editor, dark/light theme toggle, and real-time toast notifications.
- Applied essential web security best practices, including helmet headers, CORS configuration, input sanitization, and rate limiting.
- Implemented advanced content features like markdown-style rich text publishing, tag management, search indexing, and author profiles.
- Built a maintainable codebase with clear separation of concerns across controllers, models, middleware, routes, and client-side modules.

## Why This Project Stands Out
Inkwell is more than a static blog; it is a polished, interactive platform with a strong focus on content creation and reader engagement. It demonstrates the ability to ship a secure, production-like web application with modern client-side experiences and solid backend architecture.
