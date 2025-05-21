/**
 * 运行SQL迁移脚本
 * @param fileName 迁移脚本文件名
 */
declare function runMigration(fileName: string): Promise<void>;
export default runMigration;
