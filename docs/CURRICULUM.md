# Eight levels

Each level says what the idea is, and whether this repository runs it.

| Level | Idea | Run here? |
| --- | --- | --- |
| 1 | Shamir reconstruction puts the secret on one machine. Real threshold ECDSA multiplies shares and does not open `x`. | Yes, as a toy over the prime 101. Not a DKG. |
| 2 | `PUB_K1_` and legacy `EOS` checksums differ by the ASCII suffix. | Yes, Vector 1 only. No key generation. |
| 3 | The K1 canonical gauntlet, low-S, recovery-id flip, **presign queue r-filter / burn**, R1 preference. | Yes. Counts + `presign.ts` + `curve.ts` + Rust R.1. Not a live ceremony. |
| 4 | Cold owner, hot active, `linkauth` for a bot. **Payload shapes** + WharfKit `Authority.sort()`. | Yes for shapes (`permissions.ts`) and sort test. No account created. |
| 5 | A passkey can wrap a local share. An OAuth wallet provider is a different trust decision. | Reading only. No WebAuthn call. |
| 6 | Nonce reuse recovers `x`. Unlength-prefixed hashes collide. Museum CVE cards. | Yes, on fixtures created inside the test. |
| 7 | Model proposes; policy decides. Strategies, MCP tools, simulate fixtures, lab SIG, gated lab push. | Yes, in memory / opt-in lab HTTP. No production threshold sign. |
| 8 | Post-quantum signatures and two-round class-group ECDSA are not Antelope authority types yet. | Reading only. |

Do not mark a level "done" because the table exists. Levels 5 and 8 have no executable lab. Levels 3, 4, and 7 are the depth of this course.

## Level 1 — do not reassemble

Shamir sharing of a number is not threshold ECDSA. The test splits 42, interpolates, and gets 42 back. That is the custody failure, shown small so it is obvious. Beaver triples and OT exist so the product `k^{-1} * x` can be formed without either factor landing in one process. This course does not implement those protocols.

## Level 2 — the checksum suffix

`RIPEMD-160(point || "K1")` and `RIPEMD-160(point)` produce different four-byte checksums, so `PUB_K1_…` and `EOS…` differ even for the same 33 bytes. R1 uses the suffix `"R1"`. WA is a separate WebAuthn encoding and cannot hold the threshold key.

## Level 3 — canonical bytes and the presign pool

Read [K1-CANONICAL.md](K1-CANONICAL.md). After you can compute 32640 by hand from the two-byte rule, the rest of the MPC latency story is "a WAN retry costs a whole ceremony, so filter `r` before you store a presignature." [src/presign.ts](../src/presign.ts) enforces that queue policy on synthetic bytes. Prefer R1 online via [src/curve.ts](../src/curve.ts). Rust parity: [RUST.md](RUST.md).

## Level 4 — permissions, still native

No custom contract. `owner` is a weighted cold authority. `active` is the single MPC public key, if you ever have one. `linkauth` caps a custom permission to one action. [src/permissions.ts](../src/permissions.ts) builds those shapes with `executed: false`. WharfKit 4.0.2's `Authority.sort()` is what puts keys, accounts, and waits into the order nodeos checks.

Related courses: [wax-multi-sig-proposal-builder-and-simulator](https://github.com/pixel-journey/wax-multi-sig-proposal-builder-and-simulator), [wax-permission-visualizer-and-editor](https://github.com/pixel-journey/wax-permission-visualizer-and-editor), [wax-wharfkit-session-keys-and-linked-permissions](https://github.com/pixel-journey/wax-wharfkit-session-keys-and-linked-permissions).

## Level 5 — passkeys are wrappers

WAX My Cloud Wallet's passkey migration and XPR's WebAuth wallet are product choices. They are not threshold ECDSA. A November 2026 writeup of the Web3Auth / Keplr incident is the reason a social-login vendor is not the same as a share you encrypted yourself. Read vendor post-mortems before citing dollar figures. This course does not re-investigate that incident.

## Level 6 — museum pieces

Nonce reuse, on a scalar this test invented:

```text
k = (m1 - m2) * inv(s1 - s2)  mod n
x = inv(r) * (s1 * k - m1)    mod n
```

Bare string concatenation makes `["ab","c"]` and `["a","bc"]` the same hash. Length prefixes do not. `$`-joined parts also collide (`["a$","b"]` vs `["a","$b"]`). That is the shape of the TSSHOCK delimiter bug, not a copy of any vendor's transcript code. Full card table: [ATTACK-MUSEUM.md](ATTACK-MUSEUM.md).

## Level 7 — the gate, catalogs, simulate, push curriculum

The allowlist is deliberately boring: one contract, one action, known aliases, a small cap, a short memo, two default testnets, a kill switch. Named strategies and playbooks expand what an agent can *see* and *practice refusing* without widening that allowlist.

Also in level 7 executable surface:

| Piece | Module |
| --- | --- |
| MCP-shaped tools (10) | `mcp.ts` |
| Offline compute fixtures | `simulate.ts` |
| Lab `SIG_K1_` after allow | `labsign.ts` |
| Push readiness + gated lab sender | `broadcast.ts`, `labClient.ts` |
| Engine registry (mock; `sign` throws) | `threshold.ts` |

If a future MCP tool grows a `sign_digest` or unrestricted `push` method, it has left this course. See [AGENT-RECIPE.md](AGENT-RECIPE.md) · [PUSH.md](PUSH.md).

## Level 8 — later curves

Antelope will accept a new authority type only when the protocol adds one. Until then, ML-DSA, FROST, and class-group ECDSA are other chains' or researchers' tools. `updateauth` remains the migration tool because the account name does not contain the key. See [POST-QUANTUM.md](POST-QUANTUM.md).

## Verification

```bash
npm test && npm run check-skills
```
