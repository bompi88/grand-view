/**
 * Client Routes
 */

Router.map(function () {

  this.route('Index', {
    path: '/',
    controller: 'IndexController'
  });

  this.route('Dashboard', {
  	path: '/dashboard',
    controller: 'DocumentsController'
  });

  this.route('Document', {
  	path: '/document/:_id',
  	controller: 'DocumentController'
  });

  this.route('verifyEmail', {
    path: '/verify-email/:token',
    controller: 'AccountsController',
    action: 'verifyEmail'
  });

  this.route('resetPassword', {
    path: '/reset-password/:token',
    controller: 'AccountsController',
    action: 'resetThePassword'
  });

});
