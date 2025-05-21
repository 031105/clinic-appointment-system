"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const db_client_1 = __importDefault(require("../utils/db-client"));
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
class UserController {
    // Get the current user profile
    async getCurrentUser(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.ApiError(401, 'Not authenticated');
            }
            const query = `
        SELECT 
          u.user_id as id,
          u.email,
          u.first_name as "firstName",
          u.last_name as "lastName",
          u.phone,
          u.address,
          u.profile_image_blob as "profileImage",
          u.created_at as "createdAt",
          u.updated_at as "updatedAt",
          r.name as "role"
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = $1
      `;
            const result = await db_client_1.default.query(query, [userId]);
            if (result.rows.length === 0) {
                throw new errorHandler_1.ApiError(404, 'User not found');
            }
            res.json(result.rows[0]);
        }
        catch (error) {
            next(error);
        }
    }
    // Upload profile image as BLOB
    async uploadProfileImageBlob(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.ApiError(401, 'Not authenticated');
            }
            if (!req.file) {
                throw new errorHandler_1.ApiError(400, 'No file uploaded');
            }
            // Get file buffer and content type
            const imageBuffer = req.file.buffer;
            // Update image data in database
            const query = `
        UPDATE users
        SET 
          profile_image_blob = $1,
          updated_at = NOW()
        WHERE user_id = $2
        RETURNING user_id
      `;
            const result = await db_client_1.default.query(query, [
                imageBuffer,
                userId
            ]);
            if (result.rows.length === 0) {
                throw new errorHandler_1.ApiError(404, 'User not found');
            }
            res.json({
                status: 'success',
                message: 'Profile image uploaded successfully',
                userId: result.rows[0].user_id
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get profile image as BLOB
    async getProfileImageBlob(req, res, next) {
        try {
            const userId = req.params.userId;
            const query = `
        SELECT profile_image_blob
        FROM users
        WHERE user_id = $1
      `;
            const result = await db_client_1.default.query(query, [userId]);
            if (result.rows.length === 0 || !result.rows[0].profile_image_blob) {
                // Return default placeholder image if no profile image is found
                return res.status(404).json({ error: 'Image not found' });
            }
            const { profile_image_blob } = result.rows[0];
            // Set CORS headers to allow cross-origin access
            res.setHeader('Access-Control-Allow-Origin', '*');
            // Set content type to image/jpeg
            res.set('Content-Type', 'image/jpeg');
            res.send(profile_image_blob);
        }
        catch (error) {
            logger_1.logger.error('Error fetching profile image:', error);
            res.status(500).json({ error: 'Failed to fetch profile image' });
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map