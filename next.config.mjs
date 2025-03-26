/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        dirs: ['src'],
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 's3-alpha-sig.figma.com',
                port: '',
                pathname: '/img/**',
            },
        ],
    },
};


export default nextConfig;
