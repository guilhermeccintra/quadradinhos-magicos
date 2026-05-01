// Optional: Add simple interactions to make the page feel alive

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add a simple intersection observer to trigger animations when scrolling
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply fade-in to section titles and cards
    const elementsToAnimate = document.querySelectorAll('.section-title, .benefit-card, .step, .diff-item, .gallery-item');
    
    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // --- Meta Conversions API Trigger ---
    function sendCAPIEvent(eventName) {
        // Generate a unique ID for deduplication (matches pixel event if we were sending custom events via pixel too)
        const eventId = 'evt_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        
        fetch('/api/conversions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                eventName: eventName,
                eventId: eventId,
                eventSourceUrl: window.location.href,
                clientUserAgent: navigator.userAgent,
                // In a real production setup, you would grab IP from the backend, not frontend.
                // The local Node server should ideally capture req.ip, but for this basic setup we pass it like this.
            })
        })
        .then(response => response.json())
        .then(data => console.log('CAPI Event Sent:', data))
        .catch(error => console.error('Error sending CAPI Event:', error));
    }

    // Trigger PageView on load via API
    sendCAPIEvent('PageView');
});
