        /* copy */
        document.addEventListener("click", async e => {
            const b = e.target.closest("[data-copy]");
            if (!b) return;
            try { await navigator.clipboard.writeText(b.dataset.copy); } catch { return; }
            const t = b.textContent;
            b.textContent = "Disalin";
            setTimeout(() => b.textContent = t, 2000);
        });