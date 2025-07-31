import { Request, Router } from 'express';
import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '@/modules/base';
import { Routes, RoutesDocument } from '../schema';
import { PathSource } from '@/modules/enum';
import { CreateRouteDto } from '../dto';

@Injectable()
export class RoutesGeneralService extends BaseService<RoutesGeneralService> {
  constructor(
    @InjectModel(Routes.name)
    private readonly routeModel: Model<RoutesDocument>,
  ) {
    super(RoutesGeneralService.name);
  }

  async frontendSeed() {
    const frontendPaths = [
      '/admin',
      '/admin/dashboard',
      '/admin/template',
      '/admin/template/create/:id',
      '/admin/users',
      '/admin/email-automations',
      '/admin/email-credential',
      '/admin/email-promotion',
      '/admin/email-history',
      '/admin/email-history/:id',
      '/admin/email-templates',
      '/admin/lead',
      '/admin/promotion',
      '/admin/promotion/:id',
    ];

    for (const path of frontendPaths) {
      const createRoutesDto: CreateRouteDto = {
        path,
        methode: 'GET',
        permissionName: '',
        source: PathSource.FRONTEND,
      };

      try {
        await this.addNew(createRoutesDto);
      } catch (error) {
        console.error(`Failed to add route for ${path}:`, error);
      }
    }
    return { message: 'Frontend routes seeded successfully' };
  }

  async addNew(createRoutesDto: CreateRouteDto) {
    createRoutesDto.permissionName = `${createRoutesDto.methode}_${createRoutesDto.path}`;
    const newRoute = new this.routeModel(createRoutesDto);
    try {
      await newRoute.save();
      return newRoute;
    } catch (error) {
      if (error?.code === 11000) {
        throw new ConflictException('Name already exists');
      }
      throw new HttpException(error?.message, error?.status ?? 500, {
        cause: error,
      });
    }
  }

  async getAll() {
    return await this.routeModel.find();
  }

  async refresh(req: Request) {
    const router = req.app._router as Router;
    const routes = router.stack
      .map((layer) => {
        if (layer.route) {
          const path = layer.route?.path;
          const methode = layer.route?.stack[0].method.toLowerCase();
          const permissionName = `${methode}_${path}`;
          const moduleName = this.getModuleName(path);
          if (moduleName === 'docs' || moduleName === 'auth') return undefined;
          return {
            methode,
            moduleName,
            path,
            permissionName,
            description: this.getHumanDescription(methode, path),
            source: PathSource.BACKEND,
          };
        }
      })
      .filter((item) => item !== undefined);
    await this.routeModel.deleteMany({
      source: PathSource.BACKEND,
    });
    try {
      await this.routeModel.insertMany(routes, { ordered: false });
    } catch (error) {
      if (error?.code === 11000) {
        throw new ConflictException('Name already exists');
      }
      throw new HttpException(error?.message, error?.status ?? 500, {
        cause: error,
      });
    }
    return {
      routes,
    };
  }

  getModuleName(path: string): string {
    const parts = path.split('/').filter(Boolean);
    return parts[1] || 'general';
  }

  getHumanDescription(method: string, path: string): string {
    const actionMap: Record<string, string> = {
      get: 'View',
      post: 'Create',
      put: 'Update',
      patch: 'Update',
      delete: 'Delete',
    };

    const action = actionMap[method.toLowerCase()] || method.toUpperCase();

    const cleanPath = path
      .replace(/^\/api/, '')
      .replace(/:/g, '')
      .split('/')
      .filter(Boolean)
      .join(' ');

    const capitalizedPath =
      cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1);

    return `${action} ${capitalizedPath}`;
  }

  async getAllPermissionsName() {
    const permissions = await this.routeModel
      .find({ source: PathSource.BACKEND })
      .select('permissionName')
      .lean();
    return permissions.map((permission) => permission.permissionName);
  }

  async getAllFrontendPath() {
    const paths = await this.routeModel
      .find({ source: PathSource.FRONTEND })
      .select('path')
      .lean();
    return paths.map((path) => path.path);
  }
}
