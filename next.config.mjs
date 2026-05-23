/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Allows builds to succeed even if ESLint warnings exist
        ignoreDuringBuilds: true,
    },
    poweredByHeader: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'fakestoreapi.com',
            }
        ]
    }
};

export default nextConfig;
