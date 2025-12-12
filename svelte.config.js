import adapter from '@sveltejs/adapter-vercel'; // Changed adapter

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(), // Simplified adapter configuration
		// Removed paths object
	}
};

export default config;
