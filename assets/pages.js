
module.exports = exports = {
  nav: [
    {
      path: '/',
      name: 'Home'
    }, {
      path: '#about',
      name: 'About'
    }, {
      path: 'https://github.com/notablemind/notablemind/issues',
      name: 'Issues',
      target: '_blank'
    }, {
      path: '/settings',
      icon: 'icon-cog'
    }, {
      path: 'https://github.com/notablemind/notablemind/',
      target: '_blank',
      icon: 'icon-github'
    }
  ],
  routes: {
    '/': 'NoteList',
    '/list/:id': 'NoteList',
    '/settings': 'Settings'
  }
};

