<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Giffium&background=tiles&project=Monorepo" alt="Giffium">
</p>

# Giffium

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)
[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)

Giffium is a tool to generate a socially shareable gif from a diff of two snippets of code/config.

## Inspiration

Giffium was inspired by [Shiki Magic Move](https://github.com/rhysd/Shiki-Magic-Move) and [Carbon](https://carbon.now.sh/)/[Ray.so](https://ray.so/).

It was created as part of the [SolidJS Hackathon](https://hack.solidjs.com/)

### Libraries

This project leans heavily on these libraries:

- [Shiki](https://shiki.matsu.io/)
- [Shiki Magic Move](https://github.com/rhysd/Shiki-Magic-Move)
- [SolidJS](https://www.solidjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Solid UI](https://www.solid-ui.com/)

## Contributing

Giffium is a monorepo managed by [turborepo](https://turborepo.org). The project also requires the use of [pnpm](https://pnpm.io) to manage dependencies and [Node.js](https://nodejs.org) version v22.10.0

### Getting Started

To get started with the project, first install [pnpm](https://pnpm.io) and install dependencies with `pnpm i`.

```bash
pnpm i
```

### Building

To build the project, run the following command:

```bash
pnpm run build
```

This will build all the packages in the monorepo.

If you run into any issues, please check the [pnpm docs](https://pnpm.io/installation) for more information.

### Running the Playground

To run the playground, run the following command:

```bash
pnpm run dev
```

This will start all the playground in watch mode.

### SolidJS

The project is built using [SolidJS](https://www.solidjs.com/). If you are new to SolidJS, we recommend checking out their [documentation](https://www.solidjs.com/docs) and [tutorials](https://www.solidjs.com/tutorial).

### Suggested VSCode Extensions

- [Tailwind CSS IntelliSense](https://tailwindcss.com/)
- [Headwind](https://marketplace.visualstudio.com/items?itemName=heybourn.headwind)
- [Prettier - Code formatter](https://prettier.io/)

## License

MIT License

Copyright (c) 2024 Chris Griffing

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
