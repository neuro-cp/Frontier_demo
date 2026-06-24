# Client Portal Access

## Current Foundation

Client portal access is company-initiated.

Flow:

1. Owner or Manager opens a client record.
2. Owner or Manager creates a client portal invite.
3. Frontier stores only a hash of the invite token.
4. The raw invite token is shown once as a copyable link.
5. The invited user signs in and accepts the invite.
6. Frontier links the auth user to `client_portal_access`.

No public company search is implemented.

## Safety Boundaries

- Client portal users only receive access through `client_portal_access`.
- Invite tokens are hashed before storage.
- Invalid, expired, revoked, or already accepted tokens fail safely.
- Portal pages show no data if the signed-in user has no active client portal access.
- Business record mutations are not implemented in the client portal yet.

## Future Link-Code Flow

Later, Frontier can add a secondary company-code workflow:

1. Company generates a short portal link code.
2. Client signs in and enters the code.
3. Company settings decide whether access requires manual approval or can auto-approve.
4. Approved access creates a `client_portal_access` row.

This flow is not implemented yet.
