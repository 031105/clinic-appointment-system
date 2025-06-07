// 临时认证设置工具
// 在浏览器控制台运行此脚本来设置正确的认证token

// Admin用户token (格式: user_id:email:role)
const adminToken = '1:admin@healthclinic.com:admin';

// 设置token到localStorage
localStorage.setItem('accessToken', adminToken);

console.log('✅ Admin token设置成功!');
console.log('Token格式:', adminToken);
console.log('现在可以刷新页面使用admin功能了');

// 验证token是否设置成功
console.log('当前localStorage中的token:', localStorage.getItem('accessToken')); 