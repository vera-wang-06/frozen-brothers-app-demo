module.exports = ({ config }) => {
  const mobile = {
    ...config,
    scheme: 'shop.25632473170.frozenbrothers',
    ios: { ...config.ios, bundleIdentifier: 'com.frozenbrothers.appdemo', supportsTablet: false },
    plugins: [...new Set([...(config.plugins || []), 'expo-web-browser'])],
  };
  if (process.env.GITHUB_PAGES !== 'true') return mobile;
  const repository = process.env.GITHUB_REPOSITORY || '';
  const [owner, name] = repository.split('/');
  if (!owner || !name) throw new Error('GITHUB_REPOSITORY must be owner/repository');
  const baseUrl = name.toLowerCase() === `${owner.toLowerCase()}.github.io` ? '' : `/${name}`;
  return { ...mobile, experiments: { ...config.experiments, baseUrl } };
};
