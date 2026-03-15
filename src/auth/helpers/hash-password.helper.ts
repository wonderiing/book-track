import * as bcrypt from 'bcrypt';

export async function hashPassowrd(password: string): Promise<string> {

    const saltRounds = 10;

    const hashedPassword = await this.bcrypt.hash(password, saltRounds);
    return hashedPassword;

}