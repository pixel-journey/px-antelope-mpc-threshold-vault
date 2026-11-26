/** Names that must not appear in this MIT course's manifests. */
export const BANNED_SNIPPETS = [
  "silence-laboratories",
  "entropyxyz/synedrion",
  "backend-rug",
  "insecure-assume-preimage-known",
  "@wharfkit/wallet-plugin-wombat",
  "Private during development",
] as const;

export function findBannedSnippets(text: string): string[] {
  return BANNED_SNIPPETS.filter((snippet) => text.includes(snippet));
}
