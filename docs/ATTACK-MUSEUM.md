# Attack museum

Structured cards (also exported as `MUSEUM_CARDS` in `src/museum.ts`). Executable demos only for **nonce reuse** and **transcript delimiter collisions** on throwaway numbers — never against live vendor binaries.

## Boss fight: Antelope K1 `is_canonical`

See [K1-CANONICAL.md](K1-CANONICAL.md). Offline r-filter + low-S + `recid ^= 1` + burn residual; prefer R1 when first-attempt online matters (~75% naive K1 fail under uniform-byte model).

## Cards

| ID | References | Root cause | Mandatory fix | Repo invariant |
| --- | --- | --- | --- | --- |
| alpha-rays | ePrint 2021/1621 | MtA range / small Paillier modulus | Range proofs, large N, MtAwc binding | No Paillier engine |
| bitforge-gg | CVE-2023-33241 | Smooth Paillier modulus | Blum + no-small-factors proofs | Documented only |
| bitforge-lindell | CVE-2023-33242 | Non-compliant abort leaks bits | Spec-accurate aborts | No Lindell17 |
| tssshock-transcript | CVE-2022-47931 / 26556 | Ambiguous FS delimiters; weak DLN k | Length prefixes; k ≥ 80–128 | `taggedHash` / `$` collision demo |
| nonce-reuse | Classical HNP | Reused ephemeral k | CSPRNG only; never chain entropy | `recoverFromReusedNonce` |
| cggmp-66016 | CVE-2025-66016 | Missing Jacobi in aux keygen | cggmp24 ≥ 0.7.0-alpha.2 when engines land | Ban cggmp21 in future deny.toml |
| cggmp-66017 | CVE-2025-66017 | Presign + raw digest / HD misuse | Type guards; no `sign_digest` tool | MCP + hygiene |
| ops-ai-bypass | Custody & agent incidents | No crypto break required | Independent shares; linkauth; policy | Gate + readiness |

### Executable demos

```ts
import {
  recoverFromReusedNonce,
  dollarDelimiterCollides,
  taggedHash,
  smashedHash,
} from "./museum.js";

dollarDelimiterCollides(); // true — why "$" join is unsafe
taggedHash(["ab", "c"]) !== taggedHash(["a", "bc"]);
```

## Simulation is not inclusion

`compute_transaction` (and our offline fixtures) can miss state races. Pair with `linkauth` blast-radius caps and short `expiration`. See [src/simulate.ts](../src/simulate.ts).

## What is not re-implemented

Full BitForge modulus recovery, live TSSHOCK against a vendor binary, and CVE-2025-66017 against a real presign API require vulnerable code. Described for auditors only.
