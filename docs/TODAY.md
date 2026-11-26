# What a developer or an agent can use today

This repository does not sign and does not broadcast. The pieces below are usable now.

## For an agent

- Call `createPolicy().propose(...)` from `src/policy.ts`. It returns `{ ok, reason, account }`. It refuses mainnets, free-typed recipients, `updateauth`, long memos, and amounts over the cap.
- Read [docs/AGENT-STRATEGIES.md](AGENT-STRATEGIES.md) for the four tools an agent is allowed to call and the three share roles.
- Call `handoff()` from `src/dryrun.ts` after an allow. It binds the proposal. It does not pack and it does not sign. See [docs/HANDOFF.md](HANDOFF.md).
- Import `PLAYBOOKS` from `src/playbooks.ts` to see, per network, the symbol and which actions the default gate allows. The catalog does not widen the gate.

## For a developer

- Import `@wharfkit/session` 4.0.2. The tests show `Transaction.signingDigest`, `Signature.recoverDigest`, and `Authority.sort()` against the published vectors.
- Use `src/digest.ts` to compute the Antelope signing digest if the agent cannot load WharfKit. See [docs/WITHOUT-WHARFKIT.md](WITHOUT-WHARFKIT.md).
- Read [docs/K1-CANONICAL.md](K1-CANONICAL.md) before writing any K1 signer. The 32640 count is locked.
- Read [docs/PROTOCOL-GENERATIONS.md](PROTOCOL-GENERATIONS.md) before choosing an engine. This course does not compile one.

## For a later lab

- Replace `createEducationalEngine()` in `src/threshold.ts` with a reviewed WASM build of an MIT/Apache engine. The interface stays the same. The mock refuses to sign.
- Widen `LAB_CHAIN_IDS` and add aliases when an operator decides a mainnet is in scope. The blocked-action list stays.
- Wrap the policy gate behind the four MCP tools described in the blueprint. The gate already returns the decision those tools would return.

## What is not ready

A real DKLs23 or CGGMP24 ceremony, a WebSocket relay, a custom wallet plugin, a broadcast, and any claim that the engines named in the blueprint have been audited here.
