# clipship

A multi-media editor for cutting and converting video clips, right in your browser.

## Development

The repository consists of a [SvelteKit](https://svelte.dev/docs/kit/introduction) project running on [Node.js](https://nodejs.org/en). To get started with development, use the [pnpm](https://pnpm.io/) package manager to install all necessary dependencies.

Please note that due to the repository depending on a package from the GitHub registry, you may [need to login](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-with-a-personal-access-token) first using `pnpm login`.

```sh
# Log into the GitHub package registry with your username and token
pnpm login --registry=https://npm.pkg.github.com

# Install dependencies from package.json
pnpm install
```

After that, you're good to go - simply start a hot-reloading Vite server with `pnpm dev`:

```sh
# Start the development server
pnpm dev

# Optionally, pass --open to immediately open the website in your browser
pnpm dev --open
```
