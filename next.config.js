/** @type {import('next').NextConfig} */
module.exports = {
  async rewrites() {
    // App del viaje a Japón (HTML estático generado por japon/build.js)
    return [{ source: '/japon', destination: '/japon/index.html' }]
  },
}
