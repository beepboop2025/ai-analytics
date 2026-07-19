import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("joins multiple class strings", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1")
  })

  it("drops falsy/conditional values", () => {
    expect(cn("a", false && "b", null, undefined, "c")).toBe("a c")
  })

  it("merges conflicting tailwind classes so the last one wins", () => {
    // tailwind-merge should collapse px-2 + px-4 to px-4
    expect(cn("px-2", "px-4")).toBe("px-4")
  })

  it("resolves conflicts across color utilities keeping the latest", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500")
  })

  it("supports object and array syntax from clsx", () => {
    expect(cn(["p-2", { hidden: false, block: true }])).toBe("p-2 block")
  })
})
