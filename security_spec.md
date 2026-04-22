# Security Specification - KCCA CitizenLink

## Data Invariants
- A User must have a valid role ('citizen', 'official', 'responder').
- A Report must have a type, description, and location.
- Only Officials can broadcast Alerts.
- Only Officials or Responders can update Report status.
- Users cannot change their own roles.

## Access Patterns
- `users/{userId}`: 
  - Read: Owner or Official.
  - Write: Owner (profile fields only, no role change).
- `reports/{reportId}`:
  - Read: All authenticated users (public awareness).
  - Create: Authenticated users.
  - Update: Reporter (only mutable fields like description/media) or Official (status/verified).
- `alerts/{alertId}`:
  - Read: All authenticated users.
  - Write: Officials only.

## The Dirty Dozen (Test Scenarios)
1. User trying to set their role to 'official' on signup.
2. Citizen trying to broadcast an alert.
3. User trying to update status of someone else's report.
4. User trying to read another user's PII (if any).
5. User trying to post a report with a massive 1MB description.
6. User trying to update a report after it's been marked 'resolved' by an official.
7. Spoofed email auth (not verified) trying to post a report.
8. Attacker injecting non-ASCII characters into document IDs.
9. Attacker flooding the system with reports skipping server timestamps.
10. Attacker modifying the 'verified' flag on their own report.
11. Attacker trying to delete an alert.
12. Attacker trying to read the 'users' collection as a list without proper filters.
