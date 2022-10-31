/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
    trailingSlash: true,
    basePath: process.env.NODE_ENV === 'production' ? '/savra-front' : '',
    publicRuntimeConfig: {
        contextPath: process.env.NODE_ENV === 'production' ? '/savra-front' : '',
        uploadPath: process.env.NODE_ENV === 'production' ? '/savra-front/upload.php' : '/api/upload'
    }
}

module.exports = nextConfig
