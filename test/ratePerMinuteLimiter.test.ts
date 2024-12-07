import { beforeAll, describe, expect, it } from 'vitest'
import {
  initTimeUntilNextMinute,
  initWaitFor,
  initRatePerMinuteLimiter,
  roundMiliseconds
} from '../lib'

const MS_PER_MINUTE = 250

describe.sequential(
  'timerGenerator',
  async () => {
    const { waitFor, clearWaitFor } = initWaitFor()
    const generator = initTimeUntilNextMinute(3, MS_PER_MINUTE)
    const getNextTimeout = () =>
      roundMiliseconds(generator.next().value as number, 5)
    beforeAll(clearWaitFor)

    it('should limit quick successive calls if over the rpm', () => {
      getNextTimeout() // 1st call
      getNextTimeout() // 2nd call
      getNextTimeout() // 3rd call <- limit reached
      expect(getNextTimeout()).toBe(MS_PER_MINUTE) // 1st call after limit
    })

    it('should reset after waiting for the last timeout', async () => {
      await waitFor(MS_PER_MINUTE) // <- wait for limit to reset
      expect(getNextTimeout()).toBe(0) // <- 2nd call after reset
    })

    it('should limit if calls are within the rpm but over the rate', async () => {
      expect(getNextTimeout()).toBe(0) // <- 3rd call after reset
      expect(getNextTimeout()).toBe(MS_PER_MINUTE)
    })
  },
  5 * MS_PER_MINUTE
)

describe('initRatePerMinuteLimiter', () => {
  const { rateLimiter, clear: reset } = initRatePerMinuteLimiter(
    3,
    MS_PER_MINUTE
  )
  beforeAll(reset)

  it('should break successive calls into batches', async () => {
    console.debug('Interval A')
    await rateLimiter()
    const timeStartIntervalA = Date.now()
    await rateLimiter()
    await rateLimiter()

    await rateLimiter()
    console.debug('Interval B')
    const timeStartIntervalB = Date.now()
    await rateLimiter()
    await rateLimiter()

    expect(roundMiliseconds(timeStartIntervalB - timeStartIntervalA, 10)).toBe(
      MS_PER_MINUTE
    )

    await rateLimiter()
    console.debug('Interval C')
    const timeStartIntervalC = Date.now()
    await rateLimiter()
    await rateLimiter()

    expect(roundMiliseconds(timeStartIntervalC - timeStartIntervalB, 10)).toBe(
      MS_PER_MINUTE
    )
  })
})
