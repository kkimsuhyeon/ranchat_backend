import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";

import { Message } from "./Message";
import { Room } from "./Room";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToMany(() => Room, (room) => room.id, { cascade: true })
  @JoinTable()
  rooms: Array<Room>;

  @OneToMany(() => Message, (message) => message.id)
  message: Array<Message>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
