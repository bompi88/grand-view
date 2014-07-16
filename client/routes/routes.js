/**
 * Client Routes
 */

Router.map(function () {

  this.route('Index', {
    path: '/'
  });

  this.route('Dashboard', {
  	path: '/dashboard'
  });

  this.route('Document', {
  	path: '/document/:_id',
  	controller: 'DocumentController'
  });

});
