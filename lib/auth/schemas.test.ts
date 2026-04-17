import { describe, it, expect } from "vitest";
import {
  phoneDigitsSchema,
  phoneE164Schema,
  toE164,
  otpSchema,
  profileSchema,
} from "./schemas";

describe("phoneDigitsSchema", () => {
  it("accepts exactly 10 digits", () => {
    expect(phoneDigitsSchema.parse("9999900001")).toBe("9999900001");
  });

  it("trims whitespace before validating", () => {
    expect(phoneDigitsSchema.parse("  9876543210 ")).toBe("9876543210");
  });

  it("rejects 9-digit input", () => {
    expect(() => phoneDigitsSchema.parse("999990000")).toThrow();
  });

  it("rejects non-digit characters", () => {
    expect(() => phoneDigitsSchema.parse("99999a0001")).toThrow();
  });

  it("rejects leading +91 (the form separates prefix from digits)", () => {
    expect(() => phoneDigitsSchema.parse("+919999900001")).toThrow();
  });
});

describe("phoneE164Schema", () => {
  it("accepts the expected +91XXXXXXXXXX format", () => {
    expect(phoneE164Schema.parse("+919999900001")).toBe("+919999900001");
  });

  it("rejects non-+91 country codes", () => {
    expect(() => phoneE164Schema.parse("+12025551234")).toThrow();
  });

  it("rejects bare 10-digit numbers", () => {
    expect(() => phoneE164Schema.parse("9999900001")).toThrow();
  });
});

describe("toE164", () => {
  it("prepends +91", () => {
    expect(toE164("9999900001")).toBe("+919999900001");
  });

  it("round-trips through phoneE164Schema for any valid 10-digit input", () => {
    const phone = toE164(phoneDigitsSchema.parse("9876543210"));
    expect(phoneE164Schema.parse(phone)).toBe("+919876543210");
  });
});

describe("otpSchema", () => {
  it("accepts a 6-digit code", () => {
    expect(otpSchema.parse("123456")).toBe("123456");
  });

  it("trims whitespace", () => {
    expect(otpSchema.parse(" 123456 ")).toBe("123456");
  });

  it("rejects 5 digits", () => {
    expect(() => otpSchema.parse("12345")).toThrow();
  });

  it("rejects non-numeric characters", () => {
    expect(() => otpSchema.parse("12345a")).toThrow();
  });
});

describe("profileSchema", () => {
  const valid = {
    full_name: "Asha Kumar",
    building_id: "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
    flat_number: "A-101",
  };

  it("accepts a well-formed profile", () => {
    expect(profileSchema.parse(valid)).toEqual(valid);
  });

  it("trims surrounding whitespace on text fields", () => {
    const parsed = profileSchema.parse({
      ...valid,
      full_name: "  Asha Kumar  ",
      flat_number: "  A-101 ",
    });
    expect(parsed.full_name).toBe("Asha Kumar");
    expect(parsed.flat_number).toBe("A-101");
  });

  it("rejects a full_name under 2 chars", () => {
    expect(() => profileSchema.parse({ ...valid, full_name: "A" })).toThrow();
  });

  it("rejects a full_name over 80 chars", () => {
    expect(() =>
      profileSchema.parse({ ...valid, full_name: "A".repeat(81) }),
    ).toThrow();
  });

  it("rejects a flat_number over 16 chars", () => {
    expect(() =>
      profileSchema.parse({ ...valid, flat_number: "X".repeat(17) }),
    ).toThrow();
  });

  it("rejects an empty flat_number", () => {
    expect(() => profileSchema.parse({ ...valid, flat_number: "" })).toThrow();
  });

  it("rejects a non-uuid building_id", () => {
    expect(() =>
      profileSchema.parse({ ...valid, building_id: "not-a-uuid" }),
    ).toThrow();
  });
});
