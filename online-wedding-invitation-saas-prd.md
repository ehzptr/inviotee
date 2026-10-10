# Product Requirements Document (PRD)
## Online Wedding Invitation SaaS

**Version:** 0.2  
**Date:** 10 October 2026  
**Status:** Draft  
**Initial market:** Indonesia  
**Business model:** One-time payment per invitation  
**Editor model:** Section-based editor  
**Technology stack:** Undecided

---

## 1. Product Vision

Build a self-service SaaS platform that enables Indonesian couples to create, customize, purchase, publish, and share attractive digital wedding invitation websites without coding.

The MVP focuses on the core invitation-building experience. Reseller management, affiliate commissions, and the vendor marketplace are deferred to later releases.

### 1.1 Value Proposition

- Create a wedding invitation without coding.
- Personalize content, images, colors, and predefined sections.
- Share one link through WhatsApp, social media, or other channels.
- Collect RSVP responses digitally.
- Pay once per invitation rather than commit to recurring billing.

## 2. Target Users

| User | Main problem | Desired outcome |
|---|---|---|
| Couples | Traditional invitations can be expensive or difficult to update. | Create an attractive invitation quickly at a predictable price. |
| Wedding guests | Event details can be difficult to find. | Open a mobile-friendly link and view event details easily. |
| Platform administrators | Templates, orders, and content need consistent management. | Operate the platform without manually editing customer websites. |

## 3. Scope and Release Boundaries

### 3.1 MVP — Must Have

- Registration, login, and user dashboard.
- Invitation template catalog.
- Section-based invitation editor.
- Live preview and responsive public pages.
- Draft persistence.
- One-time purchase and payment verification.
- Unique public invitation URLs.
- Guest-facing RSVP form.
- Basic invitation and RSVP management.
- Administrative management of templates, orders, and users.

### 3.2 Post-MVP — Later Releases

- Reseller and client-management portals.
- Affiliate tracking and commission payouts.
- Vendor marketplace and booking workflows.
- Subscription plans and recurring billing.
- Advanced free-form drag-and-drop canvas editor.
- Custom domains.
- Multi-language support.
- Advanced analytics.
- Automated WhatsApp messaging and integrations.
- Individual guest tokens, seating arrangements, and QR-code check-in.

## 4. Functional Requirements

Priority definitions: **P0** = required for MVP launch; **P1** = valuable soon after launch; **P2** = later phase.

### 4.1 Account and Dashboard

**Module:** `FR-ACC` · **Priority:** P0

| ID | Requirement | Acceptance criteria |
|---|---|---|
| ACC-01 | Register with email and password. | Valid registration creates one account; invalid or duplicate email is rejected with a clear message. |
| ACC-02 | Log in and log out securely. | Valid credentials grant access; invalid credentials do not reveal unnecessary account information. |
| ACC-03 | View the user's invitations. | The dashboard shows each invitation's title, event date, status, and available actions. |
| ACC-04 | Create an invitation draft. | A user can start a new invitation without publishing or paying immediately. |
| ACC-05 | Manage account details. | A user can view and update supported profile fields and change their password securely. |

**Business rules**
- Every invitation belongs to an owner account.
- Users can only view and edit invitations they own.
- Invitations can be saved as drafts before purchase.
- Deleting an invitation must not affect another user's data or erase associated financial records.

### 4.2 Template Catalog

**Module:** `FR-TPL` · **Priority:** P0

| ID | Requirement | Acceptance criteria |
|---|---|---|
| TPL-01 | Browse invitation templates. | The catalog displays template previews, names, styles, and applicable prices. |
| TPL-02 | Preview a template. | Users can open a representative preview before selecting it. |
| TPL-03 | Start an invitation from a template. | Selecting a template creates a draft with its initial content and layout. |
| TPL-04 | Filter templates. | Users can filter by available categories, such as minimalist, floral, traditional, or modern. |
| TPL-05 | Administer templates. | Admins can publish, unpublish, and update catalog metadata without directly editing customer data. |

**Business rules**
- Templates are platform-managed; users customize their own invitation instances.
- Unpublishing a template prevents new selections but should not automatically break existing invitations.
- The price shown in the catalog must match the price used at checkout.

### 4.3 Section-Based Invitation Editor

**Module:** `FR-EDT` · **Priority:** P0

The editor uses predefined sections rather than unrestricted drag-and-drop. Users customize supported fields while the template controls layout and visual structure.

#### Proposed Invitation Sections

- **Cover:** names, headline, cover photo, opening screen.
- **Couple profiles:** names, photos, and optional family details.
- **Event details:** date, time, venue, and ceremony or reception details.
- **Location:** venue address, map link, and directions.
- **Gallery:** couple photos and optional engagement photos.
- **RSVP and wishes:** attendance response and guest messages.

| ID | Requirement | Acceptance criteria |
|---|---|---|
| EDT-01 | Edit text and event information. | Changes appear in the preview and persist after saving and reopening the editor. |
| EDT-02 | Upload and replace images. | Supported formats and size limits are enforced; failed uploads produce clear errors. |
| EDT-03 | Customize supported visual settings. | Users can change template-approved colors, typography options, and other exposed settings. |
| EDT-04 | Enable or disable optional sections. | Supported sections can be hidden or shown without breaking page layout. |
| EDT-05 | Reorder supported sections. | If the template allows reordering, the published page follows the saved order. |
| EDT-06 | Preview changes. | Users can preview desktop and mobile layouts before publication. |
| EDT-07 | Save progress. | A saved draft can be restored after navigating away or refreshing the page. |
| EDT-08 | Validate required information. | Missing mandatory fields are identified before publishing. |
| EDT-09 | Protect published content during editing. | Users can prepare changes without accidentally exposing incomplete content on the live page. |

**Editor rules and assumptions**
- Autosave is preferred, with visible save status and recoverable failures.
- The editor does not accept arbitrary customer-supplied HTML, CSS, or JavaScript.
- Each template defines which sections and styling options are editable.
- Music, countdowns, animated effects, digital envelopes, and other decorative features are optional scope decisions and are not mandatory for the initial MVP.
- Exact section availability and image limits will be defined in the implementation specification.

### 4.4 Purchase and Payment

**Module:** `FR-PAY` · **Priority:** P0

The business model is a one-time purchase for each invitation. Recurring subscriptions are excluded from the MVP.

| ID | Requirement | Acceptance criteria |
|---|---|---|
| PAY-01 | Display invitation price. | The user sees the full payable amount and what the purchase includes before checkout. |
| PAY-02 | Create an order. | Checkout creates a unique order linked to the correct account and invitation. |
| PAY-03 | Initiate payment. | The user can select an available payment method through the chosen payment provider. |
| PAY-04 | Verify payment status. | An order is marked paid only after trusted provider confirmation or authorized admin verification. |
| PAY-05 | Handle pending and failed payments. | The UI displays current status and allows retrying where appropriate without duplicate purchases. |
| PAY-06 | Unlock the purchased invitation. | Successful payment activates the entitlement according to publishing rules. |
| PAY-07 | Maintain transaction history. | Users and admins can view order references, amounts, statuses, and relevant timestamps. |

#### Payment State Model

```text
Order Created
     |
     v
Awaiting Payment
     |
     +------> Paid ------> Entitlement Activated
     |
     +------> Failed / Expired ------> Retry or Create New Order
```

**Payment requirements**
- Payment callbacks must be authenticated and verified.
- Duplicate provider notifications must not create duplicate entitlements.
- Client-side redirects alone must never establish payment success.
- Refunds and cancellations need recorded states and an auditable administrative workflow.
- The exact gateway, payment methods, refund policy, and applicable Indonesian tax requirements remain to be confirmed.

### 4.5 Publishing and Public Invitation Pages

**Module:** `FR-PUB` · **Priority:** P0

| ID | Requirement | Acceptance criteria |
|---|---|---|
| PUB-01 | Generate a unique invitation URL. | Each published invitation has a unique, shareable slug. |
| PUB-02 | Publish an invitation. | Only an authorized owner can publish an invitation that meets purchase and validation rules. |
| PUB-03 | Render a public invitation. | Visitors can open the page without logging in and view published content. |
| PUB-04 | Update published content. | Authorized changes become public according to defined save/publish behavior. |
| PUB-05 | Share through common channels. | The URL can be copied and opened from WhatsApp and other messaging or social applications. |
| PUB-06 | Provide link previews. | Public pages provide appropriate title, description, and preview image metadata where supported. |
| PUB-07 | Handle unavailable pages. | Draft, unpublished, deleted, or unavailable invitations do not expose private editor data. |
| PUB-08 | Protect URLs and content. | Slugs are unique, access controls are enforced, and administrative or private information is never rendered publicly. |

**Proposed publishing rules**
- Users can build and preview a draft without payment.
- Successful purchase unlocks publishing for the purchased invitation.
- Public pages are accessible by anyone with the URL; they are not inherently private.
- Owners can unpublish invitations, subject to a clearly disclosed product policy.
- Custom domains are not required for the MVP.

### 4.6 Guest RSVP and Wishes

**Module:** `FR-RSVP` · **Priority:** P0

| ID | Requirement | Acceptance criteria |
|---|---|---|
| RSVP-01 | Collect attendance responses. | Guests can submit attendance status through the public invitation page. |
| RSVP-02 | Collect guest details. | The form captures minimum configured fields, such as guest name and attendance status. |
| RSVP-03 | Support guest counts. | If enabled, guests can submit the number of attendees within the configured limit. |
| RSVP-04 | Collect optional wishes. | Guests can submit a message if the feature is enabled. |
| RSVP-05 | Prevent abuse. | Validation, request throttling, and appropriate spam protections reduce automated or repeated submissions. |
| RSVP-06 | View responses. | The invitation owner can view and summarize responses in their dashboard. |
| RSVP-07 | Export responses. | Owners can download their RSVP list as CSV if export is included in the initial release. |

**RSVP distinction:** guest RSVP does not mean a guest list is already registered. In the MVP, guests can submit their own names and responses. Invitation-only guest lists, individual guest tokens, seating arrangements, and QR-code check-in are deferred.

### 4.7 Administration

**Module:** `FR-ADM` · **Priority:** P0

| ID | Requirement | Acceptance criteria |
|---|---|---|
| ADM-01 | Manage accounts. | Authorized admins can search accounts and review relevant account status. |
| ADM-02 | Manage templates. | Admins can create, edit, publish, and unpublish templates. |
| ADM-03 | Manage orders. | Admins can inspect orders, payment status, and provider references. |
| ADM-04 | Investigate payment issues. | Authorized actions are logged with actor, timestamp, and reason. |
| ADM-05 | Moderate content. | Admins can unpublish content that violates platform rules, with a reason and audit trail. |
| ADM-06 | Monitor platform health. | Admins can access basic counts of users, invitations, orders, and errors. |

Administrative access must use explicit permissions. A regular user must not be able to invoke administrative functions by modifying client-side requests.

## 5. User Journeys

### 5.1 Create and Purchase an Invitation

1. Visit the website.
2. Register or log in.
3. Browse templates.
4. Select a template.
5. Create an invitation draft.
6. Edit sections and upload photos.
7. Preview the invitation.
8. Review the package and price.
9. Complete checkout.
10. Wait for verified payment confirmation.
11. Publish the invitation.
12. Copy the link and share it.

**Success criteria**
- A first-time user can understand how to start without contacting support.
- The user can preview before purchasing.
- Payment failure does not destroy the draft.
- Successful payment activates the correct invitation.
- The resulting URL opens correctly on mobile devices.

### 5.2 Guest Views an Invitation and Responds

1. Receive the invitation link.
2. Open the public page.
3. View couple and event details.
4. Open venue directions if needed.
5. Submit an RSVP.
6. The system validates and saves the response.
7. The guest sees a confirmation.
8. The owner views the updated RSVP summary.

**Success criteria**
- No account is required for guests to view an invitation or submit an RSVP.
- The form works on common mobile screen sizes.
- Validation errors preserve entered information where practical.
- The owner sees the response without manually updating a spreadsheet.

### 5.3 Update Event Details After Publishing

1. The owner opens the invitation dashboard.
2. They select the invitation and edit the relevant section.
3. They preview the updated date, time, or venue.
4. They save and publish the changes.
5. The public invitation reflects the updated content according to publishing rules.

**Success criteria**
- Changes are authorized and saved reliably.
- Incomplete edits are not exposed accidentally.
- If versioned publishing is implemented, the previously published version remains available until the replacement is ready.

### 5.4 Admin Manages a Template

1. An admin signs in to the protected dashboard.
2. They create or update a template.
3. They preview it at supported screen sizes.
4. They publish the template.
5. Customers can select it from the catalog.

**Success criteria**
- Unpublished templates are not selectable for new invitations.
- Existing invitations remain functional when a template is updated or retired.

## 6. Cross-Functional Acceptance Criteria

| Area | Required behavior |
|---|---|
| Ownership | Users cannot read or modify another user's private drafts, orders, or RSVP management data. |
| Payment integrity | Entitlements are activated only after trusted confirmation of successful payment. |
| Data persistence | Saved invitation content survives refreshes, logout, and subsequent login. |
| Responsive design | The editor and published invitations work on mobile and desktop. |
| Error handling | Failed requests show clear errors and do not silently discard saved data. |
| Public/private boundary | Published invitation content is public; drafts, credentials, private order data, and administration interfaces are protected. |
| Template compatibility | Changes to the template catalog do not silently corrupt existing invitations. |
| Operational visibility | Application errors, payment failures, and critical administrative actions can be investigated. |

## 7. Non-Functional Requirements

The values below are proposed engineering targets, not measured current performance.

| Category | Requirement |
|---|---|
| Performance | Public invitation pages target LCP of 2.5 seconds or less at the 75th percentile under representative mobile conditions. |
| Availability | Initial service target: 99.5% monthly availability, excluding clearly defined planned maintenance. |
| Security | Enforce server-side authorization, secure password handling, input validation, and protection against common web vulnerabilities. |
| Privacy | Collect only necessary personal information, restrict access to RSVP data, and define retention and deletion policies. |
| Reliability | Use transactional persistence for orders and entitlements; process payment callbacks idempotently. |
| Scalability | Keep invitation rendering and media delivery efficient as public traffic grows. |
| Maintainability | Separate invitation editing, rendering, payment, authentication, and administrative logic into clear modules. |
| Accessibility | Target WCAG 2.2 AA for core interfaces where applicable, including keyboard navigation, readable contrast, and form labels. |
| Compatibility | Support current major mobile and desktop browsers; confirm the exact support matrix before release. |
| Localization | Use Bahasa Indonesia as the primary interface language and IDR pricing. |
| Observability | Record application errors, service health, payment reconciliation issues, and security-relevant administrative actions. |
| Backup and recovery | Establish automated backups, test restoration, and define recovery objectives before launch. |

### 7.1 Privacy and Security Requirements

- Distinguish public invitation content from private account and order information.
- Restrict RSVP records to authorized owners and administrators.
- Validate image uploads and limit file types and sizes.
- Use signed or authenticated payment callbacks where supported by the selected provider.
- Apply rate limits to login, registration, RSVP, and other abuse-prone endpoints.
- Avoid exposing secrets, payment credentials, or internal error details to browsers.
- Provide a documented process for account deletion and applicable personal-data requests.
- Review production implementation against Indonesia's applicable personal data protection and electronic-system obligations before launch.

## 8. Initial Data Model

The final schema depends on the selected technology, but the product needs these core entities regardless of implementation.

| Entity | Important fields |
|---|---|
| User | `id`, `email`, `password_hash` or identity-provider reference, `role`, `created_at` |
| Template | `id`, `name`, `slug`, `category`, `price`, `version`, `status` |
| Invitation | `id`, `owner_id`, `template_id`, `slug`, `status`, `event_date`, timestamps |
| Invitation Content | `invitation_id`, `schema_version`, `content_json`, `updated_at` |
| Media Asset | `id`, `owner_id`, `storage_key`, `mime_type`, `size_bytes` |
| Order | `id`, `user_id`, `invitation_id`, `amount`, `currency`, `status` |
| Payment Transaction | `id`, `order_id`, `provider_reference`, `status`, timestamps |
| Entitlement | `id`, `invitation_id`, `order_id`, `status` |
| RSVP Response | `id`, `invitation_id`, `guest_name`, `attendance`, `guest_count`, `message` |
| Audit Log | `id`, `actor_id`, `action`, `resource_type`, `resource_id`, timestamp |

These are logical entities, not a final SQL schema. The implementation should preserve purchase history, enforce uniqueness and ownership, and avoid storing payment credentials unnecessarily.

### 8.1 Data Model Principles

- Store invitation content separately from template definitions.
- Template updates must not silently change existing customer invitations.
- Version the content schema to make future editor upgrades safer.
- Preserve financial records even when an invitation is deleted.
- Enforce unique slugs and appropriate ownership constraints.
- Define retention rules for RSVP data and uploaded media.

## 9. Business Rules

1. **One-time purchase:** each invitation has a defined price and recorded purchase.
2. **Draft before purchase:** users can create and preview invitations without paying.
3. **Publishing entitlement:** only invitations meeting payment and publishing rules can be published.
4. **Unique URLs:** each active invitation slug must be unique.
5. **Ownership:** only the owner and authorized administrators can edit or manage an invitation.
6. **Public access:** a published invitation is viewable by anyone with its link.
7. **RSVP ownership:** only authorized users can manage responses associated with their invitations.
8. **Payment consistency:** one confirmed purchase must not generate duplicate entitlements, even if a payment provider retries its notification.
9. **Template lifecycle:** retiring a template must not automatically retire invitations already created from it.
10. **Price consistency:** an order records the applicable price at purchase time rather than relying on the template's current price.
11. **Media handling:** deleting an invitation must not accidentally remove assets still used by other resources.
12. **Content moderation:** the platform can restrict content that violates its published terms and applicable law.

### 9.1 Unresolved Business Decisions

- Does a purchase include lifetime hosting or a defined hosting period?
- Does editing remain available after purchase?
- Can an owner transfer an invitation to another account?
- How do refunds affect an already published invitation?
- Are custom music, gift links, or digital envelopes included in the base price?

These should be settled before implementing the purchase and entitlement lifecycle.

## 10. Success Metrics

The MVP should be measured by whether customers can successfully create and share invitations, not just by the number of templates or features.

| Metric | Definition | Initial target or approach |
|---|---|---|
| Activation rate | Percentage of registered users who create their first invitation draft. | Proposed target: 50% or higher. |
| Purchase conversion | Percentage of users who start a draft and subsequently complete a purchase. | Establish a baseline during the first launch cohort before setting a firm target. |
| Publication rate | Percentage of purchased invitations that become publicly available. | Proposed target: 80% or higher. |
| Payment entitlement integrity | Confirmed purchases missing an entitlement. | Zero known cases. |
| Saved-edit integrity | Known cases of silent loss of successfully saved edits. | Zero known cases. |
| Time to publication | Time from starting a draft to publishing. | Measure baseline and improve. |
| Checkout abandonment | Users who start checkout but do not complete payment. | Measure baseline and investigate. |
| RSVP submission rate | Public invitation visits that result in an RSVP submission. | Track by invitation and traffic source where possible. |
| Support burden | Support requests per paid invitation. | Establish baseline and reduce recurring causes. |
| Revenue per invitation | Revenue attributed to each purchased invitation. | Track by template and acquisition channel. |

## 11. Proposed Implementation Roadmap

### Phase 1 — Foundation

- Define architecture, authentication, authorization, data model, template schema, media storage, and deployment environments.

### Phase 2 — Invitation Creation

- Build template catalog, section-based editor, draft persistence, validation, and mobile previews.

### Phase 3 — Commercial Workflow

- Implement one-time checkout, payment verification, order records, entitlements, and publication rules.

### Phase 4 — Guest Experience

- Implement public invitation rendering, link previews, RSVP submission, and response management.

### Phase 5 — Operations and Launch

- Complete admin tools, security testing, backup recovery tests, performance optimization, and a small beta launch.

Reseller, affiliate, and vendor marketplace functionality should be planned as separate releases after the core product has validated demand.

## 12. Technology Decision

**Status: intentionally undecided.**

Technology should be selected after the requirements for invitation rendering, SEO, editor complexity, media delivery, payment processing, and operational costs have been validated.

The architecture should support:

- Server-rendered or otherwise SEO-friendly public invitation pages.
- A structured, versioned invitation-content schema.
- Separation between the editing interface and public renderer.
- Reliable media storage and image optimization.
- Transaction-safe payment processing and entitlement activation.
- Clear separation of user-facing features and administrative operations.
- Automated testing, deployment, logging, and backup recovery.

The chosen stack must support these requirements without forcing an unnecessary microservice architecture for the initial release.

## 13. Assumptions Register

| ID | Assumption | Status |
|---|---|---|
| A-01 | Indonesia is the initial target market. | Confirmed |
| A-02 | The primary product is a digital wedding invitation website. | Confirmed |
| A-03 | The editor is section-based rather than a free-form canvas. | Confirmed |
| A-04 | The revenue model is one-time payment per invitation. | Confirmed |
| A-05 | The initial product excludes reseller and vendor marketplace workflows. | Confirmed |
| A-06 | Bahasa Indonesia and IDR are the default locale and currency. | Proposed |
| A-07 | Guests can submit RSVP responses without creating accounts. | Proposed |
| A-08 | Customers can preview before paying. | Proposed |
| A-09 | Purchased invitations receive hosted public URLs on the platform's domain. | Proposed |
| A-10 | Payment gateway, hosting duration, refund rules, and final pricing remain undecided. | Open |
| A-11 | Technology stack and deployment architecture will be chosen after requirements review. | Open |

## 14. Definition of MVP Completion

The MVP is ready for launch when:

- [ ] A customer can register, create a draft, select a template, and edit supported sections.
- [ ] The editor reliably saves content and provides an accurate preview.
- [ ] A customer can purchase an invitation and the system verifies payment correctly.
- [ ] The purchased invitation can be published and shared through a unique URL.
- [ ] Guests can view the invitation and submit RSVP responses.
- [ ] The owner can manage the invitation and review its responses.
- [ ] Administrators can manage templates, investigate orders, and handle moderation tasks.
- [ ] Security, privacy, backup recovery, and core mobile compatibility tests pass.
- [ ] The platform has basic monitoring and a documented support process.

## 15. Recommended Next Step

Turn this PRD into a detailed technical specification covering:

1. Invitation content schema and template versioning.
2. Editor behavior and autosave strategy.
3. Draft, purchase, publication, and unpublishing lifecycle.
4. Payment state machine and entitlement rules.
5. API contracts and authorization boundaries.
6. Hosting duration, refunds, and other unresolved business rules.

These are the areas where early architectural decisions will have the greatest impact on maintainability.
