import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ReservationStatus } from '../types';
import { colors, spacing, textStyles } from '../theme';

const steps: { key: ReservationStatus; label: string }[] = [
  { key: 'pending', label: 'Demande' },
  { key: 'confirmed', label: 'Confirmée' },
  { key: 'picked_up', label: 'Remise' },
];

const isReached = (status: ReservationStatus, step: ReservationStatus) => {
  if (status === 'rejected') {
    return false;
  }
  const order: ReservationStatus[] = ['pending', 'confirmed', 'picked_up'];
  return order.indexOf(status) >= order.indexOf(step);
};

export const ReservationTimeline: React.FC<{ status: ReservationStatus }> = ({
  status,
}) => {
  if (status === 'rejected') {
    return (
      <View style={styles.rejected}>
        <Text style={styles.rejectedText}>Réservation refusée</Text>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {steps.map((step, index) => {
        const reached = isReached(status, step.key);
        return (
          <View key={step.key} style={styles.step}>
            <View style={[styles.dot, reached && styles.dotActive]} />
            <Text style={[styles.label, reached && styles.labelActive]}>
              {step.label}
            </Text>
            {index < steps.length - 1 && (
              <View style={[styles.line, reached && styles.lineActive]} />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginRight: spacing.xs,
  },
  dotActive: {
    backgroundColor: colors.success,
  },
  label: {
    ...textStyles.caption,
    color: colors.muted,
  },
  labelActive: {
    color: colors.primaryDark,
    fontFamily: textStyles.bodyBold.fontFamily,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  lineActive: {
    backgroundColor: colors.success,
  },
  rejected: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'transparent',
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  rejectedText: {
    ...textStyles.caption,
    color: colors.danger,
    fontFamily: textStyles.bodyBold.fontFamily,
  },
});

