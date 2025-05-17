import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '..';

export const webToken = (data: any) => {
    return jwt.sign(data, SECRET_KEY || (() => { throw new Error("JWT_SECRET_KEY not defined") })());
}