/*
  MIT License

  Copyright (c) 2024 Jay Watts

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

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
 * Round milliseconds to the nearest multiple of milliseconds.
 *
 * @example
 * ```ts
 * console.log(roundMiliseconds(666.666, 5)) // 665
 * ```
 */
export function roundMiliseconds(ms: number, nearestMs: number) {
  return Math.round(ms / nearestMs) * nearestMs
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
 * const { rateLimiter, clear } = initRatePerMinuteLimiter(3)
 *
 * await rateLimiter()
 * await rateLimiter()
 * await rateLimiter()
 * console.log('This is logged immediately')
 *
 * await rateLimiter()
 * console.log('This is logged after 1 minute')
 *
 * clear() // Clear the timeout.
 * ```
 */
export function initRatePerMinuteLimiter(rpm: number, minuteMs = 60_000) {
  const { waitFor, clearWaitFor } = initWaitFor()

  const createRateLimiter = () => {
    const timeoutGenerator = initTimeUntilNextMinute(rpm, minuteMs)
    return async () => {
      const timeout = timeoutGenerator.next().value as number
      await waitFor(timeout)
    }
  }

  return {
    get rateLimiter() {
      return createRateLimiter()
    },
    /**
     * Clear the timeout.
     */
    clear: () => {
      clearWaitFor()
    }
  }
}
