import { CanActivate, ExecutionContext, HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../interfaces/jwt-payload.';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private jwtService: JwtService,
    private authService: AuthService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('There is no bearer token');
    }
    try {

      const tokenFromLocalStorage = localStorage.getItem('token')

      console.log(tokenFromLocalStorage)

      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token, { secret: process.env.JWT_SEED });

      const user = await this.authService.findUserById(payload.id)

      if (!user) throw new NotFoundException('User not found')
      if (!user.isActive) throw new UnauthorizedException('User is not active')

      request['user'] = user;

    } catch (error) {
      throw new NotFoundException()
    }

    return true;

  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization'].split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

}
