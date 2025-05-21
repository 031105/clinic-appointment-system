# 功能增强说明文档

本文档描述了对系统进行的两项主要功能增强：部门emoji图标和医生头像blob处理。

## 1. 部门Emoji图标

### 数据库修改
- 在`departments`表中添加了`emoji_icon` VARCHAR(100)列，默认值为'👨‍⚕️'
- 为现有部门数据更新了emoji图标
- SQL脚本位于`server/db/add_emoji_icon.sql`

### 后端修改
- 更新了`getDepartments`查询，返回`emojiIcon`字段
- 对应文件：`server/src/controllers/dashboard.controller.ts`

### 前端修改
- 更新了`Department`接口，添加了`emojiIcon`字段
- 优化了`DepartmentList`组件，优先使用后端返回的emoji图标
- 保留本地映射作为后备方案

## 2. 医生头像Blob处理

### 头像处理组件增强
- 增强了`DoctorImage`组件，支持直接传入blob数据（Base64格式）
- 添加了`profileImageBlob`属性，当提供时优先使用
- 保留了使用userId通过API获取头像的方式作为备选

### 图像工具类
- 系统已有工具类`src/utils/imageUtils.ts`提供了基础功能：
  - `getProfileImageUrl`：根据userId获取头像URL
  - `handleImageError`：处理图像加载错误
  - `uploadProfileImage`：上传头像功能

## 使用方法

### 部门Emoji图标
在展示部门列表时，可以直接使用后端返回的emojiIcon字段，不需要在前端硬编码映射。例如：

```tsx
<span className="text-2xl">{department.emojiIcon}</span>
```

### 医生头像
有两种使用方式：

1. 使用userId（适用于大多数场景）：
```tsx
<DoctorImage userId={doctor.id} size="lg" rounded="full" />
```

2. 直接使用blob数据（适用于已经获取了base64图像数据的场景）：
```tsx
<DoctorImage userId={doctor.id} profileImageBlob={doctor.user.profilePicture} />
```

### 示例
```tsx
// 部门卡片示例
<div className="department-card">
  <span className="emoji">{department.emojiIcon}</span>
  <h3>{department.name}</h3>
</div>

// 医生卡片示例
<div className="doctor-card">
  <DoctorImage 
    userId={doctor.id}
    profileImageBlob={doctor.user.profilePicture} 
    size="lg"
    rounded="full"
  />
  <h3>{doctor.user.firstName} {doctor.user.lastName}</h3>
</div>
``` 