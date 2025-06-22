# EmailJS 配置指南 - 诊所预约系统

## 📧 概述

本系统使用2个EmailJS模板处理4种不同的邮件场景，最大化利用您的EmailJS模板配额。

## 🎯 模板分配策略

### Template 1: `template_hzt5pok` (多用途模板1)
**用途：验证与通知类邮件**
- ✅ **邮件验证** - 用户注册时的验证码邮件
- ✅ **系统通知** - 管理员发送的系统通知

### Template 2: `template_01nl5co` (多用途模板2) 
**用途：操作与预约类邮件**
- ✅ **密码重置** - 忘记密码时的临时密码邮件
- ✅ **预约通知** - 预约确认、提醒、取消、重新安排

## 🔧 EmailJS 设置步骤

### 步骤1: 登录EmailJS控制台
1. 访问 [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. 使用您的账户登录

### 步骤2: 创建Template 1 (template_hzt5pok)
1. 在左侧菜单选择 "Email Templates"
2. 点击 "Create New Template"
3. 设置Template ID为：`template_hzt5pok`
4. 复制 `EmailJS_Template_1_Multi_Purpose.html` 的完整HTML代码
5. 粘贴到EmailJS的HTML编辑器中
6. 保存模板

### 步骤3: 创建Template 2 (template_01nl5co)
1. 再次点击 "Create New Template"
2. 设置Template ID为：`template_01nl5co`
3. 复制 `EmailJS_Template_2_Multi_Purpose.html` 的完整HTML代码
4. 粘贴到EmailJS的HTML编辑器中
5. 保存模板

### 步骤4: 配置Service
确保您的EmailJS服务配置正确：
- Service ID: `service_q237ahi`
- Public Key: `your_public_key_here`

## 📋 模板参数说明

### Template 1 (template_hzt5pok) - 参数列表

#### 基础参数
- `to_email` - 收件人邮箱
- `to_name` - 收件人姓名
- `subject` - 邮件主题
- `email_title` - 邮件标题
- `main_message` - 主要消息

#### 显示控制参数
- `show_verification` - 显示验证码区域 (`block` / `none`)
- `show_notification` - 显示系统通知区域 (`block` / `none`)
- `show_action_button` - 显示操作按钮 (`inline-block` / `none`)

#### 验证码邮件参数
```javascript
// 邮件验证时使用
{
  show_verification: 'block',
  show_notification: 'none',
  otp_code: '123456',
  action_link: 'https://clinic.com/verify-email',
  action_button_text: 'Verify Email'
}
```

#### 系统通知邮件参数
```javascript
// 系统通知时使用
{
  show_verification: 'none',
  show_notification: 'block',
  notification_type_label: 'System Notification',
  notification_title: '系统维护通知',
  notification_message: '系统将于明天凌晨2点进行维护...',
  notification_date: '2024-12-16'
}
```

### Template 2 (template_01nl5co) - 参数列表

#### 基础参数
- `to_email` - 收件人邮箱
- `to_name` - 收件人姓名
- `subject` - 邮件主题
- `email_title` - 邮件标题
- `main_message` - 主要消息

#### 显示控制参数
- `show_password` - 显示密码重置区域 (`block` / `none`)
- `show_appointment` - 显示预约信息区域 (`block` / `none`)
- `show_secondary_action` - 显示次要操作按钮 (`inline-block` / `none`)
- `show_appointment_notes` - 显示预约备注 (`block` / `none`)

#### 密码重置邮件参数
```javascript
// 密码重置时使用
{
  show_password: 'block',
  show_appointment: 'none',
  temp_password: 'TempPass123!',
  primary_action_link: 'https://clinic.com/login',
  primary_action_text: 'Login Now',
  important_message: 'Please change this temporary password immediately after logging in for security purposes.'
}
```

#### 预约通知邮件参数
```javascript
// 预约通知时使用
{
  show_password: 'none',
  show_appointment: 'block',
  notification_type_label: 'Appointment Confirmed',
  appointment_date: '2024-12-20',
  appointment_time: '10:00 AM',
  doctor_name: 'Dr. Smith',
  department: 'Cardiology',
  primary_action_link: 'https://clinic.com/appointments/history',
  primary_action_text: 'View Appointment'
}
```

## 🎨 模板特点

### Template 1 特点
- **颜色主题：** 紫色渐变 (#667eea to #764ba2)
- **适用场景：** 验证、通知类邮件
- **关键元素：** 
  - 大号验证码显示
  - 系统通知卡片
  - 安全提示区域

### Template 2 特点
- **颜色主题：** 蓝色渐变 (#0ea5e9 to #3b82f6)
- **适用场景：** 操作、预约类邮件
- **关键元素：**
  - 临时密码显示
  - 预约详情网格
  - 联系信息区域

## 🚀 使用示例

### 1. 发送邮件验证
```javascript
await sendVerificationEmail({
  to_email: 'user@example.com',
  to_name: 'John Doe',
  otp_code: '123456'
});
```

### 2. 发送系统通知
```javascript
await sendSystemNotificationEmail({
  to_email: 'user@example.com',
  to_name: 'John Doe',
  notification_title: '系统维护通知',
  notification_message: '系统将于明天凌晨2点进行例行维护...',
  notification_type: 'system'
});
```

### 3. 发送密码重置
```javascript
await sendPasswordResetEmail({
  to_email: 'user@example.com',
  to_name: 'John Doe',
  temp_password: 'TempPass123!'
});
```

### 4. 发送预约通知
```javascript
await sendAppointmentNotificationEmail({
  to_email: 'user@example.com',
  to_name: 'John Doe',
  appointment_date: '2024-12-20',
  appointment_time: '10:00 AM',
  doctor_name: 'Dr. Smith',
  department: 'Cardiology',
  notification_type: 'booking_confirmation'
});
```

## 🔒 安全注意事项

1. **验证码有效期：** 10分钟自动过期
2. **临时密码：** 用户必须在首次登录时更改
3. **邮件验证：** 每个邮件都包含安全提示
4. **链接安全：** 所有链接都指向合法域名

## 🎯 优化建议

1. **响应式设计：** 两个模板都完全支持移动设备
2. **品牌一致性：** 保持诊所品牌色彩和字体
3. **用户体验：** 清晰的操作指引和联系信息
4. **邮件送达率：** 使用专业的邮件模板提高送达率

## 📊 监控与分析

通过EmailJS控制台可以监控：
- 邮件发送成功率
- 各类邮件的发送量
- 错误日志和调试信息

## 🆘 故障排除

### 常见问题：
1. **邮件没有收到：** 检查垃圾邮件文件夹
2. **模板显示异常：** 确认所有参数都已正确传递
3. **样式不正确：** 检查EmailJS模板的HTML是否完整复制
4. **链接无效：** 确认域名配置正确

### 调试方法：
```javascript
// 在浏览器控制台查看详细错误信息
console.log('EmailJS result:', result.text);
```

---

**注意：** 请确保在EmailJS控制台中设置的Template ID与代码中使用的完全一致。 