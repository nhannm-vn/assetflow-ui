import { describe, expect, it } from "vitest";
import { cn } from "@/lib/cn";

describe("cn()", () => {
  it("joins plain class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    const isFalse = false;
    expect(cn("a", isFalse && "b", undefined, null, "c")).toBe("a c");
  });

  it("resolves conflicting Tailwind utilities, keeping the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
