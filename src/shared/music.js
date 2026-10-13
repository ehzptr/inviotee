        /* music */
        const music = $("#music"), btnMusic = $("#btnMusic");
        let userMuted = false;
        const setMusicIcon = on => {
            btnMusic.firstElementChild.className = "ph-fill text-xl " + (on ? "ph-speaker-high" : "ph-speaker-slash");
            btnMusic.setAttribute("aria-pressed", on);
        };
        function playMusic() {
            music.volume = 0;
            music.play().then(() => { gsap.to(music, { volume: 1, duration: 1.5, overwrite: true }); setMusicIcon(true); }).catch(() => setMusicIcon(false));
        }
        btnMusic.addEventListener("click", () => {
            userMuted = !music.paused;
            if (userMuted) { music.pause(); setMusicIcon(false); } else playMusic();
        });
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) { music.pause(); stopAuto(); }
            else if (opened && !userMuted) playMusic();
        });