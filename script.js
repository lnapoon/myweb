// Force page to start at the top on load/reload
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// Init AOS
AOS.init({ once: true, easing: 'ease-out-quart', offset: 60 });

// Preloader loaded trigger (with fallback check if window already loaded)
function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader && !preloader.classList.contains('loaded')) {
        setTimeout(() => {
            preloader.classList.add('loaded');
            // Recalculate bubble positioning once layout is stable
            const activeLink = document.querySelector('.nav-item-link.active');
            if (activeLink) {
                setTimeout(() => updateBubble(activeLink), 400);
            }
        }, 800);
    }
}

if (document.readyState === 'complete') {
    hidePreloader();
} else {
    window.addEventListener('load', hidePreloader);
}

// Navbar scroll shadow
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar-custom');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
});

// Cursor glow and interactive hover states
const glow = document.getElementById('cursorGlow');
if (glow) {
    document.addEventListener('mousemove', e => {
        glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });

    // Expand cursor glow when hovering interactive items
    const updateHoverListeners = () => {
        const interactives = document.querySelectorAll('a, button, .btn-lang, .skill-card, .proj-card-featured, .timeline-item, [onclick], input, select');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => glow.classList.add('hover'));
            el.addEventListener('mouseleave', () => glow.classList.remove('hover'));
        });
    };
    // Initialize hover listeners
    setTimeout(updateHoverListeners, 500);
}

// Click ripple particle splash effect
document.addEventListener('click', e => {
    // Avoid click ripple on inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.closest('#profileInput')) {
        return;
    }
    
    // Spawn ripple ring
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    // Spawn tiny golden splash particles
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'click-particle';
        particle.style.left = `${e.clientX}px`;
        particle.style.top = `${e.clientY}px`;
        
        const angle = (i / 8) * Math.PI * 2;
        const distance = 15 + Math.random() * 25;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        particle.style.setProperty('--rot', `${Math.random() * 360}deg`);
        
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 800);
    }
});

// Sliding pill navigation bubble
const wrapper = document.querySelector('.nav-links-wrapper');
const bubble = document.querySelector('.nav-active-bubble');
const navLinks = document.querySelectorAll('.nav-item-link');

function updateBubble(activeLink) {
    if (!activeLink || !bubble || !wrapper) return;
    const rect = activeLink.getBoundingClientRect();
    if (rect.width === 0) {
        bubble.style.opacity = '0';
        return;
    }
    const parentRect = wrapper.getBoundingClientRect();
    
    bubble.style.left = `${rect.left - parentRect.left}px`;
    bubble.style.top = `${rect.top - parentRect.top}px`;
    bubble.style.width = `${rect.width}px`;
    bubble.style.height = `${rect.height}px`;
    bubble.style.opacity = '1';
}

if (wrapper && bubble && navLinks.length > 0) {
    // Initialize bubble position on window load and active item
    window.addEventListener('load', () => {
        const activeLink = document.querySelector('.nav-item-link.active');
        if (activeLink) {
            setTimeout(() => updateBubble(activeLink), 300);
        }
    });

    // Handle recalculation on window resize
    window.addEventListener('resize', () => {
        const activeLink = document.querySelector('.nav-item-link.active');
        if (activeLink) updateBubble(activeLink);
    });

    navLinks.forEach(link => {
        // Move bubble on hover
        link.addEventListener('mouseenter', () => {
            updateBubble(link);
        });

        // Set active on click
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            updateBubble(link);
        });
    });

    // Reset bubble to active link when leaving the nav area
    wrapper.addEventListener('mouseleave', () => {
        const activeLink = document.querySelector('.nav-item-link.active');
        if (activeLink) {
            updateBubble(activeLink);
        } else {
            bubble.style.opacity = '0';
        }
    });
}

// Scroll Spy to highlight nav items based on page scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    let current = '';
    const scrollPos = window.scrollY + window.innerHeight * 0.25;

    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
            current = section.getAttribute('id');
        }
    });

    // Force highlight contact when scrolled to the absolute bottom of the page
    if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50) {
        current = 'contact';
    }

    if (navLinks.length > 0) {
        let matched = false;
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${current}`) {
                matched = true;
                if (!link.classList.contains('active')) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                    updateBubble(link);
                }
            }
        });

        // If in hero section or scroll position matches no links, clear highlights and hide bubble
        if (!matched || current === 'hero') {
            navLinks.forEach(l => l.classList.remove('active'));
            if (bubble) bubble.style.opacity = '0';
        }
    }
});

// Profile image upload
const profileInput = document.getElementById('profileInput');
if (profileInput) {
    profileInput.addEventListener('change', function () {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            const img = document.getElementById('profileImg');
            if (img) {
                img.src = e.target.result;
                img.style.display = 'block';
            }
            const placeholder = document.getElementById('profilePlaceholder');
            if (placeholder) placeholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    });
}

// Counter animation
function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    let count = 0;
    const step = Math.ceil(target / 30);
    const timer = setInterval(() => {
        count = Math.min(count + step, target);
        const statLabel = el.closest('.stat-item')?.querySelector('.stat-lbl')?.textContent || '';
        el.textContent = count + (statLabel.includes('ปี') ? '' : '+');
        if (count >= target) clearInterval(timer);
    }, 40);
}

// Trigger counters when stats section is visible
const statsObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.stat-num').forEach(animateCounter);
            statsObs.disconnect();
        }
    });
}, { threshold: 0.5 });

const statsEl = document.getElementById('stats');
if (statsEl) {
    statsObs.observe(statsEl);
}

// Skill bar animation on scroll
const skillObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.skill-fill').forEach(fill => {
                fill.style.width = fill.dataset.w + '%';
            });
            skillObs.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });
const aboutSection = document.getElementById('about');
if (aboutSection) skillObs.observe(aboutSection);
