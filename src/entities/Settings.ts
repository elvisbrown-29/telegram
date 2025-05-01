import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Settings {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'key_name', unique: true, length: 50 })
    keyName: string;

    @Column('text')
    value: string;

    @Column('text', { nullable: true })
    description: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
} 