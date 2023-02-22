export const prerender = true;

export const load = async () => {
	return { release: __RELEASE__, build: __BUILD__, timestamp: __TIMESTAMP__ };
};
