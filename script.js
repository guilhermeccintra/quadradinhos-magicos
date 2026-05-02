// ===========================
// TOP BAR: Data e Countdown até Meia-Noite
// ===========================
function formatDate(d) {
    const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    return `${d.getDate()} de ${months[d.getMonth()]}`;
}

function updateCountdown() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;

    const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

    const el = document.getElementById('countdown');
    if (el) el.textContent = `${h}:${m}:${s}`;
}

function initTopBar() {
    const now = new Date();
    // Set date in topbar
    document.querySelectorAll('#topbarDate').forEach(el => el.textContent = formatDate(now));
    // Set date in bonus section
    document.querySelectorAll('.bonus-today-date').forEach(el => el.textContent = formatDate(now));

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ===========================
// UPSELL MODAL
// ===========================
function showUpsellModal(e) {
    e.preventDefault();
    document.getElementById('upsellModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeUpsellModal() {
    document.getElementById('upsellModal').classList.remove('active');
    document.body.style.overflow = '';
    // Redirect to basic plan
    window.location.href = 'https://pay.lowify.com.br/checkout?product_id=DOfDfG';
}

// Close modal on overlay click
document.addEventListener('DOMContentLoaded', () => {
    initTopBar();

    document.getElementById('upsellModal').addEventListener('click', function(e) {
        if (e.target === this) closeUpsellModal();
    });

    // Scroll animations
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section-title, .benefit-card, .bonus-card, .pricing-card, .faq-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        observer.observe(el);
    });

    // Meta CAPI
    function sendCAPIEvent(eventName) {
        const eventId = 'evt_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        fetch('/api/conversions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventName,
                eventId,
                eventSourceUrl: window.location.href,
                clientUserAgent: navigator.userAgent,
            })
        }).catch(() => {});
    }

    sendCAPIEvent('PageView');
});
