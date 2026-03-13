Here are the details for **task 001**:

| Field | Value |
|-------|-------|
| **ID** | 001 |
| **Title** | Fix login SSO bug |
| **Status** | in-progress |
| **Priority** | high |
| **Effort** | medium |
| **Type** | bug |
| **Tags** | auth, urgent |
| **Created** | 2026-03-01 |

**Objective:** Fix the login flow when users authenticate via SSO. The callback handler doesn't properly validate the SAML response, causing intermittent login failures for enterprise users.

**Progress (1/4 tasks done):**
- [x] Reproduce the bug with a test SSO provider
- [ ] Add SAML response validation in the callback handler
- [ ] Handle expired SSO sessions gracefully
- [ ] Add error logging for failed SSO attempts

**Acceptance Criteria:**
- SSO login works reliably with SAML 2.0 providers
- Expired sessions show a user-friendly error message
- Failed SSO attempts are logged with correlation IDs
