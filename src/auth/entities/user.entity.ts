import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "users" })
export class User {

    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column({ unique: true, type: "text" })
    username: string;

    @Column({ unique: true, type: "text" })
    email: string;

    @Column({ name: "password_hash", type: "text" })
    passwordHash: string;

    @Column({ type: "boolean", default: false, name: "is_active" })
    isActive: boolean;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", name: "created_at" })
    createdAt: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", name: "updated_at" })
    updatedAt: Date;

    @Column({ type: "text", nullable: true, name: "avatar_url" })
    avatarUrl: string | null;

    @Column({nullable: true, name: "otp_code", type: "text"})
    otpCode: string | null;

    @Column({nullable: true, type: "timestamp", name: "otp_expires_at"})
    otpExpiresAt: Date | null;

}
