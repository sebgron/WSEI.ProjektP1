import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentStatus } from '../../enums';

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  paymentStatus: PaymentStatus;
}
