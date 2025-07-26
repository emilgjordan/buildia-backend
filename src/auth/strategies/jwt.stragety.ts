import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly usersService: UsersService) {
        super({
            // Tell passport-jwt how to extract the token & verify it
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false, // If false, passport-jwt will reject expired tokens
            secretOrKey: 'secret', // Must match what's in JwtModule.register()
        });
    }

    // private static extractJwt(req: Request) {
    //     if (req.cookies && req.cookies['access-token']) {
    //         return req.cookies['access-token'];
    //     }
    // }

    async validate(validationPayload: {
        email: string;
        sub: string;
    }) {
        const user = this.usersService.getUserByEmail(
            validationPayload.email,
        );
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return user;
    }
}