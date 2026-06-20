# Product note

## The thesis

A shared talent pool fails its participants if visibility is implicit. “You are in the database” is not enough; a person should be able to answer:

- Which organizations can discover me?
- Which exact fields can each organization read?
- Why does that permission exist?
- Who has actually looked?

`consent-lens` treats those answers as first-class product surfaces rather than administrator settings. The participant view is not a compliance afterthought. It is the glass box that makes cross-organization coordination compatible with participant agency.

## Participants, not candidates

“Candidate” implies a person is being processed through an organization’s funnel. “Participant” describes the relationship here more accurately: people opt into a shared pool, control their visibility, and remain a party to how their information travels.

This language choice is small but useful. It keeps the product oriented around the person’s agency instead of the database owner’s workflow.

## Why the narrow slice

The demo does not attempt to prove that a talent marketplace can be made feature-complete in a weekend. It isolates the part most likely to become dangerous or incoherent later: multi-tenant, field-level access that remains understandable from both sides.

The strongest interaction is switching organizations and seeing the same pool change. The second is switching to the participant view and seeing the exact grants and access trail that produced those differences.

Anonymous Supabase auth makes the model editable without turning it into a shared vandalism surface. Every visitor gets a private synthetic workspace that survives refreshes, and the reset control intentionally restores only that workspace.

## A deliberate no on AI summaries

I deliberately did not add an AI summary. In a system whose entire point is legible, consented access, an opaque generative layer works against the thesis — and record-backed determinism is the right default when the data is sensitive and the records must not be embellished. Restraint is the responsible call here.

An AI layer would also create new questions that this slice should not wave away: whether the model may consume hidden attributes, how generated claims are corrected, whether summaries preserve revocation, and how a participant audits an inference rather than a read.

## What I would build next

First: account linking and a production identity model that binds real organization membership and participant identity to verified accounts. Then notifications, access-log retention controls, pagination, and operational tooling for reviewing unusual access patterns.

ATS import, deduplication, matching, and generated summaries would come only after learning the actual workflow and governance requirements. No real or scraped participant data should enter the system before those controls exist.
