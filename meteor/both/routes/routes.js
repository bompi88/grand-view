////////////////////////////////////////////////////////////////////////////////
// Client Routes
////////////////////////////////////////////////////////////////////////////////

/**
 * Landing page
 */
Router.route('/', {
  name: 'Index',
  controller: 'IndexController'
});

/**
 * Dashboard
 */
Router.route('/dashboard', {
	name: 'Dashboard',
  controller: 'DocumentsController'
});

/**
 * Edit Document
 */
Router.route('/document/:_id', {
	name: 'Document',
	controller: 'DocumentController'
});

/**
 * Verify Email
 */
Router.route('/verify-email/:token', {
  name: 'verifyEmail',
  controller: 'AccountsController',
  action: 'verifyEmail'
});

/**
 * Reset Password
 */
Router.route('/reset-password/:token', {
  name: 'resetPassword',
  controller: 'AccountsController',
  action: 'resetThePassword'
});
