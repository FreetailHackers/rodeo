# Rodeo

Rodeo is an all-in-one web app for running and experiencing a hackathon end-to-end.

For hackers, it includes an application portal.

For organizers, it provides an admin panel for announcements and decisions management.

For mentors, sponsors, judges, volunteers, and everybody else, it serves as a virtual ID, live site, and help desk ticketing system.

# Developing

To run Rodeo locally, you need [PostgreSQL](https://www.postgresql.org/).

Run `createdb rodeo-development` to initialize your local development database, and put the link in your `.env` file:

`DATABASE_URL=postgres://username:password@localhost:5432/rodeo-development`

The default username and password is often your login name to your operating system.

Next, it is recommended to install Prisma globally as you will be using it a lot:

`npm install -g prisma`

Run `prisma migrate dev` to push the schema to the database and seed it.

Finally, now you can do `npm install` and `npm run dev` to start the development server. You may also want to run `prisma studio` if you want to hand-tinker with the database in a GUI.

# Guides

Here are some tutorials to each key component in our stack:

- [Svelte](https://svelte.dev/)
- [SvelteKit](https://kit.svelte.dev/)
- [tRPC](https://trpc.io/)
- [Zod](https://zod.dev/)
- [Prisma](https://www.prisma.io/)

# Walkthrough

To get acquainted with the codebase, here's how to add a field to the hacker application:

1. Add the field's name and data type in `prisma/schema.prisma`. Refer to the [Prisma documentation](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model) to see what types are available.
2. Update the seed script at `prisma/seed.ts` with placeholder values for your new field. This is not strictly required functionally but I require this for development so the seed script is useful and stays up to date.
3. Run `prisma migrate dev` to sync the new schema to your database and update the TypeScript type definitions. Refer to the [Prisma Migrate documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate/migrate-development-production) to learn more about migrations.
4. In the backend `src/lib/trpc/router.ts`, update the Zod schema for users to include your new field. Refer to the [Zod documentation](https://zod.dev/?id=basic-usage) to see what validators are available.
5. Restart the development server by sending CTRL-C to the process and running `npm run dev` again. This is very important: the development server can usually pick up changes and automatically hot reload, but after performing a Prisma migration is a case where you must restart the server manually.
6. On the application frontend `src/routes/apply/+page.svelte`, add a `<label>` and `<input>` for your new question. The key part is to make sure the new `<input>` has a `name` attribute that matches the name in the Prisma schema.

# Conventions

- Use the `import/export` ESM syntax instead of `require` CommonJS syntax
- Prefer `async/await` over Promises
- Always comment and annotate return type for all TRPC endpoints
- Compare enums to enums instead of string
