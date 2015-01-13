/**
 * Client Routes
 */

  Router.route('/', {
    name: 'Index',
    controller: 'IndexController'
  });

  Router.route('/dashboard', {
  	name: 'Dashboard',
    controller: 'DocumentsController'
  });

  Router.route('/document/:_id', {
  	name: 'Document',
  	controller: 'DocumentController'
  });

  Router.route('/verify-email/:token', {
    name: 'verifyEmail',
    controller: 'AccountsController',
    action: 'verifyEmail'
  });

  Router.route('/reset-password/:token', {
    name: 'resetPassword',
    controller: 'AccountsController',
    action: 'resetThePassword'
  });

