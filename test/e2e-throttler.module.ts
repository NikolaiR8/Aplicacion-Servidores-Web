import { Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';

@Module({})
class E2eThrottlerModule {}

export class ThrottlerGuard {
  canActivate(): boolean {
    return true;
  }
}

export const ThrottlerModule = {
  forRoot(): DynamicModule {
    return { module: E2eThrottlerModule };
  },
};

export function Throttle(): MethodDecorator {
  return () => undefined;
}
