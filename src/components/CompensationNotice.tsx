import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Compensation, Role } from '../types';
import { colors, radius, spacing, textStyles } from '../theme';

export const CompensationNotice: React.FC<{
  compensation: Compensation;
  viewerRole: Role;
}> = ({ compensation, viewerRole }) => {
  const isBeneficiary = compensation.beneficiary === viewerRole;
  const reasonLabel =
    compensation.reason === 'late'
      ? 'Retard au point de rendez-vous'
      : 'Annulation après arrivée';
  const triggeredLabel =
    compensation.triggeredBy === 'fisher' ? 'pêcheur' : 'acheteur';

  return (
    <View style={styles.notice}>
      <Text style={styles.title}>Compensation déplacement</Text>
      <Text style={styles.amount}>
        {isBeneficiary ? 'Vous recevez' : 'Vous versez'} {compensation.amount.toFixed(2)} €
      </Text>
      <Text style={styles.meta}>Motif : {reasonLabel}</Text>
      <Text style={styles.meta}>Responsable : {triggeredLabel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  notice: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  title: {
    ...textStyles.caption,
    fontFamily: textStyles.bodyBold.fontFamily,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  amount: {
    ...textStyles.bodyBold,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  meta: {
    ...textStyles.caption,
    color: colors.muted,
  },
});

