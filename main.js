// Initialize AOS
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: window.innerWidth < 768 ? 600 : 800,
        easing: 'ease-in-out',
        once: true,
        disable: 'mobile' // Disable on mobile if performance issues occur
    });

    // Start the typing effect
    startTypingEffect();
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form submission handling
const form = document.querySelector('form');
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerText;
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = `
        <svg class="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    `;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Reset button state
    submitButton.disabled = false;
    submitButton.innerText = originalText;
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 translate-y-full';
    successMessage.innerText = 'Message sent successfully!';
    document.body.appendChild(successMessage);
    
    // Animate in
    setTimeout(() => successMessage.classList.remove('translate-y-full'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        successMessage.classList.add('translate-y-full');
        setTimeout(() => successMessage.remove(), 500);
    }, 3000);
    
    form.reset();
});

// Add scroll-based navbar transparency
window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Add intersection observer for parallax effects
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Typing effect function
function startTypingEffect() {
    const words = ['Websites 🌐', 'Games 🎮', 'Scripting 🖥️', 'Mobile apps 📱', 'and more! 🚀'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    // Adjust typing speed based on screen size
    const isMobile = window.innerWidth < 768;
    const typingDelay = isMobile ? 150 : 100;
    const deletingDelay = isMobile ? 75 : 50;
    const newWordDelay = isMobile ? 2500 : 2000;

    function typeEffect() {
        const currentWord = words[wordIndex];
        const typingText = document.getElementById('typing-text');
        
        if (isDeleting) {
            // Delete characters
            typingText.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            
            if (charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                setTimeout(typeEffect, newWordDelay);
                return;
            }
        } else {
            // Type characters
            typingText.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            
            if (charIndex === currentWord.length) {
                isDeleting = true;
                setTimeout(typeEffect, newWordDelay);
                return;
            }
        }
        
        setTimeout(typeEffect, isDeleting ? deletingDelay : typingDelay);
    }

    // Start the typing effect when the page loads
    window.addEventListener('load', () => {
        typeEffect();
    });
}

// Add this function for smooth scrolling to characteristics section
function scrollToCharacteristics() {
    const section = document.getElementById('script');
    const navHeight = document.querySelector('nav').offsetHeight;
    const isMobile = window.innerWidth < 768;
    const offset = isMobile ? 60 : navHeight; // Smaller offset for mobile
    const sectionTop = section.offsetTop - offset;
    
    window.scrollTo({
        top: sectionTop,
        behavior: 'smooth'
    });
}

// Add smooth section transitions
const sections = document.querySelectorAll('section');

const fadeInOptions = {
    threshold: 0.3,
    rootMargin: "0px 0px -100px 0px"
};

const fadeInOnScroll = new IntersectionObserver(function(entries, fadeInOnScroll) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        }
        entry.target.classList.add('fade-in');
        fadeInOnScroll.unobserve(entry.target);
    });
}, fadeInOptions);

sections.forEach(section => {
    fadeInOnScroll.observe(section);
});

// Add parallax effect to background elements
document.addEventListener('mousemove', (e) => {
    // Only apply parallax effect on desktop
    if (window.innerWidth >= 768) {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
        
        document.querySelectorAll('.bg-gradient-mesh').forEach(element => {
            element.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    }
});

// Add reveal on scroll effect
const revealElements = document.querySelectorAll('.reveal');

const reveal = () => {
    revealElements.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
}

window.addEventListener('scroll', reveal);

// Add hover effect for interactive elements
document.querySelectorAll('.interactive').forEach(element => {
    element.addEventListener('mouseenter', () => {
        element.style.transform = 'scale(1.05)';
        element.style.transition = 'all 0.3s ease';
    });
    
    element.addEventListener('mouseleave', () => {
        element.style.transform = 'scale(1)';
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add parallax scrolling effect
window.addEventListener('scroll', () => {
    const parallaxElements = document.querySelectorAll('.parallax');
    parallaxElements.forEach(element => {
        let speed = element.dataset.speed || 0.5;
        element.style.transform = `translateY(${window.scrollY * speed}px)`;
    });
});

// Add responsive handling for the Three.js logo
window.addEventListener('resize', () => {
    const logoContainer = document.getElementById('logo-container');
    if (logoContainer) {
        const height = window.innerWidth < 768 ? '400px' : '800px';
        logoContainer.style.height = height;
    }
});

// Add responsive navbar handling
const handleResponsiveNav = () => {
    const nav = document.querySelector('nav');
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        nav.classList.add('mobile');
        // Add smaller padding and font size for mobile
        nav.style.padding = '0.75rem 1rem';
    } else {
        nav.classList.remove('mobile');
        nav.style.padding = '';
    }
};

window.addEventListener('resize', handleResponsiveNav);
window.addEventListener('load', handleResponsiveNav); 