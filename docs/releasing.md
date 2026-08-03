# Releasing civet-clint

This document outlines the release policy, dist-tag strategy, CI/CD automation, and release checklist for `civet-clint`.

---

## 1. Versioning & SemVer Policy

`civet-clint` adheres strictly to [Semantic Versioning 2.0.0](https://semver.org/):

- **Major (`X.0.0`)**: Breaking changes to CLI flags, public programmatic API exports, configuration schema, or dropping supported Node.js / Civet major versions.
- **Minor (`0.X.0` or `X.Y.0`)**: New lint rules, new presets, new CLI options, backwards-compatible configuration features.
- **Patch (`0.X.Y` or `X.Y.Z`)**: Bug fixes, rule false-positive fixes, compiler-equivalence improvements, internal refactoring.
- **Pre-releases (`X.Y.Z-alpha.N` / `X.Y.Z-beta.N` / `X.Y.Z-rc.N`)**: Early validation releases published under pre-release dist-tags.

### Git Tag Invariant
- Every release must correspond to a Git tag formatted as `v<version>` (e.g. `v0.1.0-alpha.1`, `v0.1.0`).
- **Critical Invariant**: The Git tag version **must match exactly** the `version` field declared in `package.json` and `package-lock.json`. The CI publish workflow enforces this equality before publishing.

---

## 2. npm Dist-Tags: `next` vs `latest`

To ensure stability for consumers, `civet-clint` uses dist-tags:

| Tag | Target Versions | Audience | Install Command |
|---|---|---|---|
| `next` | `*-alpha.*`, `*-beta.*`, `*-rc.*` | Early adopters, integration testing in downstream codebases (e.g. Ranked) | `npm i -D civet-clint@next` |
| `latest` | `0.1.0`, `1.0.0`, etc. (stable) | General production usage | `npm i -D civet-clint` |

> **Initial Alpha Releases**: All `0.1.0-alpha.*` releases are published with `--tag next`. `latest` will only be pointed at the first stable release (`0.1.0` or `1.0.0`).

---

## 3. Automated Publish Pipeline

Publishing is automated via GitHub Actions in [`.github/workflows/publish.yml`](../.github/workflows/publish.yml):

- **Triggers**:
  - GitHub Release published, OR
  - Push of a Git tag matching `v*`, OR
  - Manual `workflow_dispatch` **against a `v<version>` tag ref**. Dispatching
    from a branch fails the version-verification step by design.
- **Security & Permissions**:
  - Authenticates via npm Trusted Publishing (OIDC, `id-token: write`). No npm
    token is stored as a repository or environment secret.
  - Protected `npm` deployment environment, restricted to `v*` tags.
  - Read-only repository access (`contents: read`).
- **Validation Gates**:
  - Refuses to run from any non-tag ref, and requires the `v<version>` tag format.
  - Verifies Git tag version equals `package.json` version.
  - Runs `npm run release:check` (build, tests, types, self-lint, pack dry-run, packaged smoke-test).
  - Publishes with `--access public --tag <tag> --provenance`.
- **Safety**:
  - NEVER triggers on pull requests or ordinary branch pushes.

---

## 4. Release Checklist

### Pre-Release Verification (Local)

1. Ensure the working tree is clean on `main` branch.
2. Run full release verification suite:
   ```bash
   npm run release:check
   ```
3. Verify package contents with dry-run:
   ```bash
   npm pack --dry-run
   ```
   Confirm only `dist/`, `bin/`, `README.md`, `LICENSE`, and `package.json` are packaged.

### Creating the Release

1. Bump version in `package.json` and `package-lock.json`:
   ```bash
   npm version <version> --no-git-tag-version
   ```
2. Update `CHANGELOG.md` with the new version section and date.
3. Commit and push:
   ```bash
   git add package.json package-lock.json CHANGELOG.md
   git commit -m "chore(release): v<version>"
   git push origin main
   ```
4. Create and push the Git tag:
   ```bash
   git tag -a v<version> -m "Release v<version>"
   git push origin v<version>
   ```
5. Create a GitHub Release referencing the tag and pasting the `CHANGELOG.md` entry.
6. The GitHub Actions publish workflow will trigger, run checks, and publish to npm.

---

## 5. First-Time Setup for Maintainers

This setup is already complete and is recorded here for reference:

1. `0.1.0-alpha.1` was published manually to claim the package name. npm requires
   a package to exist before Trusted Publishing can be configured for it, so this
   bootstrap step cannot be automated.
2. Trusted Publishing (OIDC) is configured under `civet-clint` settings on
   npmjs.com, linked to `shogi-dojo/civet-clint`, workflow `publish.yml`,
   environment `npm`, with only `npm publish` allowed.
3. The protected `npm` environment exists in GitHub repository settings and is
   restricted to `v*` tags.

Because npm points `latest` at the first version published to a new package, the
`latest` tag was removed after the bootstrap publish: `latest` must not resolve to
a prerelease. It will be set when the first stable version ships.

---

## 6. Deprecation & Rollback

In the event that an emergency flaw is discovered in a published version:

- **Never unpublish** if more than 72 hours have passed or if dependents may be broken.
- Mark the flawed version as deprecated on npm:
  ```bash
  npm deprecate civet-clint@<version> "Critical issue with <description>; please upgrade to <fixed-version>"
  ```
- If a pre-release on `@next` needs rollback:
  ```bash
  npm dist-tag add civet-clint@<previous-good-version> next
  ```
- Publish a patch release resolving the defect as soon as possible.
