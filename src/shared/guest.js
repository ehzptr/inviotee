        /* guest from ?to=Nama&group=VIP */
        const qs = new URLSearchParams(location.search);
        const guest = qs.get("to") || "Nama Tamu";
        $$("[data-guest]").forEach(e => e.textContent = guest);
        $$("[data-group]").forEach(e => e.textContent = qs.get("group") || "VIP");