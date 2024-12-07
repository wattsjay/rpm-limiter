# Rate-per-minute Limiter

Declarative and dead simple RPM limiter with async syntax and Typescript support. Package size of 3.4KB and with zero dependencies.

## Install

```shell
npm i rpm-limiter
```

## Usage

```ts
import { initRatePerMinuteLimiter } from 'rpm-limiter'

const { rateLimiter } = initRatePerMinuteLimiter(3)

async function proofReadMarkdownDocs() {
  const mdDocs = read.md()

  for (const mdDoc of mdDocs) {
    // The first three mdDocs will wait for 0 seconds.
    // The fourth mdDoc, however, will have to wait for the time
    // remaining in the first 1-minute interval.
    await rateLimiter()
    const proofedDoc = await proofDocWithGeminiApi(mdDoc)
    write.md(proofedDoc)
  }
}
```

## Contributions

Pull Requests are welcomed directly to the `main` branch.
