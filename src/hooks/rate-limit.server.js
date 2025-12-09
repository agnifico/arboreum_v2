// src/hooks/rate-limit.server.js
const loginAttempts = new Map(); // In-memory store for login attempts
const registrationAttempts = new Map(); // In-memory store for registration attempts
const WINDOW_SIZE_IN_SECONDS = 60; // Time window for rate limiting
const MAX_LOGIN_ATTEMPTS_PER_WINDOW = 5;
const MAX_REGISTRATION_ATTEMPTS_PER_WINDOW = 3;

function rateLimit(attemptsMap, key, maxAttempts) {
    const now = Date.now();
    const windowStart = now - WINDOW_SIZE_IN_SECONDS * 1000;

    attemptsMap.set(key, (attemptsMap.get(key) || []).filter(t => t > windowStart));
    attemptsMap.get(key).push(now);

    return attemptsMap.get(key).length > maxAttempts;
}

export async function handle({ event, resolve }) {
    if (event.url.pathname === '/login' && event.request.method === 'POST') {
        const ipAddress = event.clientAddress; // Or use a more sophisticated way to identify the user
        if (rateLimit(loginAttempts, ipAddress, MAX_LOGIN_ATTEMPTS_PER_WINDOW)) {
            console.warn(`Rate limit exceeded for login from IP: ${ipAddress}`);
            return new Response(JSON.stringify({ message: 'Too many login attempts. Please try again later.' }), {
                status: 429, // Too Many Requests
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    if (event.url.pathname === '/register' && event.request.method === 'POST') {
        const ipAddress = event.clientAddress;
        if (rateLimit(registrationAttempts, ipAddress, MAX_REGISTRATION_ATTEMPTS_PER_WINDOW)) {
            console.warn(`Rate limit exceeded for registration from IP: ${ipAddress}`);
            return new Response(JSON.stringify({ message: 'Too many registration attempts. Please try again later.' }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    return await resolve(event);
}