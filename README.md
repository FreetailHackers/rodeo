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

Finally, now you can do `npm install` and `npm run dev` to start the development server.

# Guides

Here are some tutorials to each key component in our stack:

- [Svelte](https://svelte.dev/)
- [SvelteKit](https://kit.svelte.dev/)
- [tRPC](https://trpc.io/)
- [Zod](https://zod.dev/)
- [Prisma](https://www.prisma.io/)
