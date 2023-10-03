const withTwin = require('./config/withTwin')
/**
 * @type {import('next').NextConfig}
 */
module.exports = withTwin({
  reactStrictMode: true,
  images: {
    domains: ['i.ibb.co'],
    loader: 'default',
  },
  compiler: {
    styledComponents: true,
  },
})
