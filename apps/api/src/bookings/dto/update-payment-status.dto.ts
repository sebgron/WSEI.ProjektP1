import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentStatus } from '@turborepo/shared';

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  paymentStatus: PaymentStatus;
}
