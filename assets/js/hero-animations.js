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

        state.rafId = requestAnimationFrame(update);
    }

    // --- Render Scenes ---
    function render(progress) {
        // 1. Update Progress Bar
        if (progressBar) {
            progressBar.style.width = `${progress * 100}%`;
        }

        // 2. Determine Scenes
        // We have N scenes. Divide progress into slots.
        // e.g. 4 Scenes. 
        // Scene 0: 0.0 - 0.25
        // Scene 1: 0.25 - 0.50
        // ...

        const numScenes = scenes.length;
        const segmentSize = 1 / numScenes;

        scenes.forEach((scene, index) => {
            const bg = scene.querySelector('.scene-bg');
            const content = scene.querySelector('.scene-content');

            // Scene Logic
            // We want scenes to fade in/out.
            // Scene I is fully visible at (index * segmentSize).
            // It fades out as we move to (index+1).

            // Let's use a "Focus" curve.
            // Peak visibility at the center of its segment? 
            // OR: Sequential stack. Scene 0 is bottom. Scene 1 fades in over it. Scene 2 over 1.
            // This is better for "Reveal".

            // Stack logic:
            // Scene 0: Always Scale/Blur changes. Visible base.
            // Scene 1: Fades in from 0.0 to 0.25 (or start defined by index)

            // Revised Logic for "Adaline" feel:
            // Transition happens AT the boundary.
            // Scene 0 -> Scene 1 transition happens between 0.0 and 0.33 (if 4 scenes)

            // Let's make it simpler:
            // Each scene (except 0) has an opacity driven by progress.
            // Scene N opacity = map(progress, start, end)

            let sceneOpacity = 0;
            let scale = 1.1; // default zoomed out
            let blur = 10;

            // Timings (overlaps allowed)
            // Scene 0: Visible 0-0.25. (Fades OUT after 0.25?) 
            // Actually, usually subsequent scenes cover the previous ones.
            // So Scene 0 stays opacity 1. Scene 1 fades in over it.

            if (index === 0) {
                sceneOpacity = 1; // Base layer
                // Animate BG props
                // 0 -> 0.25: Scale 1.1 -> 1.0. Blur 10 -> 0.
                // But Scene 0 is start.
                // Let's say Scene 0 is the "Intro" (Blurry).
                // As we scroll, Scene 0 clarifies?

                // Let's follow prompt: "Scene transitions use opacity + subtle zoom"
                // "Scene fades out, Next scene fades in"

                // Let's treat them as sequential crossfades.
                // Center of Scene 0 is progress 0.0. Center of Scene 1 is 0.33. center of Scene 3 is 1.0.

                // Opacity Calculation
                // A generic bell curve or plateau for each scene based on progress
            }

            // PROMPT SPECIFIC:
            // Scene 1: 0.00 -> 0.25
            // Scene 2: 0.25 -> 0.50
            // ...

            const start = index * segmentSize;
            const end = (index + 1) * segmentSize;

            // In range?
            // We want distinct transitions. 
            // At progress = 0. We see Scene 0.
            // At progress = 0.25. We see Scene 1 (Scene 0 faded out or Scene 1 faded in).

            // Smooth Reveal: Scene `i` opacity ramps 0->1 as progress goes from `start-0.05` to `start+0.05`? 
            // Simpler:
            // Scene 0: Opacity 1 (Base).
            // Scene 1: Opacity = (progress - 0.2) * 5 ... clamped 0-1.
            // Scene 2: Opacity = (progress - 0.45) * 5 ...

            // Let's normalize progress for this specific scene's entry.
            // Entry point: `start`.
            // Transition duration: half a segment?

            // Logic: All scenes absolute. 
            // Update styles based on: Is this scene active?

            // BETTER APPROACH for "Appearing":
            // Opacity = 0 initially.
            // If progress > start, opacity ramps up.
            // If progress > end, opacity ramps down? (Or stays 1 if it's the new background).
            // Usually in scroll-jacking, the new scene COVERS the old one. So we don't need to fade out the old one.
            // We just fade in the new one on top.

            if (index === 0) {
                sceneOpacity = 1; // Always visible at bottom
            } else {
                // Fade in as we approach its start time
                // e.g. Scene 1 starts at 0.25.
                // We want it to start fading in at 0.15 and be done by 0.25.

                // entry progress
                const fadeStart = start - (segmentSize * 0.5);
                const fadeEnd = start;

                // Map currentProgress to 0-1 within fadeStart/fadeEnd
                let fadeP = (progress - fadeStart) / (fadeEnd - fadeStart);
                sceneOpacity = Math.max(0, Math.min(1, fadeP));
            }

            // Apply Styles
            scene.style.opacity = sceneOpacity;

            // Parallax / Zoom effect for active scene
            // If scene is becoming visible or is visible
            // Scale starts at 1.1, goes to 1.0 as it settles.

            // Scale logic: 
            // Scale = 1.1 - (0.1 * normalizedSceneProgress)
            // Normalized progress for scene duration:
            const sceneP = (progress - (start - segmentSize)) / (segmentSize * 2);
            // Simple rough lerp for movement

            const activeScale = 1.1 - (0.1 * Math.min(1, Math.max(0, sceneP)));

            // Blur logic: 10px -> 0px
            const activeBlur = 10 * (1 - Math.min(1, Math.max(0, sceneP * 2))); // Blur clears quickly

            if (bg) {
                bg.style.transform = `scale(${activeScale})`;
                // bg.style.filter = `blur(${activeBlur}px)`; // Filter is expensive, use cautiously
                // Use opacity for performance on mobile
                if (!state.isMobile) {
                    // bg.style.filter = `blur(${activeBlur}px)`;
                }
            }

            // Content Transform (Lift up)
            if (content) {
                const lift = 50 * (1 - sceneOpacity); // Starts 50px down, moves to 0
                content.style.transform = `translateY(${lift}px)`;
                content.style.opacity = sceneOpacity; // Sync text opacity
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
