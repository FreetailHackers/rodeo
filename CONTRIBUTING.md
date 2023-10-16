# Philosophy

I ask that you keep these three guiding principles in mind when contributing to Rodeo (from most to least important):

1. [KISS](https://wiki.c2.com/?KeepItSimple): don't overengineer your code. See also: [DTSTTCPW](http://wiki.c2.com/?DoTheSimplestThingThatCouldPossiblyWork), [YAGNI](https://wiki.c2.com/?YouArentGonnaNeedIt)
2. Mobile-first: test on a 320px wide viewport first while you are working on the frontend. This doesn't mean to neglect the desktop layout; just make sure it works on smaller screens first and scale up (because we often forget if we do it the other way around).
3. [Progressive enhancement](https://en.wikipedia.org/wiki/Progressive_enhancement): if it doesn't cost anything, then use the browser's native ability to submit [form actions](https://kit.svelte.dev/docs/form-actions) so users without access to JavaScript can still use your feature.

# Setup

To run Rodeo locally, you need [NodeJS](https://nodejs.org/) and [PostgreSQL](https://www.postgresql.org/). Below are installation instructions for each operating system.

## macOS

The recommended way to install NodeJS and PostgreSQL on macOS is through [Homebrew](https://brew.sh/). After installing Homebrew, you can run `brew install node@18 postgresql@15`. Homebrew should inform you about adding the PostgreSQL utilities to your PATH with a command like:

`echo 'export PATH="/usr/local/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc`

Run this so that you can use the `createdb` utility. Finally, run `brew services start postgresql@15` to boot PostgreSQL as a background process.

## Windows

Help requested for PostgreSQL and NodeJS on Windows setup instructions!

## Linux

If you're using Linux, you can probably figure this out yourself.

## Final Steps

Once you've installed PostgreSQL and NodeJS, the next steps are the same for every OS. First, create a database named `rodeo-development` with `createdb rodeo-development`. Next, create a file named `.env` and put the following string in it, substituting username and password as appropriate. Most installations set the default username to either your operating system username or `postgres` and a blank default password. If this doesn't work you can consult your package manager's documentation.

`DATABASE_URL=postgres://username:password@localhost:5432/rodeo-development`
`DIRECT_URL=postgres://username:password@localhost:5432/rodeo-development`

Now run `npm install` to download our dependencies, `npx prisma migrate dev` to sync up your database to our schema, and `npx prisma db seed` to insert some dummy data. Finally, you can start the development server with `npm run dev` and log into the sample accounts by following the instructions at the top of the [the seed script](prisma/seed.ts).

# Conventions

- Use the `import/export` ESM syntax instead of `require` CommonJS syntax
- Avoid default exports (stick with named)
- Prefer `async/await` over Promises
- Always comment and annotate return type for all tRPC endpoints
- Compare enums to strings instead of enums
- When you change the Prisma schema, update the seed script as well so we always have an easy way to generate fake data

# Guides

Here are some tutorials to each key component in our stack, which is roughly ordered from highest to lowest level:

- [Svelte](https://svelte.dev/) is a frontend framework that generates the HTML and provides a way to write reusable UI components.
- [SvelteKit](https://kit.svelte.dev/) is an application framework that handles routing, server-side rendering, and all the "boring stuff" in web app development.
- [Zod](https://zod.dev/) is a TypeScript type inference and validation library that prevents invalid data from reaching our API.
- [tRPC](https://trpc.io/) is a backend library for full-stack TypeScript apps that enables us to write an API that can be queried in a type-safe manner, as if our endpoints were just regular TypeScript functions.
- [Prisma](https://www.prisma.io/) is a suite of tools for working with databases based on a declarative [Prisma schema](https://www.prisma.io/docs/concepts/components/prisma-schema). [Prisma Client](https://www.prisma.io/client) is an ORM that generates a type-safe API for interacting with your database and [Prisma Migrate](https://www.prisma.io/migrate) enables us to update our database schema in a reproducible way.

# Workflow

To get acquainted with the codebase, here's how to add a silly Easter egg setting to convert the homepage into sPoNgEbOb cAsE.

1. Clone the repository and make a new branch with `git checkout -b spongebob-text`.
2. **Update the schema**: add a boolean field named something descriptive like spongebobCase to the Settings model in [`prisma/schema.prisma`](prisma/schema.prisma) and give it a default value of false.
3. **Perform the migration**: Run `npx prisma migrate dev` and give the migration a sensible name. Refer to the [Prisma Migrate documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate/migrate-development-production) to learn more about migrations. You must also restart the development server by pressing CTRL-C and running `npm run dev` again. This is very important: the development server can usually pick up changes and automatically hot reload, but after performing a migration is a case where you must restart the server manually.
4. **Update the backend**: See the `update` function `src/lib/trpc/routes/settings.ts`. Since it doesn't do anything special besides saving any new settings to the database, the only thing you need to do here is update the Zod schema for Settings to include your new field. Refer to the [Zod documentation](https://zod.dev/?id=basic-usage) to see what validators are available. Since SpongeBob Case should be visible to everybody, you must also add it to the `getPublic` function.
5. **Update the frontend**: In `src/routes/admin/+page.svelte`, add a `<Toggle>` for your new setting under the main `<form>`. The key part is to set the `name` prop of the `<Toggle>` to match the name in the Prisma schema and its `checked` prop to `{data.settings.spongebobCase}`.
6. **Update the form action**: In the `settings` action in `src/routes/admin/+page.server.ts`, add a new key-value pair to the call to `trpc(locals.auth).settings.update` that sets your setting's name to the value of the `<Toggle>`, which can be retrieved with `formData.get('spongebobCase') === 'on'`.

Now if you switch the toggle and press save, it should now persist between refreshes. Let's take a break now to look at the bigger picture of data flow in a SvelteKit app, beginning with loading the admin panel and ending with toggling the SpongeBob Case setting:

- When a user requests a page, SvelteKit simply calls the `load` function in the corresponding `page.server.ts` and passes its return value as a special variable named `data` in `page.svelte`. SvelteKit uses filesystem-based routing, so the `/admin` route corresponds to the files in `src/routes/admin`. In `src/routes/admin/+page.server.ts`, the `load` function invokes the `getAll` endpoint in `src/lib/trpc/routes/settings.ts`, which reads the settings from the database.
- In `src/routes/admin/+page.svelte`, the `<Toggle>` reads the state of the setting by taking the value of `data.settings.spongebobCase`.
- When the user presses the save button, the contents of the form are submitted to the action corresponding to its `action` attribute. This `<form>` has `action="?/settings"` so the `settings` action in `src/routes/admin/+page.server.ts` is run, which can read the values of the inputs by calling [`FormData.get()`](https://developer.mozilla.org/en-US/docs/Web/API/FormData/get) with the `name` of the input as a parameter. It can then call tRPC to save the settings to the database.

7. Now, in order to apply SpongeBob case to the homepage, you can transform `data.settings.homepageText` in the `<script>` section of `src/routes/+page.svelte` by alternating the case of each character:

```js
if (data.settings.spongebobCase) {
	data.settings.homepageText = data.settings.homepageText
		.split('')
		.map((char, i) => (i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()))
		.join('');
}
```

8. Finally, you are ready to make a merge request. Run `git add .` and `git commit` to save your work. Committing will run a series of pre-commit hooks that check for compile errors, lint for style issues, and checks that you've created the necessary migrations. Fix any issues that prevent you from committing and run `git push -u origin spongebob-text` to create a new branch on GitLab. Then open a new merge request.
9. QA will then review your work and leave comments on your GitLab. After addressing any issues, QA will approve and merge your request. Congratulations! You just made your first contribution to Rodeo.

# Architecture

Rodeo is a [SvelteKit](https://kit.svelte.dev/) app that is built on top of a [TRPC](https://trpc.io/) backend that uses the [Prisma](https://www.prisma.io/) ORM to query a [PostgreSQL](https://www.postgresql.org/) database. The database schema, migration history, and seed script are located in the `prisma` directory. The backend is located in the `src/lib/trpc` directory, which contains a couple of TRPC boilerplate files and a `routes` folder, which is where the actual endpoints are located. The frontend is located in `src/routes`. SvelteKit uses filesystem-based routing, so each folder corresponds to an actual route and contains a `+page.svelte` file and a `+page.server.ts` file. `+page.svelte` contains all the HTML, CSS, and JavaScript for a page, while the job of `+page.server.ts` is twofold: it exports a `load` function that fetches all the data the frontend needs from TRPC, and handlers for any forms on the page. Reuseable components in pure Svelte go in `src/lib/components`.

# Deployment

Every commit to the master branch is deployed to [https://rodeo-nightly.freetailhackers.com](https://rodeo-nightly.freetailhackers.com). In addition, every branch gets its own preview deployment that can be accessed through [Deployments > Environments](https://gitlab.com/freetail-hackers/rodeo/-/environments). To deploy to production, a user with at least Maintainer access that was NOT the author of the commit must promote a preview deployment from the Deployments > Environments tab.
