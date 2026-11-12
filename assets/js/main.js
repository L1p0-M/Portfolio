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
            a.classList.toggle('active', new URL(a.href).hash === `#${activeId}`);
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

    initNavbarBehaviors();
    initScrollAnimations();


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
