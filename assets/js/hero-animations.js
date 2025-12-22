/**
 * Scroll-Bound Scene Reveal Engine
 * Handles the multi-scene hero storytelling based on scroll progress
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const CONFIG = {
        damping: 0.08, // Smoothness (lower = smoother)
        mobileBreakpoint: 768
    };

    // --- State ---
    const state = {
        scrollProgress: 0, // 0 to 1
        targetProgress: 0,
        currentProgress: 0,
        isMobile: window.innerWidth <= CONFIG.mobileBreakpoint,
        rafId: null
    };

    // --- Elements ---
    const container = document.getElementById('hero-scroll-container');
    const stickyView = document.getElementById('hero-sticky-view');
    const scenes = document.querySelectorAll('.hero-scene');
    const progressBar = document.querySelector('.progress-fill');
    const floats = document.querySelectorAll('.float');

    if (!container || !stickyView) return;

    // --- Init ---
    function init() {
        if (!state.isMobile) {
            // Desktop: Start animation loop
            update();
            window.addEventListener('scroll', onScroll);
        } else {
            // Mobile: Use standard scroll (simplified)
            // Or use the same logic but without lerp for responsiveness
            update();
            window.addEventListener('scroll', onScroll);
        }
        window.addEventListener('resize', onResize);
    }

    // --- Scroll Handler ---
    function onScroll() {
        if (!container) return;

        // Calculate progress based on container's position in viewport
        // The container is tall (400vh). The sticky view locks it in place.
        // We want progress 0 when container top is at 0.
        // We want progress 1 when container bottom is at viewport bottom (or close to it).

        const containerRect = container.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const totalDist = containerRect.height - viewportHeight;

        // Distance Scrolled within container = -containerRect.top
        let rawProgress = -containerRect.top / totalDist;

        // Clamp 0 to 1
        state.targetProgress = Math.max(0, Math.min(1, rawProgress));
    }

    // --- Resize Handler ---
    function onResize() {
        state.isMobile = window.innerWidth <= CONFIG.mobileBreakpoint;
        onScroll(); // Recalc
    }

    // --- Main Loop ---
    function update() {
        // Lerp for smooth values
        // If mobile, snap instantly for responsiveness? Or keep smooth?
        // Let's keep smooth but faster for mobile
        const damping = state.isMobile ? 0.2 : CONFIG.damping;

        const diff = state.targetProgress - state.currentProgress;

        if (Math.abs(diff) > 0.0001) {
            state.currentProgress += diff * damping;
        } else {
            state.currentProgress = state.targetProgress;
        }

        render(state.currentProgress);

        // Run Gallery Parallax locally here too
        if (!state.isMobile) {
            galleryParallax();
        }

        state.rafId = requestAnimationFrame(update);
    }

    // --- Gallery Parallax Logic ---
    function galleryParallax() {
        // Logic from Plan Option B
        const galleryItems = document.querySelectorAll(".gallery-item img");
        if (!galleryItems.length) return;

        const scrollTop = window.scrollY;
        const viewportHeight = window.innerHeight;

        galleryItems.forEach((img, index) => {
            const rect = img.parentElement.getBoundingClientRect();
            // Only animate when in view
            if (rect.bottom > 0 && rect.top < viewportHeight) {
                const elementTop = rect.top + scrollTop; // Absolute top
                const distance = (scrollTop + viewportHeight - elementTop);

                // Option B: Direction Variation (Premium)
                // Speed variations
                const speed = 0.025 + (index % 5) * 0.005;
                // Direction: Even index moves up, Odd index moves down
                const direction = index % 2 === 0 ? 1 : -1;

                img.style.transform = `translateY(${distance * speed * direction}px) scale(1.15)`;
            }
        });
    }


    // --- Render Scenes ---
    function render(progress) {
        // 1. Update Progress Bar
        if (progressBar) {
            progressBar.style.width = `${progress * 100}%`;
        }

        /* 
           REFINED SCENE TIMING
           We have 4 Scenes (indices 0, 1, 2, 3).
           Total Progress: 0.0 to 1.0.
           
           Scene 0 (Intro): 0.0 - 0.20
           Scene 1 (Luxury): 0.20 - 0.50 (Longer hold)
           Scene 2 (Details): 0.50 - 0.75
           Scene 3 (CTA): 0.75 - 1.0
        */

        scenes.forEach((scene, index) => {
            const bg = scene.querySelector('.scene-bg');
            const content = scene.querySelector('.scene-content');
            const title = scene.querySelector('.scene-title');
            const subtitle = scene.querySelector('.scene-subtitle'); // Might be null

            let sceneOpacity = 0;
            let textOpacity = 0;
            let activeScale = 1.1;

            // Define timing windows for each scene
            let start, end, peakStart, peakEnd;

            if (index === 0) {
                // Scene 0: Visible from start, fades out around 0.2
                start = 0.0;
                end = 0.25;
                // It is base layer, always opacity 1 technically, but we can fade it out to black or let next scene cover
                sceneOpacity = 1;
                textOpacity = 1 - (progress * 4); // Fades out quickly by 0.25
            }
            else if (index === 1) {
                // Scene 1: "Experience Luxury"
                // Needs to appear, STAY, then fade.
                start = 0.15;
                end = 0.55;

                // Opacity Ramp Up: 0.15 - 0.25
                // Hold: 0.25 - 0.45
                // Fade Out: 0.45 - 0.55 (Covered by next)

                if (progress < start) sceneOpacity = 0;
                else if (progress < 0.25) sceneOpacity = (progress - start) / 0.10;
                else sceneOpacity = 1; // Stays visible until covered

                // Text Staggered Fade In
                // Text starts appearing LATER (at 0.35) so image has 10% scroll duration alone
                if (progress < 0.35) textOpacity = 0;
                else if (progress < 0.45) textOpacity = (progress - 0.35) / 0.10;
                else if (progress < 0.50) textOpacity = 1; // Hold text briefly
                else textOpacity = 1 - ((progress - 0.50) / 0.1); // Fade text out manually before scene change
            }
            else if (index === 2) {
                // Scene 2: "Details"
                start = 0.50;
                end = 0.8;

                if (progress < start) sceneOpacity = 0;
                else if (progress < 0.60) sceneOpacity = (progress - start) / 0.10;
                else sceneOpacity = 1;

                // Text
                if (progress < 0.60) textOpacity = 0;
                else if (progress < 0.70) textOpacity = (progress - 0.60) / 0.10;
                else textOpacity = 1;
            }
            else if (index === 3) {
                // Scene 3: "Final"
                start = 0.75;
                end = 1.0;

                if (progress < start) sceneOpacity = 0;
                else if (progress < 0.85) sceneOpacity = (progress - start) / 0.10;
                else sceneOpacity = 1;

                // Text
                if (progress < 0.85) textOpacity = 0;
                else if (progress < 0.95) textOpacity = (progress - 0.85) / 0.10;
                else textOpacity = 1;
            }


            // Apply Styles
            scene.style.opacity = sceneOpacity;

            // Parallax scale for active scene
            // Slight Zoom In effect as you scroll through it
            // Normalize progress for this scene
            if (index > 0) {
                activeScale = 1.1 + (0.05 * progress); // Subtle continuous zoom
            }

            if (bg) {
                bg.style.transform = `scale(${activeScale})`;
            }

            // Content Transform (Lift up)
            if (content) {
                // Slight parallax lift for text
                const lift = -30 * progress;
                // content.style.transform = `translateY(${lift}px)`;

                // Use opacity calculated above for text specific elements if we want STAGGER
                // But container also fades. 
                // Let's override container opacity for children if we want them to hide while container is vis?
                // No, container opacity clips children.
                // So sceneOpacity controls BG and Content container visibility.

                // WAIT: If we want text to fade in AFTER BG, sceneOpacity must be 1 (for BG) but text hidden?
                // Structure is: .hero-scene > .scene-bg AND .scene-content
                // So we can control them independently.
            }

            // Apply independent text params
            if (content) {
                content.style.opacity = textOpacity;
                // Add subtle slide up
                const slide = 20 * (1 - textOpacity);
                content.style.transform = `translateY(${slide}px)`;
            }

        });

        // 3. Floating Elements (Global Animation)
        // They rise continuously throughout the whole scroll
        const globalLift = -200 * progress; // Move up 200px total

        floats.forEach((f, i) => {
            const parallax = (i + 1) * 50;
            const rot = progress * 360 * (i % 2 === 0 ? 1 : -1);

            // Fade in floats initially
            const floatOpacity = Math.min(1, progress * 5); // Visible by progress 0.2

            f.style.transform = `translateY(${globalLift + (progress * parallax)}px) rotate(${rot}deg)`;
            f.style.opacity = floatOpacity;
        });
    }

    // Run
    init();
});
