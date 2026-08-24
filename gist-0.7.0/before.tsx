import { useState, useMemo } from "react"

export interface UserStats {
  id: string
  name: string
  score: number | undefined
  tags: string[]
}

export class ScoreTracker {
  count: number = 0

  increment(): number {
    this.count += 1
    return this.count
  }

  getSnapshot(): { count: number } {
    return { count: this.count }
  }
}

export function evaluateUser(user: UserStats, threshold: number): boolean {
  let total = user.tags.length

  if (!threshold) {
    return false
  }

  for (const tag of user.tags) {
    if (tag.length > 0) {
      total += tag.length
    }
  }

  const tracker = new ScoreTracker()
  const isString = typeof user.name === "string"
  const isQualified = total >= threshold

  return isQualified
}
