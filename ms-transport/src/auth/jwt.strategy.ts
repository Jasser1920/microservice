import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';

type JwtPayload = {
  sub: string;
  preferred_username: string;
  realm_access?: {
    roles?: string[];
  };
};

@Injectable()
// The upstream passport/jwks packages expose loose typings, so we keep the
// strategy wiring small here and validate the payload shape explicitly below.
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

    const secretOrKeyProvider = jwksRsa.passportJwtSecret({
      cache: true,
      rateLimit: true,
      jwksUri: configService.getOrThrow<string>('KEYCLOAK_JWKS_URI'),
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      jwtFromRequest,
      ignoreExpiration: false,
      issuer: configService.getOrThrow<string>('KEYCLOAK_ISSUER'),
      algorithms: ['RS256'],
      secretOrKeyProvider: secretOrKeyProvider as never,
    });
  }

  validate(payload: JwtPayload) {
    return {
      sub: payload.sub,
      username: payload.preferred_username,
      roles: payload.realm_access?.roles ?? [],
    };
  }
}
