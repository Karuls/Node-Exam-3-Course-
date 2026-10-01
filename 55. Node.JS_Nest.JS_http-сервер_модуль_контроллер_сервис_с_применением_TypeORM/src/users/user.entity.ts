import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// Сущность — маппится на таблицу Users в БД
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  age: number;
}
