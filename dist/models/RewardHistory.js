"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardHistory = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
let RewardHistory = class RewardHistory {
};
exports.RewardHistory = RewardHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RewardHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.rewards),
    __metadata("design:type", User_1.User)
], RewardHistory.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8 }),
    __metadata("design:type", Number)
], RewardHistory.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reward_date', type: 'date' }),
    __metadata("design:type", Date)
], RewardHistory.prototype, "rewardDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], RewardHistory.prototype, "createdAt", void 0);
exports.RewardHistory = RewardHistory = __decorate([
    (0, typeorm_1.Entity)('rewards_history')
], RewardHistory);
