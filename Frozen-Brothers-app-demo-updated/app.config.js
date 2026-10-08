module.exports = ({ config }) => {
  if (process.env.GITHUB_PAGES !== 'true') return config;
  const repository = process.env.GITHUB_REPOSITORY || '';
  const [owner, name] = repository.split('/');
  if (!owner || !name) throw new Error('GITHUB_REPOSITORY must be owner/repository');
  const baseUrl = name.toLowerCase() === `${owner.toLowerCase()}.github.io` ? '' : `/${name}`;
  return { ...config, experiments: { ...config.experiments, baseUrl } };
};
