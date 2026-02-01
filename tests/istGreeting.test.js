import { getIstGreeting, getIstGreetingVariant, getIstHour } from "@/lib/time/istGreeting";

describe("IST greeting", () => {
  test("computes IST hour from UTC date", () => {
    // 10:00 IST == 04:30Z
    const d = new Date("2026-01-01T04:30:00.000Z");
    expect(getIstHour(d)).toBe(10);
  });

  test("morning / afternoon / evening / night boundaries (IST)", () => {
    // 06:00 IST -> morning
    expect(getIstGreetingVariant(new Date("2026-01-01T00:30:00.000Z"))).toBe("morning");
    expect(getIstGreeting({ date: new Date("2026-01-01T00:30:00.000Z") })).toBe("Good morning");

    // 13:00 IST -> afternoon (13:00 IST == 07:30Z)
    expect(getIstGreetingVariant(new Date("2026-01-01T07:30:00.000Z"))).toBe("afternoon");
    expect(getIstGreeting({ date: new Date("2026-01-01T07:30:00.000Z") })).toBe("Good afternoon");

    // 18:30 IST -> evening (18:30 IST == 13:00Z)
    expect(getIstGreetingVariant(new Date("2026-01-01T13:00:00.000Z"))).toBe("evening");
    expect(getIstGreeting({ date: new Date("2026-01-01T13:00:00.000Z") })).toBe("Good evening");

    // 22:00 IST -> night (22:00 IST == 16:30Z)
    expect(getIstGreetingVariant(new Date("2026-01-01T16:30:00.000Z"))).toBe("night");
    expect(getIstGreeting({ date: new Date("2026-01-01T16:30:00.000Z") })).toBe("Good night");
  });
});
