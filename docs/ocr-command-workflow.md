# OCR-to-Command Workflow

## Goal

Convert reviewed OCR text into editable Frontier action drafts without directly changing records.

```text
Stored document
-> OCR extraction
-> Human correction
-> AI interpretation
-> Review draft
-> Human edit and target selection
-> Explicit approval
-> Explicit execution through the action layer
```

## Material Notes

For sticky notes, handwritten lists, and material sheets, interpretation produces a
`create_material_allocation` draft containing normalized material names and quantities. The draft
is not executable as a business action. The user selects an existing job in the same workspace.

> Apply these materials to which job?

The selected job ID must be validated server-side for workspace ownership. Existing materials
should be shown before confirmation, and the user chooses whether to append, replace, or merge
matching materials. Saving creates draft allocation rows only. No job material or inventory
quantity is changed, and no delete action is generated.

## Current Support

1. Review-draft title, summary, and action payload editing.
2. Workspace-scoped existing-job selection.
3. Append, Merge, and Replace intent selection.
4. Source document and review-draft retention.
5. Draft allocation persistence without automatic application.

Applying a saved allocation to job materials remains a separate future explicit action.
See `docs/ai-model-contract.md` for the model-facing contract.

Invoices, receipts, job notes, and client notes follow the same review-first contract. AI output is
never permission to execute an action automatically.
