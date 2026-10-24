/* Hai URL cũ chỉ kiểm tra phiên/role rồi chuyển sang trang hiện hành. */
(() => {
  'use strict';
  const { redirect, requiredRole } = document.body.dataset;
  const user = CC.me();
  if (!user) {
    sessionStorage.setItem('cc.next', location.pathname.split('/').pop() + location.search);
    location.replace('login.html');
    return;
  }
  location.replace(requiredRole && user.role !== requiredRole ? '403.html' : redirect);
})();
