import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export class DepartmentController {
  // Get all departments
  async getAllDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const departments = await prisma.department.findMany({
        include: {
          doctors: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      });

      res.json({
        status: 'success',
        data: departments,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get department by ID
  async getDepartmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const departmentId = parseInt(id);

      const department = await prisma.department.findUnique({
        where: { id: departmentId },
        include: {
          doctors: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      });

      if (!department) {
        throw new ApiError(404, 'Department not found');
      }

      res.json({
        status: 'success',
        data: department,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new department
  async createDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, location, contactNumber } = req.body;

      // Check if department with same name already exists
      const existingDepartment = await prisma.department.findFirst({
        where: { name },
      });

      if (existingDepartment) {
        throw new ApiError(409, 'Department with this name already exists');
      }

      const department = await prisma.department.create({
        data: {
          name,
          description,
          location,
          contactNumber,
        },
      });

      res.status(201).json({
        status: 'success',
        data: department,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update department
  async updateDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const departmentId = parseInt(id);
      const { name, description, location, contactNumber } = req.body;

      // Check if department exists
      const existingDepartment = await prisma.department.findUnique({
        where: { id: departmentId },
      });

      if (!existingDepartment) {
        throw new ApiError(404, 'Department not found');
      }

      // If name is being changed, check for duplicates
      if (name && name !== existingDepartment.name) {
        const duplicateDepartment = await prisma.department.findFirst({
          where: { name },
        });

        if (duplicateDepartment) {
          throw new ApiError(409, 'Department with this name already exists');
        }
      }

      const updatedDepartment = await prisma.department.update({
        where: { id: departmentId },
        data: {
          name,
          description,
          location,
          contactNumber,
        },
      });

      res.json({
        status: 'success',
        data: updatedDepartment,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete department
  async deleteDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const departmentId = parseInt(id);

      // Check if department exists
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
        include: {
          doctors: true,
        },
      });

      if (!department) {
        throw new ApiError(404, 'Department not found');
      }

      // Check if department has any doctors
      if (department.doctors.length > 0) {
        throw new ApiError(400, 'Cannot delete department with assigned doctors');
      }

      await prisma.department.delete({
        where: { id: departmentId },
      });

      res.json({
        status: 'success',
        message: 'Department deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
} 