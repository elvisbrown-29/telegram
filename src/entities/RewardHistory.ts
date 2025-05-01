import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('rewards_history')
export class RewardHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User, user => user.rewards)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'decimal', precision: 20, scale: 8 })
    amount: number;

    @Column({ name: 'reward_date', type: 'date' })
    rewardDate: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
} 