# Branching and release workflow

The release path is `dev` → `staging` → `main`. GitHub Actions checks the Go
backend, frontend, and media service before promotion. Render should deploy the
production services from `main`, not from `dev` or `staging`.

## What happens automatically

1. A push to `dev` runs the **Quality Gates** workflow: Go tests, vet and build;
   frontend lint and build; and Python media-service tests.
2. After those checks pass, **Promote dev to staging** opens or updates a PR
   from `dev` to `staging` and enables squash auto-merge. GitHub merges it only
   after the required `Quality Gates` check passes.
3. Promotion from `staging` to `main` is intentionally manual: open a PR from
   `staging` to `main`. Quality Gates run on the PR, and a required human review
   must approve it before it can merge and reach production.

## One-time GitHub repository settings

In **Settings → General → Pull Requests**, enable **Allow auto-merge**.

In **Settings → Actions → General → Workflow permissions**, allow GitHub Actions
to create and approve pull requests. The promotion workflow uses the built-in
`GITHUB_TOKEN`; no personal access token or repository secret is needed.

Create branch rules (Settings → Rules → Rulesets, or Branches → Branch
protection rules) for `staging` and `main`:

- Require a pull request before merging and require the **Quality Gates**
  check.
- For `main`, require at least one approving review and dismiss stale
  approvals. Do not allow direct pushes, force pushes, or deletion.
- For `staging`, do not require a human approval; keep the required pull request
  and status check so the automated promotion can merge after CI passes.

If GitHub branch rules have not been enabled, the workflows can run but GitHub
cannot enforce the approval and required-check gates. Keep Render's production
services configured to deploy from `main`.
