import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { JwtPayload } from './interfaces/jwt-payload.';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './interfaces/login-response.interface';
import { Model } from 'mongoose';
import { UpdateAuthDto, CreateUserDto } from './dto/index.dto';
import { User } from './entities/user.entity';
import * as bcryptjs from 'bcryptjs'

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {

    try {

      const { password, ...userData } = createUserDto

      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData
      })

      await newUser.save()

      const { password: _, ...user } = newUser.toJSON()

      return user

    } catch (error) {

      if (error.code === 11000) {

        throw new BadRequestException(`A user with the email '${createUserDto.email}' is already exists`)

      }

      throw new InternalServerErrorException('Something terrible happened')
    }

  }

  async register(createUserDto: CreateUserDto): Promise<LoginResponse> {

    const user = await this.create(createUserDto)

    return {
      user: user,
      token: this.getJwtToken({ id: user.id })
    }

  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {

    const { email, password } = loginDto

    const user = await this.userModel.findOne({ email })

    if (!user) throw new UnauthorizedException('not valid credentials : email')

    if (!bcryptjs.compareSync(password, user.password)) throw new UnauthorizedException('not valid credentials : password')

    const { password: _, ...currentUser } = user.toJSON()

    return {
      user: currentUser,
      token: this.getJwtToken({ id: user._id.toString() })
    }

  }

  findAll() {
    return this.userModel.find();
  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id);
    const { password, ...rest } = user.toJSON();
    return rest;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload)
    return token
  }
}
