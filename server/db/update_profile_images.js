/**
 * 更新所有患者角色用户的个人资料图片
 * 
 * 此脚本将读取图片文件并将其作为BLOB数据插入到所有患者角色用户的profile_image_blob列中
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const imagePath = path.join(__dirname, '1.jpeg');

// 数据库连接配置从环境变量获取
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'clinic_appointment_system',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

async function updateProfileImages() {
  try {
    // 读取图片文件
    console.log(`Reading image file: ${imagePath}`);
    const imageBuffer = fs.readFileSync(imagePath);
    console.log(`Image file read successfully. Size: ${imageBuffer.length} bytes`);

    // 连接数据库
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database.');

    // 获取患者角色ID
    console.log('Getting patient role ID...');
    const roleResult = await client.query('SELECT role_id FROM roles WHERE role_name = $1', ['patient']);
    
    if (roleResult.rows.length === 0) {
      throw new Error('Patient role not found');
    }
    
    const patientRoleId = roleResult.rows[0].role_id;
    console.log(`Patient role ID: ${patientRoleId}`);

    // 更新所有患者角色用户的个人资料图片
    console.log('Updating profile images for all patient users...');
    const updateResult = await client.query(
      'UPDATE users SET profile_image_blob = $1, updated_at = NOW() WHERE role_id = $2 RETURNING user_id',
      [imageBuffer, patientRoleId]
    );

    console.log(`Updated ${updateResult.rows.length} users:`);
    updateResult.rows.forEach(row => {
      console.log(`User ID: ${row.user_id}`);
    });

    console.log('Profile images updated successfully.');
  } catch (error) {
    console.error('Error updating profile images:', error);
  } finally {
    // 关闭数据库连接
    await client.end();
    console.log('Database connection closed.');
  }
}

// 执行更新
updateProfileImages(); 