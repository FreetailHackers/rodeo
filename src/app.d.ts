// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { Role, Status } from '@prisma/client';

// and what to do when importing types
declare namespace App {
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface Platform {}
}

// Lucia Auth boilerplate
declare global {
	namespace App {
		interface Locals {
			auth: import('lucia-auth').AuthRequest;
		}
	}
}
declare global {
	namespace Lucia {
		type Auth = import('$lib/lucia').Auth;
		type UserAttributes = { email: string; role: Role[]; status: Status };
	}
}
export {};
