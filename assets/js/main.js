
// --- Include Loader  --- //
function loadInclude(selector, url, mode = 'append') {
    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
            return res.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            // Strip <script> keep body content
            doc.querySelectorAll('script').forEach(s => s.remove());
            const container = document.querySelector(selector);
            if (container) {
                Array.from(doc.body.children).forEach(child => {
                    const cloned = document.importNode(child, true);
                    container.appendChild(cloned);
                });
            }
        })
        .catch(err => {
            console.error(err);
            const container = document.querySelector(selector);
            if (container) {
                container.innerHTML = `<p style="text-align:center; padding: 1rem; color: var(--text-muted, #64748b);">Failed to load content.</p>`;
            }
        });
}

// --- Multi-Include Loader (fetches multiple fragments sequentially in order) ---
function loadIncludes(selector, urls) {
    if (urls.length === 0) return;

    // Chain promises to guarantee sequential loading in order
    let chain = Promise.resolve();
    urls.forEach(url => {
        chain = chain.then(() =>
            fetch(url)
                .then(res => {
                    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
                    return res.text();
                })
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    doc.querySelectorAll('script').forEach(s => s.remove());
                    const container = document.querySelector(selector);
                    if (container) {
                        Array.from(doc.body.children).forEach(child => {
                            container.appendChild(document.importNode(child, true));
                        });
                    }
                })
                .catch(err => {
                    console.error(err);
                })
        );
    });

    // Trigger nav observer after all loads complete
    chain.then(() => {
        if (typeof window.initNavObserver === 'function') {
            setTimeout(window.initNavObserver, 50);
        }
        initScrollAnimations();
        
        if (window.location.hash) {
            const target = document.querySelector(window.location.hash);
            if (target) {
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    });
}

// --- Auto-load page content ---
function loadPageContent() {
    // Load footer
    loadInclude('#footer-container', 'footer.html');

    // Load dynamic sections in order
    const sections = ['aboutme', 'skills', 'projects', 'certs', 'contact'];
    loadIncludes('#content', sections.map(id => `${id}.html`));
}

// --- Navbar Configuration ---
const NAV_CONFIG = [
    { label: 'Home', sectionId: 'hero' },
    { label: 'About', sectionId: 'about' },
    { label: 'Skills', sectionId: 'skills' },
    { label: 'Projects', sectionId: 'projects' },
    { label: 'Certifications', sectionId: 'certs' },
    { label: 'Contact', sectionId: 'contact' }
];

//Generate link href based on current page (index.html or other pages)
const IS_INDEX_PAGE = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';

function buildNavLink(item) {
    const href = IS_INDEX_PAGE ? `#${item.sectionId}` : `index.html#${item.sectionId}`;
    return `<li><a href="${href}">${item.label}</a></li>`;
}

// Generate the navbar HTML and insert it into the DOM
function generateNavbar() {
    const container = document.getElementById('navbar-container');
    if (!container) return;

    const navHtml = `
        <nav class="navbar">
            <div class="logo">
                <a href="${IS_INDEX_PAGE ? '#hero' : 'index.html'}"><img src="assets/images/L1p0-Industries-logo.webp" alt="L1p0 Industries" loading="lazy" decoding="async"></a>
            </div>
            <ul class="nav-links">
                ${NAV_CONFIG.map(buildNavLink).join('')}
            </ul>
            <button class="hamburger" aria-label="Menu">
                <span></span><span></span><span></span>
            </button>
        </nav>
    `;

    container.insertAdjacentHTML('afterend', navHtml);
    container.remove();
}

// Initialize navbar behaviors: hamburger menu toggle, and link click handling
function initNavbarBehaviors() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const hamburger = navbar.querySelector('.hamburger');
    const navLinks = navbar.querySelector('.nav-links');
    const visibleSections = new Set();
    const navLinksList = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });
    
    const setActiveLink = (activeId) => {
        navLinksList.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href') === `#${activeId}`) {
                a.classList.add('active');
            }
        });
    };
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                visibleSections.add(entry.target.getAttribute('id'));
            } else {
                visibleSections.delete(entry.target.getAttribute('id'));
            }
        });

        const allSections = document.querySelectorAll('section[id]');
        for (const section of allSections) {
            const id = section.getAttribute('id');
            if (visibleSections.has(id)) {
                setActiveLink(id);
                break;
            }
        }
    }, {
        threshold: 0,
        rootMargin: '-80px 0px -50% 0px'
    });

    const initNavObserver = () => {
        const sections = document.querySelectorAll('section[id]');
        sections.forEach(section => {
            navObserver.observe(section);
        });
    };

    window.initNavObserver = initNavObserver;
    initNavObserver();

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }
}

// --- Global animation initialization ---
function initScrollAnimations(root = document) {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    // Card and info animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    root.querySelectorAll('.architecture-diagram, .about-text, .project-card, .info-card, .contact-card, .skill-item').forEach(el => {
        if (!el.classList.contains('animate-in') && el.style.opacity !== '1') {
            el.style.opacity = '0';
            observer.observe(el);
        }
    });

    // skill bar animation
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target.querySelector('.skill-fill');
                if (fill && !fill.classList.contains('animated')) {
                    fill.style.width = '0%';
                    void fill.offsetWidth;
                    fill.style.width = fill.dataset.width;
                    fill.classList.add('animated');
                }
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    root.querySelectorAll('.skill-item').forEach(el => {
        skillObserver.observe(el);
    });
}

document.addEventListener('DOMContentLoaded', () => {

    // Auto-load footer + dynamic content
    loadPageContent();

    // Navbar generation and initialization
    generateNavbar();
    initNavbarBehaviors();
    initScrollAnimations();


    // MutationObserver to watch for changes in the content area and re-initialize nav & animations
    const contentDiv = document.getElementById('content');
    if (contentDiv) {
        const contentObserver = new MutationObserver(() => {
            initNavObserver();
            initScrollAnimations(contentDiv);
        });
        contentObserver.observe(contentDiv, { childList: true, subtree: true });
    }

    // Lightbox
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        const lightboxImg = lightbox.querySelector('img');
        const lightboxClose = lightbox.querySelector('.lightbox-close');

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => { lightboxImg.src = ''; }, 200);
        };

        document.body.addEventListener('click', (e) => {
            const img = e.target.closest('.gallery-images img');
            if (img) {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
                return;
            }
        });

        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

});
