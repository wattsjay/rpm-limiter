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

---

## Develop

### Clone

```shell
git clone https://github.com/wattsjay/rpm-limiter.git
cd rpm-limiter
npm i
```

### Dependencies

- **`Vite`** (6.0.1)
  - `vitest` (2.1.8)
  - `vite-plugin-dts` (4.3.0)
- **`ESlint`** (9.16.0)
  - `eslint-config-prettier` (9.1.0)
  - `eslint-plugin-prettier` (5.2.1)
- **`Prettier`** (3.4.2)
- **`TypeScript`** (5.6.2)
  - `typescript-eslint` (8.17.0)

### Test

```shell
npm run test
```

### Build

```shell
npm run build
```

---

## Contributions

Pull Requests are welcomed directly to the `main` branch.
