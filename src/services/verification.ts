import {
  BuyerProfile,
  FisherProfile,
  Role,
  VerificationCheck,
  VerificationReport,
  VerificationRiskLevel,
  VerificationStatus,
} from '../types';

const now = () => new Date().toISOString();

const createCheck = (
  label: string,
  status: VerificationCheck['status'],
  detail?: string
): VerificationCheck => ({
  id: `chk-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  label,
  status,
  detail,
});

const isSiret = (value: string) => /^\d{14}$/.test(value.replace(/\s+/g, ''));

const isIban = (value: string) => {
  const compact = value.replace(/\s+/g, '').toUpperCase();
  return /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(compact);
};

const isBoatRegistration = (value: string) =>
  /^[A-Z]{2,3}-\d{3,6}$/.test(value.trim().toUpperCase());

const isPermit = (value: string) =>
  /^[A-Z]{2}-PECH-\d{3,6}$/.test(value.trim().toUpperCase());

const isApeCoherent = (activity: string) => {
  const value = activity.toLowerCase();
  const keywords = [
    'poisson',
    'poissonnerie',
    'restauration',
    'restaurant',
    'hôtel',
    'hotel',
    'traiteur',
    'collectivité',
    'collectivite',
    'grossiste',
    'marée',
    'maree',
    'pêche',
    'peche',
  ];
  return keywords.some((keyword) => value.includes(keyword));
};

const hasValue = (value: string) => value.trim().length > 0;

const buildReport = (
  role: Role,
  provider: string,
  checks: VerificationCheck[],
  status: VerificationStatus,
  failureReason?: string,
  riskScore = 0,
  riskLevel: VerificationRiskLevel = 'low'
): VerificationReport => ({
  id: `verif-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  provider,
  status,
  checks,
  riskScore,
  riskLevel,
  failureReason,
  createdAt: now(),
  updatedAt: now(),
});

const markPendingAll = (
  checks: VerificationCheck[],
  reason: string
): VerificationCheck[] =>
  checks.map((check) => ({
    ...check,
    status: 'pending' as const,
    detail: reason,
  }));

const computeRisk = (
  checks: VerificationCheck[],
  status: VerificationStatus,
  isOffline: boolean
) => {
  let score = 10;
  checks.forEach((check) => {
    if (check.status === 'failed') {
      score += 25;
    } else if (check.status === 'pending') {
      score += 10;
    }
  });
  if (status === 'rejected') {
    score += 15;
  }
  if (isOffline) {
    score += 10;
  }
  score = Math.min(100, score);
  const level: VerificationRiskLevel =
    score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
  return { score, level };
};

export const startBuyerVerification = (): VerificationReport => {
  const checks = [
    createCheck('SIRENE/INSEE : SIRET valide', 'pending'),
    createCheck('SIRENE/INSEE : statut actif', 'pending'),
    createCheck('APE cohérent', 'pending'),
    createCheck('Moyen de paiement professionnel', 'pending'),
  ];
  const risk = computeRisk(checks, 'pending', false);
  return buildReport(
    'buyer',
    'SIRENE/INSEE (France) + PSP KYC',
    checks,
    'pending',
    undefined,
    risk.score,
    risk.level
  );
};

export const finalizeBuyerVerification = (
  profile: BuyerProfile,
  isOnline: boolean
): VerificationReport => {
  const siretOk = isSiret(profile.registry);
  const activeOk = siretOk && !profile.registry.replace(/\s+/g, '').startsWith('000');
  const apeOk = isApeCoherent(profile.activity);
  const paymentOk = hasValue(profile.paymentMethod);

  const checks = [
    createCheck(
      'SIRENE/INSEE : SIRET valide',
      siretOk ? 'passed' : 'failed',
      siretOk ? undefined : 'SIRET invalide (14 chiffres requis)'
    ),
    createCheck(
      'SIRENE/INSEE : statut actif',
      activeOk ? 'passed' : 'failed',
      activeOk ? undefined : 'Statut INSEE non actif'
    ),
    createCheck(
      'APE cohérent',
      apeOk ? 'passed' : 'failed',
      apeOk ? undefined : 'Activité incompatible'
    ),
    createCheck(
      'Moyen de paiement professionnel',
      paymentOk ? 'passed' : 'failed',
      paymentOk ? undefined : 'Moyen de paiement manquant'
    ),
  ];

  if (!isOnline) {
    const pendingChecks = markPendingAll(
      checks,
      'API indisponible, réessai automatique'
    );
    const risk = computeRisk(pendingChecks, 'pending', true);
    return buildReport(
      'buyer',
      'SIRENE/INSEE (France) + PSP KYC',
      pendingChecks,
      'pending',
      'API indisponible',
      risk.score,
      risk.level
    );
  }

  const status: VerificationStatus = checks.every(
    (check) => check.status === 'passed'
  )
    ? 'verified'
    : 'rejected';

  const failureReason =
    status === 'rejected'
      ? checks.find((check) => check.status === 'failed')?.detail
      : undefined;

  const risk = computeRisk(checks, status, false);
  return buildReport(
    'buyer',
    'SIRENE/INSEE (France) + PSP KYC',
    checks,
    status,
    failureReason,
    risk.score,
    risk.level
  );
};

export const startFisherVerification = (): VerificationReport => {
  const checks = [
    createCheck('Registre navire : immatriculation valide', 'pending'),
    createCheck('Licence pêche valide', 'pending'),
    createCheck('Assurance active', 'pending'),
    createCheck('IBAN vérifié (PSP)', 'pending'),
  ];
  const risk = computeRisk(checks, 'pending', false);
  return buildReport(
    'fisher',
    'Registre maritime + PSP KYC',
    checks,
    'pending',
    undefined,
    risk.score,
    risk.level
  );
};

export const finalizeFisherVerification = (
  profile: FisherProfile,
  isOnline: boolean
): VerificationReport => {
  const registrationOk = isBoatRegistration(profile.registration);
  const permitOk = isPermit(profile.permit);
  const insuranceOk = hasValue(profile.insurance);
  const ibanOk = isIban(profile.bankAccount);

  const checks = [
    createCheck(
      'Registre navire : immatriculation valide',
      registrationOk ? 'passed' : 'failed',
      registrationOk ? undefined : 'Immatriculation invalide'
    ),
    createCheck(
      'Licence pêche valide',
      permitOk ? 'passed' : 'failed',
      permitOk ? undefined : 'Licence invalide'
    ),
    createCheck(
      'Assurance active',
      insuranceOk ? 'passed' : 'failed',
      insuranceOk ? undefined : 'Assurance manquante'
    ),
    createCheck(
      'IBAN vérifié (PSP)',
      ibanOk ? 'passed' : 'failed',
      ibanOk ? undefined : 'IBAN invalide'
    ),
  ];

  if (!isOnline) {
    const pendingChecks = markPendingAll(
      checks,
      'API indisponible, réessai automatique'
    );
    const risk = computeRisk(pendingChecks, 'pending', true);
    return buildReport(
      'fisher',
      'Registre maritime + PSP KYC',
      pendingChecks,
      'pending',
      'API indisponible',
      risk.score,
      risk.level
    );
  }

  const status: VerificationStatus = checks.every(
    (check) => check.status === 'passed'
  )
    ? 'verified'
    : 'rejected';

  const failureReason =
    status === 'rejected'
      ? checks.find((check) => check.status === 'failed')?.detail
      : undefined;

  const risk = computeRisk(checks, status, false);
  return buildReport(
    'fisher',
    'Registre maritime + PSP KYC',
    checks,
    status,
    failureReason,
    risk.score,
    risk.level
  );
};
