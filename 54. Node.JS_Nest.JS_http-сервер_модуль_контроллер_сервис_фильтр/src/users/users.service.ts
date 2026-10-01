import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  private users = [
    { id: 1, name: 'Vadim', age: 21 },
    { id: 2, name: 'Ivan', age: 25 },
  ];
  private nextId = 3;

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  create(body: { name: string; age: number }) {
    const user = { id: this.nextId++, ...body };
    this.users.push(user);
    return user;
  }

  update(id: number, body: Partial<{ name: string; age: number }>) {
    const user = this.findOne(id);
    Object.assign(user, body);
    return user;
  }

  remove(id: number) {
    const user = this.findOne(id);
    this.users = this.users.filter(u => u.id !== id);
    return { message: `User ${id} deleted` };
  }
}
