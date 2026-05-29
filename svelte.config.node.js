import adapter from '@sveltejs/adapter-node';
/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    experimental: {
			remoteFunctions: true
		},
    csrf: {
      checkOrigin: false,
    },
    adapter: adapter()
  },
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};
export default config;

/*
import adapter from '@sveltejs/adapter-auto';
const config = {
  compilerOptions: {
    runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
  },
  kit: {
    adapter: adapter()
  }
};
export default config;
*/
