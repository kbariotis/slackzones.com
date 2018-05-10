require('./../scss/boot.scss');

const pathname = window.location.pathname;

if (pathname === '/') {
  import(/* webpackChunkName: "index" */ './index')
    .catch(error => console.log(error))
    .then(() => console.log('loaded'));
} else if (pathname === '/map') {
  import(/* webpackChunkName: "map" */ './map')
    .catch(error => console.log(error))
    .then(() => console.log('loaded'));
}
