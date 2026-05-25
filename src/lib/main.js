/**
 * ========================================
 * MAIN JAVASCRIPT - BARBERIA CHIQUE
 * Vanilla ES2022, zero dependencies
 * ========================================
 * 
 * Features:
 * - Mobile menu toggle
 * - Header scroll effect
 * - Scroll animations (IntersectionObserver)
 * - Form validation
 * - Smooth scroll for anchor links
 * - Pricing toggle
 */

(function() {
  'use strict';

  // ========================================
  // DOM ELEMENTS
  // ========================================
  const header = document.getElementById('header');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const contactForm = document.getElementById('contact-form');
  const pricingToggle = document.querySelector('.toggle-input');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  // ========================================
  // MOBILE MENU TOGGLE
  // ========================================
  function toggleMobileMenu() {
    const isOpen = mobileMenu.classList.contains('open');
    
    mobileMenu.classList.toggle('open', !isOpen);
    mobileMenu.setAttribute('aria-hidden', isOpen);
    mobileMenuBtn.setAttribute('aria-expanded', !isOpen);
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = !isOpen ? 'hidden' : '';
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }

  // Close mobile menu on link click
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close mobile menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      toggleMobileMenu();
      mobileMenuBtn.focus();
    }
  });

  // ========================================
  // HEADER SCROLL EFFECT
  // ========================================
  function handleHeaderScroll() {
    const scrollY = window.scrollY;
    
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  // Throttle scroll events for performance
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleHeaderScroll();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial check
  handleHeaderScroll();

  // ========================================
  // SCROLL ANIMATIONS (IntersectionObserver)
  // ========================================
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in');
    
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Show all elements immediately if reduced motion is preferred
      animatedElements.forEach(el => el.classList.add('visible'));
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -100px 0px', // Trigger when element is 100px from bottom
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Only animate once
        }
      });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
  }

  // Initialize scroll animations
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
  } else {
    initScrollAnimations();
  }

  // ========================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ========================================
  function smoothScrollTo(targetId) {
    const targetElement = document.querySelector(targetId);
    
    if (!targetElement) return;

    const headerHeight = header.offsetHeight;
    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = targetPosition - headerHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }

  // Handle all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Skip if it's just "#" or empty
      if (href === '#' || href === '') return;

      e.preventDefault();
      smoothScrollTo(href);
      
      // Update URL without jumping
      history.pushState(null, null, href);
    });
  });

  // ========================================
  // ACTIVE NAV LINK ON SCROLL
  // ========================================
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY;
    const headerHeight = header.offsetHeight;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - headerHeight - 100;
      const sectionId = section.getAttribute('id');
      const sectionBottom = sectionTop + sectionHeight;

      if (scrollY > sectionTop && scrollY <= sectionBottom) {
        // Remove active from all
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveNavLink();
        ticking = false;
      });
      ticking = true;
    }
  });

  // ========================================
  // FORM VALIDATION
  // ========================================
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validatePhone(phone) {
    // Brazilian phone format: (11) 99999-9999 or 11999999999
    const re = /^[\(]?[1-9]{2}[\)]?[\s]?[9]?[1-9]{4}[\-]?[0-9]{4}$/;
    return re.test(phone.replace(/\s/g, ''));
  }

  function showError(input, show = true) {
    const formGroup = input.closest('.form-group');
    const errorMessage = formGroup.querySelector('.form-error-message');
    
    if (errorMessage) {
      errorMessage.hidden = !show;
    }
    
    if (show) {
      formGroup.classList.add('form-error');
      input.setAttribute('aria-invalid', 'true');
    } else {
      formGroup.classList.remove('form-error');
      input.setAttribute('aria-invalid', 'false');
    }
  }

  function validateField(input) {
    const value = input.value.trim();
    const type = input.type;
    const isRequired = input.hasAttribute('required');

    // Check required
    if (isRequired && !value) {
      showError(input, true);
      return false;
    }

    // Check email format
    if (type === 'email' && value) {
      if (!validateEmail(value)) {
        showError(input, true);
        return false;
      }
    }

    // Check phone format (if provided)
    if (type === 'tel' && value) {
      if (!validatePhone(value)) {
        // Optional field, so just warn but don't block
        console.warn('Phone format may be incorrect');
      }
    }

    showError(input, false);
    return true;
  }

  function validateForm(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    
    let isValid = true;

    // Validate required fields
    if (!validateField(nameInput)) isValid = false;
    if (!validateField(emailInput)) isValid = false;
    
    // Validate optional phone if filled
    if (phoneInput.value.trim()) {
      validateField(phoneInput);
    }

    if (isValid) {
      // Form is valid - simulate submission
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      // Show loading state
      submitBtn.classList.add('btn-loading');
      submitBtn.disabled = true;
      
      // Simulate API call (replace with actual submission logic)
      setTimeout(() => {
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
        submitBtn.textContent = '✓ Enviado com sucesso!';
        
        // Reset form after delay
        setTimeout(() => {
          contactForm.reset();
          submitBtn.textContent = originalText;
        }, 3000);
        
        // Here you would typically send data to your backend
        console.log('Form submitted successfully');
      }, 1500);
    } else {
      // Focus first invalid field
      const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
      if (firstInvalid) {
        firstInvalid.focus();
      }
    }
  }

  if (contactForm) {
    contactForm.addEventListener('submit', validateForm);
    
    // Real-time validation on blur
    contactForm.querySelectorAll('.form-input').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      
      // Clear error on input
      input.addEventListener('input', () => {
        if (input.value.trim()) {
          showError(input, false);
        }
      });
    });
  }

  // ========================================
  // PRICING TOGGLE (Monthly/Annual)
  // ========================================
  function initPricingToggle() {
    if (!pricingToggle) return;

    pricingToggle.addEventListener('change', function() {
      const isAnnual = this.checked;
      
      // Update price displays
      const pricingCards = document.querySelectorAll('.card-pricing');
      
      pricingCards.forEach(card => {
        const amountEl = card.querySelector('.pricing-amount');
        const periodEl = card.querySelector('.pricing-period');
        
        if (!amountEl || !periodEl) return;

        // Get base prices from data attributes or use defaults
        const monthlyPrice = card.dataset.monthly || amountEl.textContent;
        const annualPrice = card.dataset.annual || 
          (parseInt(monthlyPrice.replace(/\D/g, '')) * 0.8).toFixed(0);

        if (isAnnual) {
          // Show annual price with discount
          amountEl.textContent = `R$ ${annualPrice}`;
          periodEl.textContent = 'por mês (cobrado anualmente)';
        } else {
          // Show monthly price
          amountEl.textContent = monthlyPrice;
          periodEl.textContent = 'por sessão';
        }
      });

      // Update toggle text states
      document.querySelectorAll('.toggle-text').forEach(text => {
        text.classList.toggle('active', 
          (isAnnual && text.textContent.includes('Mensal')) ||
          (!isAnnual && text.textContent.includes('Avulso'))
        );
      });
    });
  }

  initPricingToggle();

  // ========================================
  // KEYBOARD NAVIGATION ENHANCEMENTS
  // ========================================
  
  // Trap focus in mobile menu when open
  function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    });
  }

  if (mobileMenu) {
    trapFocus(mobileMenu);
  }

  // ========================================
  // LAZY LOADING ENHANCEMENT
  // ========================================
  function initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
      // Browser supports native lazy loading
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach(img => {
        img.src = img.src;
      });
    } else {
      // Fallback for browsers without support
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
      document.body.appendChild(script);
    }
  }

  initLazyLoading();

  // ========================================
  // PERFORMANCE: DEBOUNCE/THROTTLE UTILS
  // ========================================
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // ========================================
  // ANALYTICS TRACKING (Placeholder)
  // ========================================
  function trackEvent(eventName, eventData = {}) {
    // Replace with your analytics provider
    console.log(`Event: ${eventName}`, eventData);
    
    // Example: Google Analytics
    // if (window.gtag) {
    //   window.gtag('event', eventName, eventData);
    // }
  }

  // Track CTA clicks
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', () => {
      trackEvent('cta_click', {
        text: btn.textContent.trim(),
        href: btn.href || btn.parentElement.href
      });
    });
  });

  // ========================================
  // INITIALIZATION
  // ========================================
  console.log('Barberia Chique initialized ✓');

})();
