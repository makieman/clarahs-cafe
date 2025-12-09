const hero = document.getElementById("hero");
const layers = document.querySelectorAll(".layer");
const coffee = document.querySelector(".fg .coffee");
const floats = document.querySelectorAll(".float");
const heroText = document.querySelector(".hero-text");
const fgLayer = document.querySelector(".layer.fg");

let scrollY = 0;
let locked = true;
let animationStage = 0;

// Check if mobile device
const isMobile = window.innerWidth <= 768;
function animateFloat(el, delay, index) {
    setTimeout(() => {
        const randomX = (Math.random() - 0.5) * 150;
        const randomY = Math.random() * -250 - 50;
        const randomRotate = (Math.random() - 0.5) * 30;

        el.style.transform = `translateY(${randomY}px) translateX(${randomX}px) rotate(${randomRotate}deg) scale(1)`;
        el.style.opacity = 0.8;
    }, delay * 1000);
}
function handleScroll(e) {
    if (!locked) return;

    e.preventDefault();

    // Accumulate scroll
    scrollY += e.deltaY * 0.3;
    scrollY = Math.max(0, Math.min(scrollY, 600)); // Clamp between 0 and 600

    // Skip parallax on mobile for performance
    if (!isMobile) {
        // Animate layers based on scroll with different speeds
        layers.forEach(layer => {
            const speed = parseFloat(layer.dataset.speed) || 0.5;
            layer.style.transform = `translateY(${-scrollY * speed}px)`;
        });
    }

    // STAGE 1: Show foreground layer (0-100)
    if (scrollY > 50 && animationStage < 1) {
        animationStage = 1;
        fgLayer.style.opacity = 1;
    }

    // STAGE 2: Animate coffee cup (100-200)
    if (scrollY > 150 && animationStage < 2) {
        animationStage = 2;
        coffee.style.opacity = 1;
        coffee.style.transform = "scale(1) rotate(0deg)";
    }

    // STAGE 3: Show hero text (200-350)
    if (scrollY > 250 && animationStage < 3) {
        animationStage = 3;
        heroText.style.opacity = 1;
        heroText.style.transform = "translateY(0)";
    }

    // STAGE 4: Animate floating elements (350-450)
    if (scrollY > 350 && animationStage < 4) {
        animationStage = 4;
        floats.forEach((f, i) => animateFloat(f, i * 0.3, i));
    }

    // STAGE 5: Unlock scroll (450+)
    if (scrollY > 500 && locked) {
        locked = false;
        document.body.style.overflowY = "auto";
        hero.style.pointerEvents = "auto";

        // Add a slight delay before allowing natural scroll
        setTimeout(() => {
            window.removeEventListener("wheel", handleScroll);
        }, 300);
    }
}
window.addEventListener("wheel", handleScroll, { passive: false });
let touchStartY = 0;
let touchCurrentY = 0;

hero.addEventListener("touchstart", (e) => {
    if (!locked) return;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

hero.addEventListener("touchmove", (e) => {
    if (!locked) return;

    touchCurrentY = e.touches[0].clientY;
    const deltaY = touchStartY - touchCurrentY;

    // Simulate wheel event
    handleScroll({ deltaY: deltaY * 2, preventDefault: () => { } });

    touchStartY = touchCurrentY;
}, { passive: true });

const exploreBtn = document.querySelector(".hero-text button");
if (exploreBtn) {
    exploreBtn.addEventListener("click", () => {
        // Unlock scroll first
        locked = false;
        document.body.style.overflowY = "auto";
        hero.style.pointerEvents = "auto";

        // Smooth scroll to gallery
        const gallerySection = document.getElementById("gallery-grid");
        if (gallerySection) {
            gallerySection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
}


window.addEventListener("load", () => {
    // Ensure hero is at top on load
    window.scrollTo(0, 0);
    document.body.style.overflowY = "hidden";
});

let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Recalculate mobile detection
        const newIsMobile = window.innerWidth <= 768;
        if (newIsMobile !== isMobile) {
            location.reload(); // Reload to reapply mobile optimizations
        }
    }, 250);
});
