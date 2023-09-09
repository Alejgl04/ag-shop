import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt';
import { CreateUserDto, SignInUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);

      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async signIn(signInUserDto: SignInUserDto) {
    const { email, password } = signInUserDto;
    const user = await this.checkUser(email, password);
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async checkUser(email: string, password: string) {
    const user = await this.findUserByEmail(email);

    if (!user)
      throw new UnauthorizedException(`Credentials are not valid (email)`);

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException(`Credentials are not valid (password)`);

    return user;
  }

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    return user;
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    console.log(error);
    throw new InternalServerErrorException(`Something went wrong, check logs`);
  }
}
