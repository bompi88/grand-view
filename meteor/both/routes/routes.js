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
 * Documents
 */
Router.route('/documents', {
	name: 'Documents',
  controller: 'DocumentsController'
});

/**
 * Dashboard
 */
Router.route('/templates', {
  name: 'Templates',
  controller: 'TemplatesController'
});

/**
 * Trash can
 */
Router.route('/trash', {
  name: 'Trash',
  controller: 'TrashController'
});

/**
 * Edit Document
 */
Router.route('/document/:_id', {
	name: 'Document',
	controller: 'DocumentController'
});

/**
 * Edit Template
 */
Router.route('/template/:_id', {
  name: 'Template',
  controller: 'TemplateController'
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
