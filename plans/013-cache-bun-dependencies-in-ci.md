# Plan 013: Cache Bun dependencies in GitHub Actions

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in "STOP conditions" occurs, stop and report — do not
> improvise. When done, update the status row for this plan in
> `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 78eddce..HEAD -- .github/workflows/static.yml`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `78eddce`, 2026-10-13

## Why this matters

The deploy workflow runs `bun install --frozen-lockfile` on every push with no cache. On a cold runner this downloads Tailwind, concurrently, and the rest of the dependency graph each time, adding avoidable minutes to CI. Caching Bun's install cache by lockfile hash makes repeat builds faster while keeping the lockfile as the source of truth.

## Current state

`.github/workflows/static.yml` deploy job (current):

```yaml
      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
      - name: Install dependencies
        run: bun install --frozen-lockfile
      - name: Build
        run: bun run build
      - name: Check build
        run: bun run check
```

Bun stores its download cache at `~/.bun/install/cache`. The lockfile is `bun.lock`.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Read workflow | `sed -n '30,45p' .github/workflows/static.yml` | the STEP excerpt above |
| Edit | insert the cache step shown below | YAML remains valid |
| Parse YAML | `python3 -c "import yaml;yaml.safe_load(open('.github/workflows/static.yml'))"` | exit 0 |
| Build (local, unaffected) | `bun run build` | exit 0 |
| Check (local, unaffected) | `bun run check` | exit 0 |

## Scope

**In scope** (the only files you should modify):
- `.github/workflows/static.yml`

**Out of scope** (do NOT touch, even though they look related):
- `package.json`, `bun.lock`, and any dependency version.
- `build.mjs`, `scripts/*`, templates, and other workflows.
- Do not switch package managers or the install command's `--frozen-lockfile` flag.

## Git workflow

- Branch: `advisor/013-cache-ci-dependencies`
- Commit message style: imperative, as in prior plans (`Cache Bun dependencies in GitHub Actions`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Insert a cache step before install

1. Open `.github/workflows/static.yml`.
2. Between the `Setup Bun` step and the `Install dependencies` step, insert:

```yaml
      - name: Cache Bun dependency cache
        uses: actions/cache@v4
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('bun.lock') }}
          restore-keys: |
            ${{ runner.os }}-bun-
```

Keep the existing `Install dependencies` step unchanged and run after the cache step:

```yaml
      - name: Install dependencies
        run: bun install --frozen-lockfile
```

Resulting order:

```yaml
      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
      - name: Cache Bun dependency cache
        uses: actions/cache@v4
        ...
      - name: Install dependencies
        run: bun install --frozen-lockfile
      - name: Build
        run: bun run build
      - name: Check build
        run: bun run check
```

**Verify**: `python3 -c "import yaml;yaml.safe_load(open('.github/workflows/static.yml'))"` exits 0 with no output.

### Step 2: Confirm the rest of the workflow is untouched

1. `grep -n "bun run build\|bun run check\|bun install --frozen-lockfile" .github/workflows/static.yml`
   - Expected: one match each for build, check, and install.
2. `grep -n "actions/cache@v4" .github/workflows/static.yml`
   - Expected: one match.

**Verify**: both commands return the expected counts.

### Step 3: Local sanity (CI cannot be run locally)

1. `bun run build`
2. `bun run check`

**Verify**: both commands exit 0. (No local CI execution is required or expected.)

## Test plan

No runtime tests; verification is YAML parsing plus the unchanged local build/check commands. The cache key depends on `bun.lock`, so cache misses occur automatically when dependencies change, which is the desired behavior.

## Done criteria

- [ ] Workflow YAML parses (`python3 -c "import yaml;yaml.safe_load(...)"` exit 0)
- [ ] `actions/cache@v4` step present between Setup Bun and Install dependencies
- [ ] Cache key includes `${{ hashFiles('bun.lock') }}`
- [ ] `bun install --frozen-lockfile`, `bun run build`, and `bun run check` steps unchanged and present once each
- [ ] `bun run build && bun run check` exit 0
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- The runner environment's Bun cache path differs from `~/.bun/install/cache` (verify before finalizing; fall back to `~/.bun` if needed, but report the change).
- Adding the cache step makes YAML invalid (fix indentation before proceeding).
- The operator uses a different cache mechanism (e.g., `setup-bun`'s built-in cache) — follow their preference instead of `actions/cache`, and record the reason in the commit message.
- `bun run build` or `bun run check` fails locally — unrelated to this change, but do not proceed until fixed.

## Maintenance notes

- Cache misses are expected after every lockfile change; this is correct and keeps installs reproducible.
- If the workflow is reorganized (e.g., dependency scanning added), keep the cache step immediately before install.
- `restore-keys` allows a partial restore when the lockfile changed, which speeds the new install.
