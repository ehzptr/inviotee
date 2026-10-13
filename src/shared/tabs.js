        /* tabs: gift (transfer / kado) and rsvp (konfirmasi / ucapan) share one helper */
        function tabset(tabSel, panelSel) {
            const tabs = $$(tabSel), panels = $$(panelSel);
            const show = (i, anim) => {
                tabs.forEach((t, j) => t.setAttribute("aria-selected", j === i));
                panels.forEach((p, j) => p.hidden = j !== i);
                if (anim) gsap.from(panels[i], { autoAlpha: 0, y: 8, duration: .4 * k, ease: "expo.out" });
            };
            tabs.forEach((b, i) => b.addEventListener("click", () => { stopAuto(); show(i, true); }));
            show(0);
            return show;
        }
        tabset("[data-gift]", "[data-gift-panel]");
        const showRsvpTab = tabset("[data-rt]", "[data-rp]");