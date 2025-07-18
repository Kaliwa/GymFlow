import { createHash } from "crypto"

export function sha512(str: string): string {
    return createHash("sha512").update(str).digest("hex")
}