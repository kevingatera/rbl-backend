/* istanbul ignore file */
import nodemon from "nodemon";

setTimeout(() => {
  nodemon({ script: 'src/index.js', delay: 5000, watch: '/src' });
  nodemon
    .on('start', () => {
      console.log('[nodemon] starting web server');
    })
    .on('quit', () => {
      console.log('[nodemon] exit web server');
      process.exit();
    })
    .on('restart', files => {
      console.log('[nodemon] restarting due to: ', files);
    });
}, 5000);