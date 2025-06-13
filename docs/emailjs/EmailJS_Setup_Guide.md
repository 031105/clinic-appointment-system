# EmailJS 快速设置指南

## 🎯 模板策略
- **Template 1** (`template_hzt5pok`): 邮件验证 + 系统通知
- **Template 2** (`template_01nl5co`): 密码重置 + 预约通知

## 📋 设置步骤

### 1. 在EmailJS控制台创建Template 1
- Template ID: `template_hzt5pok`
- 复制 `EmailJS_Template_1_Multi_Purpose.html` 的HTML代码

### 2. 在EmailJS控制台创建Template 2
- Template ID: `template_01nl5co`
- 复制 `EmailJS_Template_2_Multi_Purpose.html` 的HTML代码

### 3. 验证配置
- Service ID: `service_q237ahi`
- Public Key: `M0mQX4l49-XmuzBLw`

## 🚀 功能映射

| 邮件类型 | 使用模板 | 主要参数 |
|---------|---------|----------|
| 邮件验证 | Template 1 | `show_verification: 'block'`, `otp_code` |
| 系统通知 | Template 1 | `show_notification: 'block'`, `notification_title` |
| 密码重置 | Template 2 | `show_password: 'block'`, `temp_password` |
| 预约通知 | Template 2 | `show_appointment: 'block'`, `appointment_date` |

## 🔧 关键参数

### Template 1 控制参数
```javascript
// 邮件验证
{ show_verification: 'block', show_notification: 'none' }

// 系统通知
{ show_verification: 'none', show_notification: 'block' }
```

### Template 2 控制参数
```javascript
// 密码重置
{ show_password: 'block', show_appointment: 'none' }

// 预约通知
{ show_password: 'none', show_appointment: 'block' }
```

完成设置后，系统将自动使用正确的模板发送对应类型的邮件。 