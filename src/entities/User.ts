import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Message } from "./Message";
import { Room } from "./Room";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  firstName!: string;

  @Column({ nullable: true })
  lastName!: string;

  @Column({ nullable: true })
  bio: "M" | "W";

  @Column({ nullable: true })
  loginSecret: string;

  @Column({ default: false })
  emailAuth: boolean;

  @ManyToMany(() => Room, (room) => room.users)
  rooms: Array<Room>;

  @OneToMany(() => Message, (message) => message.user)
  messages: Array<Message>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
