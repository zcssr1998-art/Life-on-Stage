# AGENTS.md — Life on Stage

This repository is developed with AI coding agents. Treat this file as the default operating procedure for all work in this repo.

## 1. User / product-owner model

- The user is the product owner, not the implementation engineer.
- Convert natural-language requests into concrete engineering tasks yourself.
- Do not return routine debugging, dependency choices, architecture trivia, or code-level decisions to the user when they can be resolved from the repository and tooling.
- If a requirement is slightly ambiguous, prefer the smallest reversible implementation that best serves the stated gameplay/product goal.
- Final status should be concise Chinese unless the user asks otherwise.

## 2. Definition of done

Never claim a feature is complete merely because code was written or the project builds.

A change is complete only when all applicable checks are satisfied:

1. The project starts successfully.
2. The changed interaction is exercised in a real browser/runtime when available.
3. Important controls are actually clicked/pressed/tested.
4. Browser console and runtime errors are checked.
5. A short regression smoke test is run around the changed system.
6. The final report distinguishes what was implemented from what was actually verified.

If runtime verification is impossible in the current environment, explicitly say `implemented but not runtime-verified`.

## 3. Game-development loop

For gameplay changes, use an iterative loop rather than making a large batch of untested edits:

1. Inspect the current gameplay/state architecture.
2. Make a small coherent change.
3. Start or refresh the game.
4. Exercise the affected path with real input.
5. Observe visuals, state changes, and console output.
6. Fix any issue found.
7. Repeat until the requested loop works end-to-end.

Do not infer game feel or input correctness from source code alone.

## 4. Gameplay systems must have consequences

Life on Stage is not a static stat sheet. When adding or changing stats, traits, hidden states, achievements, or progression systems:

- Every persistent stat should have a clear gameplay purpose or be explicitly labeled cosmetic/achievement-only.
- Hidden mechanics should eventually produce discoverable consequences, events, unlocks, restrictions, or feedback.
- Attribute thresholds should be able to gate choices, unlock hidden options, influence event probabilities, or materially alter outcomes where appropriate.
- Avoid adding numbers that only increase without affecting decisions.
- When a hidden mechanic triggers, provide understandable feedback after discovery so the player can learn the system.

## 5. Roguelike / stacking design principle

The core appeal is repeated runs, accumulation, synergies, threshold unlocks, and surprising combinations.

- Prefer systems that create combinatorial choices over linear stat inflation.
- Reward builds that develop an identity.
- Use thresholds, conditional events, unlock chains, and mutually reinforcing mechanics to create meaningful stacking.
- Do not make all choices universally good; trade-offs improve replayability.
- Keep the first playable loop understandable before expanding content breadth.

## 6. Scope and architecture discipline

- Prefer the smallest correct change over a broad rewrite.
- Preserve working architecture unless it directly blocks the requested feature.
- Reuse current systems before creating parallel frameworks.
- Do not over-engineer abstractions before the gameplay loop proves they are needed.
- First make the end-to-end experience work; refactor second.
- Avoid speculative features that were not requested.

## 7. Input and interaction verification

When an interaction is changed:

- test mouse/touch/keyboard paths that the project claims to support;
- verify buttons actually trigger their intended action;
- test hover/tooltip behavior when applicable;
- check that disabled/gated choices visually explain why they are unavailable;
- verify rapid repeated input does not create obvious duplicate state transitions.

## 8. UI / visual quality

- Do not accept a generic unstyled AI-prototype look.
- Maintain clear hierarchy, readable typography, useful hover states, feedback animations, responsive layout, and consistent spacing.
- Important mechanics should communicate state changes visually.
- UI work is not complete until the affected screen is rendered and visually inspected when tools are available.
- Prefer clarity over decorative noise.

## 9. Debugging discipline

For bugs:

1. Reproduce the exact failure when possible.
2. Identify the relevant state/input transition.
3. Form a concrete hypothesis.
4. Make the smallest root-cause fix.
5. Re-run the exact scenario that failed.
6. Add a regression check where practical.

Do not label a workaround as a root-cause fix.

## 10. GitHub Actions / CI

- Inspect failing workflow logs yourself.
- Fix the root cause instead of blindly rerunning.
- Do not disable checks or remove tests just to make CI green.
- Verify the relevant workflow passes before declaring success whenever possible.

## 11. Security / repository hygiene

- Never commit secrets, tokens, passwords, or private credentials.
- Avoid unrelated formatting churn.
- Do not commit generated build output unless the repository intentionally tracks it.

## 12. Agent handoff / reporting

Before finishing, report:

- **Changed:** what materially changed.
- **Verified:** what was actually run/clicked/tested.
- **Result:** what now works.
- **Remaining risk:** real unverified paths or known limitations only.

Never say `done`, `fixed`, or `works` when the relevant interaction has not been verified.
