# Philosophy

I ask that you keep these three guiding principles in mind when contributing to Rodeo (from most to least important):

1. [KISS](https://wiki.c2.com/?KeepItSimple): don't overengineer your code. See also: [DTSTTCPW](http://wiki.c2.com/?DoTheSimplestThingThatCouldPossiblyWork), [YAGNI](https://wiki.c2.com/?YouArentGonnaNeedIt)
2. Mobile-first: test on a 320px wide viewport first while you are working on the frontend. This doesn't mean to neglect the desktop layout; just make sure it works on smaller screens first and scale up (because we often forget if we do it the other way around).
3. [Progressive enhancement](https://en.wikipedia.org/wiki/Progressive_enhancement): if it doesn't cost anything, then use the browser's native ability to submit [form actions](https://kit.svelte.dev/docs/form-actions) so users without access to JavaScript can still use your feature.

# Setup

To run Rodeo locally, you need [PostgreSQL](https://www.postgresql.org/).

Run `createdb rodeo-development` to initialize your local development database, and put the link in your `.env` file:

`DATABASE_URL=postgres://username:password@localhost:5432/rodeo-development`

The default username and password is often your login name to your operating system.

Next, it is recommended to install Prisma globally as you will be using it a lot:

`npm install -g prisma`

Run `prisma migrate dev` to push the schema to the database. You probably will want to run `prisma db seed` as well to insert some dummy data.

Finally, now you can do `npm install` and `npm run dev` to start the development server. You may also want to run `prisma studio` if you want to hand-tinker with the database in a GUI.

# Conventions

- Use the `import/export` ESM syntax instead of `require` CommonJS syntax
- Prefer `async/await` over Promises
- Always comment and annotate return type for all TRPC endpoints
- Compare enums to enums instead of string

# Guides

Here are some tutorials to each key component in our stack:

- [Svelte](https://svelte.dev/)
- [SvelteKit](https://kit.svelte.dev/)
- [tRPC](https://trpc.io/)
- [Zod](https://zod.dev/)
- [Prisma](https://www.prisma.io/)

# Workflow

To get acquainted with the codebase, here's how to add a field to the hacker application:

1. Add the field's name and data type in `prisma/schema.prisma`. Refer to the [Prisma documentation](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model) to see what types are available.
2. Update the seed script at `prisma/seed.ts` with placeholder values for your new field. This is not strictly required functionally but I require this for development so the seed script is useful and stays up to date.
3. Run `prisma migrate dev` to sync the new schema to your database and update the TypeScript type definitions. Refer to the [Prisma Migrate documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate/migrate-development-production) to learn more about migrations.
4. In the backend `src/lib/trpc/router.ts`, update the Zod schema for users to include your new field. Refer to the [Zod documentation](https://zod.dev/?id=basic-usage) to see what validators are available.
5. Restart the development server by sending CTRL-C to the process and running `npm run dev` again. This is very important: the development server can usually pick up changes and automatically hot reload, but after performing a Prisma migration is a case where you must restart the server manually.
6. On the application frontend `src/routes/apply/+page.svelte`, add a `<label>` and `<input>` for your new question. The key part is to make sure the new `<input>` has a `name` attribute that matches the name in the Prisma schema.

# Architecture

Rodeo is a [SvelteKit](https://kit.svelte.dev/) app that is built on top of a [TRPC](https://trpc.io/) backend that uses the [Prisma](https://www.prisma.io/) ORM to query a [PostgreSQL](https://www.postgresql.org/) database. The database schema, migration history, and seed script are located in the `prisma` directory. The backend is located in the `src/lib/trpc` directory, which contains a couple of TRPC boilerplate files and a `routes` folder, which is where the actual endpoints are located. The frontend is located in `src/routes`. SvelteKit uses filesystem-based routing, so each folder corresponds to an actual route and contains a `+page.svelte` file and a `+page.server.ts` file. `+page.svelte` contains all the HTML, CSS, and JavaScript for a page, while the job of `+page.server.ts` is twofold: it exports a `load` function that fetches all the data the frontend needs from TRPC, and handlers for any forms on the page. Reuseable components in pure Svelte go in `src/lib/components`.
