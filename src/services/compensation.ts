import { Compensation, CompensationReason, Role } from '../types';

export const compensationPolicy = {
  rate: 0.12,
  min: 8,
  max: 60,
  lateThresholdMinutes: 20,
};

export const calculateCompensationAmount = (totalPrice: number) => {
  const raw = totalPrice * compensationPolicy.rate;
  const rounded = Math.round(raw * 100) / 100;
  return Math.min(compensationPolicy.max, Math.max(compensationPolicy.min, rounded));
};

export const buildCompensation = (params: {
  totalPrice: number;
  triggeredBy: Role;
  reason: CompensationReason;
  decidedAt: string;
}): Compensation => {
  const beneficiary: Role = params.triggeredBy === 'fisher' ? 'buyer' : 'fisher';
  return {
    beneficiary,
    amount: calculateCompensationAmount(params.totalPrice),
    reason: params.reason,
    triggeredBy: params.triggeredBy,
    decidedAt: params.decidedAt,
  };
};
