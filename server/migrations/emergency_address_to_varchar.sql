-- 备份当前紧急联系人地址数据
CREATE TEMP TABLE emergency_address_backup AS
SELECT contact_id, 
       CASE 
         WHEN address IS NULL THEN NULL
         WHEN jsonb_typeof(address) = 'object' THEN
           CASE
             -- 如果有street字段，优先使用
             WHEN (address->>'street') IS NOT NULL THEN (address->>'street')
             -- 尝试构建完整地址
             WHEN (address->>'city') IS NOT NULL OR (address->>'state') IS NOT NULL THEN
               CONCAT_WS(', ', 
                  (address->>'street'),
                  (address->>'city'),
                  (address->>'state'),
                  (address->>'zipCode'),
                  (address->>'country')
               )
             -- 其他情况，转为字符串
             ELSE address::text
           END
         ELSE address::text
       END AS address_string
FROM emergency_contacts
WHERE address IS NOT NULL;

-- 修改列类型
ALTER TABLE emergency_contacts ALTER COLUMN address TYPE varchar(500) USING NULL;

-- 恢复数据
UPDATE emergency_contacts e
SET address = b.address_string
FROM emergency_address_backup b
WHERE e.contact_id = b.contact_id;

-- 清理临时表
DROP TABLE emergency_address_backup; 