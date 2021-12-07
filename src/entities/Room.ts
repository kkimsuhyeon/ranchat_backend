import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Message } from "./Message";
import { User } from "./User";

@Entity()
export class Room extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToMany(() => User, (user) => user.id, { cascade: true })
  @JoinTable()
  participation: Array<User>;

  @OneToMany(() => Message, (message) => message.id)
  message: Array<Message>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
