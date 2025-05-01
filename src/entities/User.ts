import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Transaction } from './Transaction';
import { RewardHistory } from './RewardHistory';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'telegram_id', unique: true })
    telegramId: number;

    @Column({ nullable: true })
    username: string;

    @Column({ name: 'first_name', nullable: true })
    firstName: string;

    @Column({ name: 'last_name', nullable: true })
    lastName: string;

    @Column({ name: 'wallet_address', nullable: true })
    walletAddress: string;

    @Column({ name: 'staked_amount', type: 'decimal', precision: 20, scale: 8, default: 0 })
    stakedAmount: number;

    @Column({ name: 'total_earned', type: 'decimal', precision: 20, scale: 8, default: 0 })
    totalEarned: number;

    @Column({ name: 'referral_code', unique: true, length: 8 })
    referralCode: string;

    @Column({ name: 'referred_by', nullable: true, length: 8 })
    referredBy: string;

    @Column({ name: 'referral_count', default: 0 })
    referralCount: number;

    @Column({ name: 'referral_earnings', type: 'decimal', precision: 20, scale: 8, default: 0 })
    referralEarnings: number;

    @Column({ name: 'last_stake_date', nullable: true })
    lastStakeDate: Date;

    @Column({ name: 'last_reward_date', nullable: true })
    lastRewardDate: Date;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Transaction, transaction => transaction.user)
    transactions: Transaction[];

    @OneToMany(() => RewardHistory, reward => reward.user)
    rewards: RewardHistory[];
} 