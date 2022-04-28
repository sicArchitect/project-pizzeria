module.export = {
  port: process.env.port,
  files: ['./**/*.{html,htm,css,scss,js'],
  server: {
    baseDir: ['./src', './build/contracts'],
  },
};
