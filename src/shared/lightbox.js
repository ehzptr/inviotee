        /* lightbox */
        const shots = $$("[data-lb] img");
        let lb = 0;
        const showShot = i => { lb = gsap.utils.wrap(0, shots.length, i); $("#lbImg").src = shots[lb].src; $("#lbImg").alt = shots[lb].alt; };
        $$("[data-lb]").forEach((b, i) => b.addEventListener("click", () => { showShot(i); openDlg($("#dlgLb")); }));
        $("#lbPrev").addEventListener("click", () => showShot(lb - 1));
        $("#lbNext").addEventListener("click", () => showShot(lb + 1));