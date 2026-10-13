        /* countdown */
        const cd = $("#countdown"), nums = $$(".tabular-nums", cd), done = $("#cdDone"), target = new Date(cd.dataset.datetime).getTime();
        function tick() {
            const ms = target - Date.now();
            cd.hidden = ms <= 0;
            done.hidden = ms > 0;
            const s = Math.max(0, Math.floor(ms / 1000));
            [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60].forEach((v, i) => nums[i].textContent = v);
        }
        tick();
        setInterval(tick, 1000);