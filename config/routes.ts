export default [
  {
    path: '/user',
    layout: false,
    routes: [
      { path: '/user', routes: [{ name: '登录', path: '/user/login', component: './user/Login' }] },
    ],
  },
  { path: '/welcome', name: '欢迎', icon: 'smile', component: './Welcome' },
  {
    path: '/admin',
    name: '管理页',
    icon: 'crown',
    access: 'canAdmin',
    component: './Admin',
    routes: [
      { path: '/admin/sub-page', name: '二级管理页', icon: 'smile', component: './Welcome' },
    ],
  },
  {
    name: 'kvm',
    icon: 'table',
    path: '/kvm',
    routes: [
      { name: '服务器', icon: 'smile', path: 'server', component: './kvm/server'},
      { name: '虚拟机', icon: 'smile', path: 'instance', component: './kvm/instance'},
      {
        name: 'VNC',
        icon: 'smile',
        path: 'vnc',
        component: './kvm/novnc',
        hideInMenu: true,
        layout: {
          hideMenu: true,
          hideNav: true,
          hideFooter: true
        },
      },
      {
        name: 'console',
        icon: 'smile',
        path: 'console',
        component: './kvm/console',
        hideInMenu: true,
        layout: {
          hideMenu: true,
          hideNav: true,
          hideFooter: true
        },
      },
    ]
  },
  {
    name: '资产',
    icon: 'table',
    path: '/assets',
    routes: [
      { name: '虚拟机', icon: 'smile', path: 'vm', component: './assets/vm'},
      {
        name: '代理',
        icon: 'smile',
        path: 'proxy',
        routes: [
          {name: '列表', icon: 'smile', path: 'list', component: './assets/proxy'},
          {name: '平台', icon: 'smile', path: 'platform', component: './assets/proxy/platform'},
        ]
      }
    ]
  },
  { path: '/', redirect: '/welcome' },
  { component: './404' },
];
