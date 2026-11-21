export const steps = [
  {
    title: "Token generation & symmetrisation",
    body: 'Alice creates pairs of Pauli eigenstates for each bit position. Bob and Charlie exchange half their received tokens via random swap gates ("keep-or-forward"), so Alice cannot know who holds which token.',
  },
  {
    title: "Teleportation & elimination",
    body: "States are teleported over simulated Bell channels with feed-forward Pauli corrections. Each receiver measures every token in a random basis (Z or X) to eliminate an orthogonal candidate from its verification table.",
  },
  {
    title: "Commitment binding",
    body: "Alice broadcasts a SHA-256 commitment over the message digest, recipient list, session nonce, expiry timestamp and a random blinding salt, before any state is revealed.",
  },
  {
    title: "Channel testing & sequential early abort",
    body: "Interleaved secret test tokens measure link fidelity block by block. If errors cross the binomial threshold early, transmission aborts immediately to conserve quantum resources.",
  },
  {
    title: "Independent verification & response",
    body: "Bob and Charlie check received signatures against their own elimination tables. Mismatch counts are tested against Hoeffding and exact binomial acceptance thresholds.",
  },
];
