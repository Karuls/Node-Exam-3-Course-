import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>, // TypeORM репозиторий для User
  ) {}

  findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  create(body: Partial<User>) {
    const user = this.usersRepository.create(body);
    return this.usersRepository.save(user);
  }

  async update(id: number, body: Partial<User>) {
    await this.findOne(id);
    await this.usersRepository.update(id, body);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.usersRepository.delete(id);
    return { message: 'User deleted' };
  }
}
