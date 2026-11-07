# Copy

Interface copy: labels, errors, empty states, confirmations. Match the product's existing voice. A deliberate brand voice is not a defect. Raise a departure only when it creates inconsistency, ambiguity, translation risk or a tone the stakes don't support. Rewording that merely suits your taste is not a finding.

## Inventory the existing strings first

Find where the copy lives (`t(`, locale files, a CMS). List the noun used for each object and the verb for each action. New copy uses those terms.

## One voice, one vocabulary

If it's "Archive" in the menu, it isn't "Move to storage" in the toast. An action keeps the same name through the whole flow: the button that says "Publish" produces a toast that says "Published". Name things by what users understand: a user manages notifications, not webhook config.

| Context | Tone |
| --- | --- |
| Success, onboarding, empty states | Warm, can be light |
| Routine actions, settings | Neutral, minimal |
| Errors, destructive confirmations | Calm, plain, zero playfulness |
| Data loss, security | Serious, explicit |

## Plain words

Words a tired reader gets on the first pass; delete every word that does no work. No idioms, no humor that won't translate. "You", not "the user". Possessives sparingly: "Favorites" beats "Your favorites"; never "My account" beside "Your settings". "Tap" on touch, "click" with a pointer, "select" when both. Describe what something does rather than selling it. No hype words: seamless, unlock, elevate, supercharge, effortless, cutting-edge.

## Verb-first buttons

A button starts with a verb naming the action: "Send", "Save draft", "Delete project". Never "OK!", "Submit", "Let's go!". Labels that open a follow-up end with `…` ("Rename…").

## Links describe their destination

"Read the billing docs", never "Click here". A bare "Learn more" breaks as soon as two appear: "Learn more about exports". Never append `→` to every link and button by default.

## One capitalization policy

Sentence case by default, applied to every instance of an element type. "Save Changes" beside "Discard changes" reads as sloppiness.

## Settings describe the ON state

"Send read receipts", not "Don't send read receipts". Link straight to a referenced setting rather than describing the path.

## Errors say how to fix, next to where it broke

| Bad | Good |
| --- | --- |
| That password is too short | Choose a password with at least 8 characters |
| Invalid date | Enter a date as DD/MM/YYYY |
| Oops! Something went wrong. | Unable to save. Check your connection and try again. |

No blame, no "oops", no exclamation marks. "We" reads as deflection in errors. Phrase hints positively. Show a known requirement as helper text before input. When the same error keeps firing, redesign the interaction so it can't happen.

## Undo beats confirmation

Reversible, frequent actions act at once and offer undo: "Project archived. Undo". Confirm only what can't be reversed, affects other people or destroys many items:

- The title names the action and object: "Delete 'Q3 report'?", never "Are you sure?".
- The body says what is lost, with counts: "This permanently deletes the report and its 4 comments."
- Buttons are verb plus object: `Delete report`, `Cancel`, never `Yes` / `No`.
- For an account, workspace or repository, ask the person to type its name.

## Status copy

| State | Pattern | Example |
| --- | --- | --- |
| In progress | `-ing` verb + object + `…` | "Saving changes…" |
| Done | Object + past tense, no "successfully" | "Changes saved" |
| Failed | What didn't happen, then the next step | "Changes not saved. Check your connection and try again." |
| Unavailable | Why, and what unlocks it, beside the control | "Add a payment method to publish" |
| Partial | Counts for both outcomes | "9 of 12 files uploaded. Retry 3 failed files" |

## Empty states point forward

Say what this place is, how to fill it, and offer one clear next action: "No projects yet. Projects keep your tasks and files together. [Create a project]". A filtered empty state names the query and offers an exit: "No results for 'quarterly'. Clear filters".

## Placeholders show an example

A realistic example in the accepted format (`name@example.com`), never an instruction, never the label.

## Build strings whole

Never assemble a sentence around a variable or hand-roll plurals (`n === 1 ? "" : "s"`). One ICU message with placeholders and plural categories. Numbers, dates, relative time and lists through `Intl` with the user's locale.

## Real content

Real data or nothing: no lorem ipsum, invented stats, fake logos or testimonials. No em dashes, no middle-dot meta strings ("A · B · C") as decoration.
