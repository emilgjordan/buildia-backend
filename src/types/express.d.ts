// express.d.ts
import { Request } from 'express';
import { User } from '../users/models/user.model'; // Adjust the import path as necessary

declare module 'express' {
  export interface Request {
    user?: User;
  }
}
