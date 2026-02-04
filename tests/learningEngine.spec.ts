import { createSession, step } from "../lib/learning/learningEngine";

describe("learningEngine", () => {
  test("Topic integrity", () => {
    const s = createSession("sif");
    const r = step(s, "DEEPER");
    expect(r.session.topic).toBe("sif");
    expect(r.response.content.toLowerCase()).not.toContain("sip");
  });

  test("Infinite depth", () => {
    let s = createSession("covered call strategy for indian equities");
    for (let i = 0; i < 10; i++) {
      const out = step(s, "DEEPER");
      s = out.session;
    }
    expect(s.depth).toBe(10);
  });

  test("Meaningful buttons", () => {
    let s = createSession("inflation");
    const a = step(s, "EXAMPLE");
    const b = step(a.session, "EXAMPLE");
    expect(b.response.content).not.toBe(a.response.content);
  });

  test("Angle switch", () => {
    let s = createSession("bonds");
    const m = step(s, "DIFFERENT_ANGLE", { angle: "math" });
    const p = step(m.session, "DIFFERENT_ANGLE", { angle: "psychology" });
    expect(p.response.content).not.toBe(m.response.content);
  });
});
