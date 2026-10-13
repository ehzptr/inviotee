/* guest QR: encodes this guest's invitation link; the library loads the first time the dialog opens */
let qrDone = false;
function renderQr() {
    if (qrDone) return;
    qrDone = true;
    const box = $("#qrBox"), s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/qrcode-generator@2.0.4/dist/qrcode.js";
    s.integrity = "sha384-e9EFD6BGC90bkW9aDV5xbbBfzwN7G8YImHao2lfLVKV/hPB0E0go+H3I64h7oHtA";
    s.crossOrigin = "anonymous";
    s.onload = () => {
        const q = qrcode(0, "M");
        q.addData(location.origin + location.pathname + "?to=" + encodeURIComponent(guest) + "&group=" + encodeURIComponent(qs.get("group") || "VIP"));
        q.make();
        box.innerHTML = q.createSvgTag({ cellSize: 6, margin: 4, scalable: true });
        const svg = box.firstElementChild;
        svg.setAttribute("width", "180"); svg.setAttribute("height", "180");
        svg.setAttribute("role", "img"); svg.setAttribute("aria-label", "QR code tamu");
    };
    s.onerror = () => { qrDone = false; box.textContent = "QR tidak dapat dimuat. Periksa koneksi."; };
    document.head.append(s);
}
$("#btnQr").addEventListener("click", renderQr);
