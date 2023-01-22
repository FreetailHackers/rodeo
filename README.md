# Rodeo

Everything that a hacker could ever need, all in one app.

# Developing

To run Rodeo locally, you need [PostgreSQL](https://www.postgresql.org/).

Run `createdb rodeo-development` and `createdb rodeo-development-shadow` to initialize your local development database, and put the link in your `.env` file:

`DATABASE_URL=postgres://username:password@localhost:5432/rodeo-development`

The default username and password is often your login name to your operating system.

Next, it is recommended to install Prisma globally as you will be using it a lot:

`npm install -g prisma`

Run `prisma migrate dev` to push the schema to the database and seed it.

Finally, now you can do `npm install` and `npm run dev` to start the development server.
