import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
//成员5
import MyLikes from '../views/Social/MyLikes.vue'
import MyRatings from '../views/Social/MyRatings.vue'
import Schedule from '../views/Social/Schedule.vue'
import SocialDashboard from '../views/Social/SocialDashboard.vue'
import Login from '../views/User/Login.vue'
import Register from '../views/User/Register.vue'
import Acconut from '../views/User/Account.vue'
import { useUser } from '../views/User/composables/useUser'; 

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home，
    meta: { requiresAuth: true } 
  },
  // 成员 2: 用户系统预留
  { path: '/login', name: 'Login', component: () => import('../views/User/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/User/Register.vue') }, 
  { path: '/account', name: 'Account', component: () => import('../views/User/Account.vue') },
  
  // 成员 3: 课程系统预留
  { path: '/courses', name: 'Courses', component: () => import('../views/Course/CourseList.vue') },
  { path: '/my-selection', name: 'MySelection', component: () => import('../views/Course/MySelection.vue') },
  // 成员 4: 论坛系统预留
  { path: '/forum', name: 'Forum', component: () => import('../views/Forum/ForumMain.vue') },
  { path: '/forum/create', name: 'CreatePost', component: () => import('../views/Forum/CreatePost.vue') },
  { path: '/forum/:id/edit', name: 'EditPost', component: () => import('../views/Forum/EditPost.vue') },
  { path: '/forum/:id', name: 'PostDetail', component: () => import('../views/Forum/PostDetail.vue') },

  // 成员 5: 社交/课表预留
  {
  path: '/social/likes',
  name: 'MyLikes',
  component: MyLikes
},
{
  path: '/social/ratings',
  name: 'MyRatings',
  component: MyRatings
},
{
  path: '/social/schedule',
  name: 'Schedule',
  component: Schedule
},
{
  path: '/social/dashboard',
  name: 'SocialDashboard',
  component: SocialDashboard
},
  
  
// 成员 1: 404 页面
 {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  if (!user && to.path !== '/login' && to.path !== '/register') {
    return next('/login')
  }
  
  const teacherPages = ['/course/manage', '/assignment/create']
  if (teacherPages.includes(to.path) && user?.role !== 'teacher') {
    return next('/') 
  }

  next()
})

export default router;
