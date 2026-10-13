        const RSVP_ENDPOINT = ""; // POST JSON {name, phone, attendance, message}; empty = demo mode, comments stay on this page
        /* rsvp */
        const form = $("#rsvpForm"), status = $("#rsvpStatus"), send = $("#rsvpSend");
        function addComment({ attendance, message }) {
            const n = $("#tplComment").content.cloneNode(true);
            n.querySelector("[data-i]").textContent = guest.trim()[0]?.toUpperCase() || "?";
            n.querySelector("[data-n]").textContent = guest;
            n.querySelector("[data-a]").textContent = attendance;
            n.querySelector("[data-m]").textContent = message;
            n.querySelector("[data-t]").textContent = new Date().toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" });
            $("#noComments").hidden = true;
            $("#comments").prepend(n);
            $("#cCount").textContent = $$("#comments article").length;
        }
        form.addEventListener("submit", async e => {
            e.preventDefault();
            const body = {
                name: guest,
                phone: $("#rCode").value + $("#rPhone").value.replace(/^0/, ""),
                attendance: new FormData(form).get("att"),
                message: $("#rMsg").value.trim(),
            };
            send.disabled = true; send.textContent = "Mengirim…"; status.textContent = "";
            try {
                if (RSVP_ENDPOINT) {
                    const r = await fetch(RSVP_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                    if (!r.ok) throw new Error(r.status);
                }
                addComment(body);
                status.textContent = RSVP_ENDPOINT ? "Terima kasih, konfirmasi Anda sudah kami terima." : "Mode contoh: ucapan hanya tampil di halaman ini.";
                form.reset();
                showRsvpTab(1, true);
            } catch {
                status.textContent = "Gagal mengirim. Periksa koneksi lalu coba lagi.";
            } finally {
                send.disabled = false; send.textContent = "Kirim";
            }
        });
