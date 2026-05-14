import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		experimental: {
			remoteFunctions: true
		},
		adapter: adapter({
			// see below for options that can be set here
		})
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;