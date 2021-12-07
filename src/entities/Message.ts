import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Room } from "./Room";
import { User } from "./User";

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  text: string;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ManyToOne(() => Room, (room) => room.id)
  room: Room;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
