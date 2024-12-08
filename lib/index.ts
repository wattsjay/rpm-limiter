/**
 * A generator function that returns the miliseconds to wait
 * before making the next call to comply with the supplied RPM.
 *
 * @param rpm - The rate per minute.
 * @param minuteMs - The number of milliseconds in a minute. Useful for testing.
 * @returns A generator function that returns the number of milliseconds to wait.
 *
 * @example
 * ```ts
 *  const generator = initTimeUntilNextCall(3)
 *  console.log(generator.next().value) // 0
 *  console.log(generator.next().value) // 0
 *  console.log(generator.next().value) // 0
 *  console.log(generator.next().value) // 60_000
 * ```
 */
export function* initTimeUntilNextMinute(rpm: number, minuteMs = 60_000) {
  let start = Date.now()
  let count = 1

  while (true) {
    yield (() => {
      const end = start + minuteMs
      const remainder = end - Date.now()

      if (remainder < 0) {
        count = 1
        start = Date.now()
      }

      count++

      if (count > rpm) {
        console.log(`[RPM_LIMITER] Limit reached. Waiting 1 minute…`)
        return remainder
      }

      return 0
    })()
  }
}

/**
 * Wait for a specified number of milliseconds.
 *
 * @example
 * ```ts
 * const { waitFor, clearWaitFor } = initWaitFor()
 * await waitFor(1000)
 * clearWaitFor() // clears the timeout
 * ```
 */
export function initWaitFor() {
  let timeoutId: null | NodeJS.Timeout = null
  return {
    waitFor: async (ms: number) =>
      await new Promise((resolve) => {
        timeoutId = setTimeout(resolve, ms)
      }),
    clearWaitFor: () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
    }
  }
}

/**
 * Initialize a rate per minute limiter.
 *
 * @param rpm - The rate per minute.
 * @param minuteMs - The number of milliseconds in a minute. Useful for testing.
 * @returns An object with a rateLimiter function and a clear function.
 *
 * @example
 * ```ts
 * const { rateLimiter } = initRatePerMinuteLimiter(3)
 *
 * async function generateBlogPosts() {
 *   const prompts = read.prompts()
 *
 *   for (const prompt of prompts) {
 *     await rateLimiter() // <- 4th call has to wait 1 minute
 *     const blogPost = await writeBlogPostWithGemini(prompt)
 *
 *     write.blogPost(blogPost)
 *   }
 * }
 * ```
 */
export function initRatePerMinuteLimiter(rpm: number, minuteMs = 60_000) {
  const { waitFor, clearWaitFor: clear } = initWaitFor()
  const timeoutGenerator = initTimeUntilNextMinute(rpm, minuteMs)

  return {
    rateLimiter: async () => {
      const timeout = timeoutGenerator.next().value as number
      await waitFor(timeout)
    },
    /**
     * Clear the timeout.
     */
    clear
  }
}
