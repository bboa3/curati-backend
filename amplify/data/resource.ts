import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { postConfirmation } from '../auth/post-confirmation/resource';
import { addOrUpdateSearchableRecord } from '../functions/add-or-update-searchable-record/resource';
import { addUserToGroup } from '../functions/add-user-to-group/resource';
import { adminCreateUser } from '../functions/admin-create-user/resource';
import { appointmentStreamWatcher } from '../functions/appointment-stream-watcher/resource';
import { contractStreamWatcher } from '../functions/contract-stream-watcher/resource';
import { createStreamToken } from '../functions/create-stream-token/resource';
import { deleteSearchableRecord } from '../functions/delete-searchable-record/resource';
import { deliveryAssignmentStreamWatcher } from '../functions/delivery-assignment-stream-watcher/resource';
import { deliveryStreamWatcher } from '../functions/delivery-stream-watcher/resource';
import { getSecrets } from '../functions/get-secrets/resource';
import { invoiceStreamWatcher } from '../functions/invoice-stream-watcher/resource';
import { medicineOrderStreamWatcher } from '../functions/medicine-order-stream-watcher/resource';
import { prescriptionStreamWatcher } from '../functions/prescription-stream-watcher/resource';
import { generateDailySalesSummaries } from '../jobs/generate-daily-sales-summaries/resource';
import { generateMonthlySalesSummaries } from '../jobs/generate-monthly-sales-summaries/resource';

const mediaFromType = ['ARTICLE', 'CONTENT_BLOCK'] as const;
const sleepQuality = ['POOR', 'AVERAGE', 'GOOD', 'EXCELLENT'] as const;
const physicalActivityLevel = ['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE'] as const;
const gender = ['MALE', 'FEMALE', 'OTHER', 'UNKNOWN'] as const;
const likedItemType = ['ARTICLE', 'MEDICINE'] as const;
const viewedItemType = ['ARTICLE', 'MEDICINE'] as const;
const ratedItemType = ['BUSINESS', 'PROFESSIONAL', 'MEDICINE', 'BUSINESSSERVICE'] as const;
const certifiedItemType = ['PROFESSIONAL', 'BUSINESS'] as const;
const licensedItemType = ['PROFESSIONAL', 'BUSINESS'] as const

const vehicleType = ['CAR', 'MOTORCYCLE', 'BICYCLE', 'TRUCK'] as const;
const deliveryStatus = [
  'PENDING',
  'PHARMACY_PREPARING',
  'AWAITING_DRIVER_ASSIGNMENT',
  'DRIVER_ASSIGNED',
  'PICKED_UP_BY_DRIVER',
  'IN_TRANSIT',
  'DELIVERED',
  'AWAITING_PATIENT_PICKUP',
  'PICKED_UP_BY_PATIENT',
  'CANCELLED',
  'FAILED'
] as const;
const deliveryStatusHistoryActorType = ['SYSTEM', 'PATIENT', 'DRIVER', 'PHARMACIST', 'ADMIN'] as const;
const deliveryType = ['PICKUP', 'DELIVERY'] as const;
const deliveryAssignmentStatus = ['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED'] as const;
const medicineOrderStatus = ['PENDING_PAYMENT', 'PHARMACY_REVIEW', 'PROCESSING', 'READY_FOR_DISPATCH', 'DISPATCHED', 'COMPLETED', 'REJECTED', 'CANCELED',] as const;

const notificationType = ['GENERAL', 'PERSONAL', 'PROMOTIONAL', 'UPDATE'] as const;
const notificationRelatedItemType = ['ORDER', 'PRESCRIPTION', 'APPOINTMENT', 'ARTICLE', 'MEDICINE', 'CONTRACT', 'OTHER'] as const;
const priority = ['LOW', 'MEDIUM', 'HIGH'] as const;
const remindedItemType = ['APPOINTMENT', 'MEDICATION', 'DELIVERY', 'MEDICINE_ORDER'] as const;
const reminderStatus = ['PENDING', 'COMPLETED', 'SKIPPED'] as const;
const repeatType = ['NONE', 'DAILY', 'WEEKLY', 'CUSTOM'] as const;
const contractType = ['ONE_TIME', 'MONTHLY', 'SEMI_ANNUALLY', 'ANNUALLY'] as const;
const contractStatus = ['PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'REJECTED'] as const;
const contractTerminatedBy = ['PATIENT', 'BUSINESS', 'SYSTEM', 'UNTERMINATED'] as const;
const language = ['PORTUGUESE', 'ENGLISH', 'TSONGA', 'CHANGANA', 'MAKHUWA', 'SENA', 'NDAU'] as const;

const recurrenceType = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'NONE'] as const;
const serviceFeasibility = ['LOW', 'MEDIUM', 'HIGH'] as const;

const cardBrand = ['MASTERCARD', 'VISA'] as const;
const mobileProviderName = ['M_PESA', 'E_MOLA', 'M_KESH'] as const;
const paymentTermsType = ['NET_1', 'NET_7', 'NET_30'] as const;
const paymentMethodType = ['CREDIT_CARD', 'DEBIT_CARD', 'MOBILE_PAYMENT'] as const;
const invoiceStatus = ['AWAITING_PATIENT_REVIEW', 'PENDING_PAYMENT', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'OVERDUE'] as const;
const paymentTransactionStatus = ['SUCCESS', 'FAILED', 'PENDING', 'REFUNDED'] as const;
const invoiceSourceType = ['MEDICINE_ORDER', 'CONTRACT'] as const;

const pricingCondition = [
  // Base Price
  'STANDARD',
  'MONTHLY_SUBSCRIPTION',
  'ANNUAL_SUBSCRIPTION',

  // Additional Charges
  'EMERGENCY_SURCHARGE',
  'COMPLEXITY_FEE',
  'AFTER_HOURS_FEE',
  'WEEKEND_FEE',
  'SPECIAL_EQUIPMENT_FEE',

  // Discounts
  'PROMOTIONAL_DISCOUNT',
  'CANCELLATION_FEE'
] as const;
const feeType = ['FIXED', 'PERCENTAGE'] as const;
const calculationType = ['ADDITIVE', 'MULTIPLICATIVE'] as const;

const addressType = ['HOME', 'WORK', 'PHARMACY', 'HOSPITAL', 'COURIER', 'SHIPPING', 'BILLING'] as const;
const addressOwnerType = ['PATIENT', 'PROFESSIONAL', 'BUSINESS', 'DELIVERY'] as const;
const consultationType = ['VIDEO', 'AUDIO', 'TEXT', 'IN_PERSON'] as const;
const outcome = ['NOT_COMPLETED', 'SUCCESSFUL', 'FOLLOW_UP_REQUIRED', 'REFERRAL_REQUIRED'] as const;
const prescriptionStatus = ['ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPENSED', 'PENDING_VALIDATION'] as const;
const prescriptionType = ['INPATIENT', 'OUTPATIENT'] as const;

const appointmentStatus = ['PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'CONFIRMED', 'IN_PROGRESS', 'RESCHEDULED', 'CANCELLED', 'FAILED', 'COMPLETED'] as const;
const appointmentType = ['VIDEO', 'AUDIO', 'TEXT', 'IN_PERSON'] as const;
const appointmentParticipantType = ['PATIENT', 'PROFESSIONAL'] as const;

const licenseStatus = ['ACTIVE', 'SUSPENDED', 'EXPIRED'] as const;
const professionalAvailabilityStatus = ['ONLINE', 'OFFLINE', 'ON_BREAK', 'BUSY'] as const;
const businessType = ['PHARMACY', 'HOSPITAL', 'DELIVERY', 'LABORATORY'] as const;
const publicationStatus = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
const mediaType = ['IMAGE', 'VIDEO'] as const;
const articleCategory = [
  'HEALTH_AND_WELLNESS',
  'NUTRITION',
  'FITNESS',
  'MENTAL_HEALTH',
  'MEDICAL_RESEARCH',
  'HEALTHCARE_POLICY',
  'PATIENT_STORIES',
  'MEDICINE',
  'PREVENTION',
  'LIFESTYLE',
] as const;
const medicationRecordType = ['MEDICATION', 'VACCINATION', 'OTHER'] as const;
const medicationRecordStatus = ['ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPENSED', 'PENDING_VALIDATION'] as const;
const medicationFrequencyType = ['DAILY', 'WEEKLY', 'MONTHLY', 'AS_NEEDED'] as const;

const insuranceItemType = ['PATIENT', 'PROFESSIONAL', 'BUSINESS'] as const;
const professionalType = ['DOCTOR', 'NURSE', 'PHARMACIST', 'DRIVER'] as const;
const professionalRole = ['MANAGER', 'ASSISTANT', 'STAFF', 'INTERN', 'OWNER'] as const;
const userRole = ['ADMIN', 'PROFESSIONAL', 'PATIENT'] as const;
const salesSummaryTimeGranularity = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const;

const schema = a.schema({
  addUserToGroup: a
    .mutation()
    .arguments({
      authId: a.string().required(),
      groupName: a.string().required(),
    })
    .returns(a.customType({
      content: a.string()
    }))
    .handler(a.handler.function(addUserToGroup))
    .authorization((allow) => [allow.groups(['ADMIN', 'PROFESSIONAL'])]),
  adminCreateUser: a
    .mutation()
    .arguments({
      phone: a.string().required(),
      password: a.string().required(),
    })
    .authorization((allow) => [allow.groups(['ADMIN', 'PROFESSIONAL'])])
    .handler(a.handler.function(adminCreateUser))
    .returns(a.customType({
      content: a.string()
    })),

  addOrUpdateSearchableRecord: a
    .mutation()
    .arguments({
      indexName: a.string().required(),
      objectID: a.string().required(),
      body: a.json().required(),
    })
    .authorization((allow) => [allow.groups(['ADMIN', 'PROFESSIONAL'])])
    .handler(a.handler.function(addOrUpdateSearchableRecord))
    .returns(a.customType({
      content: a.string()
    })),

  deleteSearchableRecord: a
    .mutation()
    .arguments({
      indexName: a.string().required(),
      objectID: a.string().required(),
    })
    .authorization((allow) => [allow.groups(['ADMIN', 'PROFESSIONAL'])])
    .handler(a.handler.function(deleteSearchableRecord))
    .returns(a.customType({
      content: a.string()
    })),

  createStreamToken: a
    .mutation()
    .arguments({
      userId: a.string().required(),
    })
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(createStreamToken))
    .returns(a.customType({
      content: a.string()
    })),
  getSecrets: a
    .mutation()
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(getSecrets))
    .returns(a.customType({
      content: a.string()
    })),

  user: a.model({
    authId: a.string().required(),
    role: a.enum(userRole),
    email: a.string(),
    phone: a.string(),
    name: a.string(),
    profilePicture: a.string(),
    expoPushTokens: a.string().array().required(),
    isDeleted: a.boolean().required().default(false),
    //  notifications: a.hasMany('notification', 'userId'),
    // view: a.hasMany('view', 'userId'),
    // likes: a.hasMany('like', 'userId'),
    articles: a.hasMany('article', 'authorId'),
    ratings: a.hasMany('rating', 'userId'),
    // reminders: a.hasMany('reminder', 'userId'),
    professional: a.hasOne('professional', 'userId'),
    patient: a.hasOne('patient', 'userId'),
    validatedPrescriptions: a.hasMany('prescription', 'validatedById')
  }).identifier(['authId'])
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.ownerDefinedIn('authId').to(['create', 'read', 'update']),
      allow.groups(['ADMIN']).to(['read', 'create', 'update']),
    ])
    .disableOperations(['subscriptions', 'delete']),

  patient: a.model({
    userId: a.id().required(),
    phone: a.string().required(),
    email: a.string(),
    name: a.string().required(),
    gender: a.enum(gender),
    preferredLanguage: a.enum(language),
    dateOfBirth: a.date(),
    lastLogin: a.datetime(),
    profilePicture: a.string(),
    nationalID: a.string(),
    contracts: a.hasMany('contract', 'patientId'),
    medicineOrders: a.hasMany('medicineOrder', 'patientId'),
    invoices: a.hasMany('invoice', 'patientId'),
    paymentMethods: a.hasMany('paymentMethod', 'patientId'),
    patientHealthStatus: a.hasOne('patientHealthStatus', 'patientId'),
    medications: a.hasMany('medicationRecord', 'patientId'),
    prescriptions: a.hasMany('prescription', 'patientId'),
    consultationRecords: a.hasMany('consultationRecord', 'patientId'),
    appointments: a.hasMany('appointment', 'patientId'),
    user: a.belongsTo('user', 'userId'),
    address: a.hasOne('address', 'addressOwnerId'),
    deliveries: a.hasMany('delivery', 'patientId'),
  }).identifier(['userId'])
    .authorization(allow => [
      allow.owner().to(['read', 'create', 'update']),
      allow.group('PROFESSIONAL').to(['read']),
      allow.group('ADMIN').to(['read', 'update']),
    ])
    .disableOperations(['subscriptions', 'delete']),

  patientHealthStatus: a.model({
    patientId: a.id().required(),
    caloriesBurned: a.integer(),
    weight: a.float(),
    cholesterolTotal: a.float(),
    cholesterolLDL: a.float(),
    cholesterolHDL: a.float(),
    bodyMassIndex: a.float(),
    bodyFatPercentage: a.float(),
    hydrationLevel: a.float(),
    sleepQuality: a.enum(sleepQuality),
    physicalActivityLevel: a.enum(physicalActivityLevel),
    bloodPressure: a.customType({
      systolic: a.integer(),
      diastolic: a.integer(),
    }),
    oxygenLevel: a.float(),
    allergies: a.string().array(),
    variabilityMetrics: a.json(),
    socialActivityFeatures: a.string().array(),
    predictiveHealthScores: a.json(),
    engagementStrategies: a.string().array(),
    additionalMetrics: a.json(),
    medicationAllergies: a.string().array().required(),
    patient: a.belongsTo('patient', 'patientId'),
    heartRateRecords: a.hasMany('heartRateRecord', 'patientHealthStatusId'),
    bloodSugarRecords: a.hasMany('bloodSugarRecord', 'patientHealthStatusId'),
  })
    .identifier(['patientId'])
    .authorization(allow => [
      allow.owner().to(['read', 'create', 'update']),
      allow.group('PROFESSIONAL').to(['read', 'update']),
      allow.group('ADMIN').to(['read']),
    ]).disableOperations(['subscriptions']),

  heartRateRecord: a.model({
    id: a.id().required(),
    patientHealthStatusId: a.id().required(),
    heartRate: a.integer().required(),
    timestamp: a.datetime().required(),
    patientHealthStatus: a.belongsTo('patientHealthStatus', 'patientHealthStatusId'),
  }).authorization(allow => [
    allow.owner().to(['read', 'create', 'update']),
    allow.group('PROFESSIONAL').to(['read', 'update']),
    allow.group('ADMIN').to(['read']),
  ]),

  bloodSugarRecord: a.model({
    id: a.id().required(),
    patientHealthStatusId: a.id().required(),
    bloodSugarLevel: a.float().required(),
    timestamp: a.datetime().required(),
    patientHealthStatus: a.belongsTo('patientHealthStatus', 'patientHealthStatusId'),
  }).authorization(allow => [
    allow.owner().to(['read', 'create', 'update']),
    allow.group('PROFESSIONAL').to(['read', 'update']),
    allow.group('ADMIN').to(['read']),
  ]),

  prescription: a.model({
    id: a.id().required(),
    patientId: a.id().required(),
    prescriptionNumber: a.string().required(),
    status: a.enum(prescriptionStatus),
    type: a.enum(prescriptionType),
    prescriberId: a.id(),
    validatedById: a.id(),
    consultationRecordId: a.id(),
    validatedAt: a.datetime(),
    issuedAt: a.datetime().required(),
    expiryAt: a.datetime().required(),
    documentUrl: a.string(),
    purpose: a.string(),
    notes: a.string(),
    refillsAllowed: a.integer().required(),
    refillsRemaining: a.integer().required(),
    isRenewable: a.boolean().required().default(false),
    renewalAt: a.datetime(),
    patient: a.belongsTo('patient', 'patientId'),
    prescriber: a.belongsTo('professional', 'prescriberId'),
    validator: a.belongsTo('user', 'validatedById'),
    consultationRecord: a.belongsTo('consultationRecord', 'consultationRecordId'),
    items: a.hasMany('prescriptionItem', 'prescriptionId'),
    orders: a.hasMany('medicineOrder', 'prescriptionId'),
    medicationRecords: a.hasMany('medicationRecord', 'prescriptionId'),
  })
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.owner().to(['read', 'create', 'update']),
      allow.group('ADMIN').to(['read', 'update', 'create']),
    ])
    .disableOperations(['delete']),

  prescriptionItem: a.model({
    id: a.id().required(),
    medicineId: a.id().required(),
    prescriptionId: a.id().required(),
    name: a.string().required(),
    dosage: a.string().required(),
    frequency: a.customType({
      type: a.enum(medicationFrequencyType),
      daysOfWeek: a.integer().array(),
      daysOfMonth: a.integer().array(),
      specificTimes: a.string().array(),
    }),
    quantity: a.integer().required(),
    notes: a.string(),
    medicine: a.belongsTo('medicine', 'medicineId'),
    prescription: a.belongsTo('prescription', 'prescriptionId'),
    medicationRecords: a.hasMany('medicationRecord', 'prescriptionItemId'),
  })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.group('ADMIN').to(['read', 'update', 'create']),
    ])
    .disableOperations(['subscriptions', 'delete']),

  medicationRecord: a.model({
    id: a.id().required(),
    prescriptionId: a.id().required(),
    prescriptionItemId: a.id().required(),
    pharmacyInventoryId: a.id().required(),
    patientId: a.id().required(),
    administeredById: a.id(),
    type: a.enum(medicationRecordType),
    status: a.enum(medicationRecordStatus),
    name: a.string().required(),
    dosage: a.string(),
    frequency: a.customType({
      type: a.enum(medicationFrequencyType),
      daysOfWeek: a.integer().array(),
      daysOfMonth: a.integer().array(),
      specificTimes: a.string().array(),
    }),
    purpose: a.string(),
    notes: a.string(),
    quantity: a.integer().required(),
    startDate: a.datetime().required(),
    nextRefillDate: a.datetime(),
    reminderEnabled: a.boolean().required(),
    nextDoseDate: a.datetime(), // For vaccinations
    nextDoseNumber: a.integer(), // For vaccinations
    administeredBy: a.belongsTo('professional', 'administeredById'),
    patient: a.belongsTo('patient', 'patientId'),
    prescription: a.belongsTo('prescription', 'prescriptionId'),
    prescriptionItem: a.belongsTo('prescriptionItem', 'prescriptionItemId'),
    pharmacyInventory: a.belongsTo('pharmacyInventory', 'pharmacyInventoryId'),
  })
    .authorization(allow => [
      allow.owner().to(['read', 'create', 'update']),
      allow.group('PROFESSIONAL').to(['read', 'update', 'create']),
      allow.group('ADMIN').to(['read']),
    ]).disableOperations(['subscriptions', 'delete']),

  medicineOrder: a.model({
    id: a.id().required(),
    orderNumber: a.string().required(),
    patientId: a.id().required(),
    businessId: a.id().required(),
    paymentMethodId: a.id().required(),
    prescriptionId: a.id(),
    isForPatient: a.boolean().required().default(true),
    status: a.enum(medicineOrderStatus),
    patient: a.belongsTo('patient', 'patientId'),
    prescription: a.belongsTo('prescription', 'prescriptionId'),
    items: a.hasMany('medicineOrderItem', 'orderId'),
    delivery: a.hasOne('delivery', 'orderId'),
    pharmacy: a.belongsTo('business', 'businessId'),
    invoices: a.hasMany('invoice', 'invoiceSourceId'),
    paymentMethod: a.belongsTo('paymentMethod', 'paymentMethodId'),
  })
    .authorization(allow => [
      allow.owner().to(['read', 'create', 'update']),
      allow.group('PROFESSIONAL').to(['read', 'update']),
      allow.group('ADMIN').to(['read', 'update']),
    ]).disableOperations(['delete']),

  medicineOrderItem: a.model({
    id: a.id().required(),
    orderId: a.id().required(),
    pharmacyInventoryId: a.id().required(),
    medicineId: a.id().required(),
    name: a.string().required(),
    quantity: a.integer().required(),
    unitPrice: a.float().required(),
    order: a.belongsTo('medicineOrder', 'orderId'),
    pharmacyInventory: a.belongsTo('pharmacyInventory', 'pharmacyInventoryId'),
    medicine: a.belongsTo('medicine', 'medicineId'),
  })
    .authorization(allow => [
      allow.owner().to(['read', 'create', 'update']),
      allow.groups(['ADMIN', 'PROFESSIONAL']).to(['read']),
    ]).disableOperations(['subscriptions', 'delete']),

  contract: a.model({
    id: a.id().required(),
    contractNumber: a.string().required(),
    patientId: a.id().required(),
    businessId: a.id().required(),
    professionalId: a.id().required(),
    businessServiceId: a.id().required(),
    paymentMethodId: a.id().required(),
    type: a.enum(contractType),
    status: a.enum(contractStatus),
    autoRenew: a.boolean().required().default(false),
    nextRenewalDate: a.datetime().required(),
    renewalNoticeDays: a.integer().required().default(7),
    appointmentsAllowed: a.integer().required(),
    appointmentsUsed: a.integer().required().default(0),
    appliedPricingConditions: a.string().required().array().required(),
    purpose: a.string().required(),
    notes: a.string(),
    signatureImage: a.string(),
    terminationReason: a.string(),
    terminatedBy: a.enum(contractTerminatedBy),
    terminatedAt: a.datetime(),
    patient: a.belongsTo('patient', 'patientId'),
    business: a.belongsTo('business', 'businessId'),
    businessService: a.belongsTo('businessService', 'businessServiceId'),
    appointments: a.hasMany('appointment', 'contractId'),
    paymentMethod: a.belongsTo('paymentMethod', 'paymentMethodId'),
    consultationRecords: a.hasMany('consultationRecord', 'contractId'),
    contractPayments: a.hasMany('contractPayment', 'contractId'),
    invoices: a.hasMany('invoice', 'invoiceSourceId'),
  })
    .authorization(allow => [
      allow.owner().to(['read', 'create', 'update']),
      allow.groups(['ADMIN', 'PROFESSIONAL']).to(['read', 'update']),
    ]).disableOperations(['delete']),

  contractPayment: a.model({
    id: a.id().required(),
    contractId: a.id().required(),
    periodStart: a.datetime().required(),
    periodEnd: a.datetime().required(),
    paymentDate: a.datetime().required(),
    amount: a.float().required(),
    refundableAmount: a.float().required(),
    invoiceId: a.id().required(),
    contract: a.belongsTo('contract', 'contractId'),
    invoice: a.belongsTo('invoice', 'invoiceId')
  })
    .authorization(allow => [
      allow.authenticated().to(['read']),
    ]).disableOperations(['delete', 'subscriptions', 'update']),

  service: a.model({
    id: a.id().required(),
    name: a.string().required(),
    description: a.string().required(),
    keywords: a.string().required().array().required(),
    professionalType: a.enum(professionalType),
    businessType: a.enum(businessType),
    publicationStatus: a.enum(publicationStatus),
    requiredEquipment: a.string(),
    treatmentTechniques: a.string(),
    conditionsTreated: a.string().required().array().required(),
    image: a.string().required(),
    serviceFeasibility: a.enum(serviceFeasibility),
    baseSessionDurationMinutes: a.integer(),
    baseSessionFee: a.float().required(),
    businessServices: a.hasMany('businessService', 'serviceId'),
  })
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.group('PROFESSIONAL').to(['read']),
      allow.group('ADMIN').to(['read', 'create', 'update']),
    ]).disableOperations(['subscriptions', 'delete']),

  businessService: a.model({
    id: a.id().required(),
    businessId: a.id().required(),
    professionalId: a.id().required(),
    serviceId: a.id().required(),
    professionalType: a.enum(professionalType),
    businessType: a.enum(businessType),
    publicationStatus: a.enum(publicationStatus),
    sessionDurationMinutes: a.integer().required(),
    businessLatitude: a.float().required(),
    businessLongitude: a.float().required(),
    businessName: a.string().required(),
    professionalName: a.string().required(),
    serviceName: a.string().required(),
    ratings: a.hasMany('rating', 'ratedItemId'),
    pricing: a.hasMany('businessServicePricing', 'businessServiceId'),
    service: a.belongsTo('service', 'serviceId'),
    business: a.belongsTo('business', 'businessId'),
    contracts: a.hasMany('contract', 'businessServiceId'),
    professional: a.belongsTo('professional', 'professionalId'),
    consultationRecords: a.hasMany('consultationRecord', 'businessServiceId'),
    appointments: a.hasMany('appointment', 'businessServiceId')
  })
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.group('PROFESSIONAL').to(['read', 'update', 'create']),
      allow.group('ADMIN').to(['read', 'update']),
    ]).disableOperations(['subscriptions', 'delete']),

  businessServicePricing: a.model({
    id: a.id().required(),
    businessServiceId: a.id().required(),
    description: a.string(),
    fee: a.float().required(),
    condition: a.enum(pricingCondition),
    feeType: a.enum(feeType),
    calculationType: a.enum(calculationType),
    businessService: a.belongsTo('businessService', 'businessServiceId'),
  })
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.group('PROFESSIONAL').to(['read', 'update', 'create']),
      allow.group('ADMIN').to(['read', 'update']),
    ]).disableOperations(['subscriptions']),

  appointment: a.model({
    id: a.id().required(),
    appointmentNumber: a.string().required(),
    contractId: a.id().required(),
    patientId: a.id().required(),
    professionalId: a.id().required(),
    businessServiceId: a.id().required(),
    appointmentDateTime: a.datetime().required(),
    duration: a.integer().required(),
    status: a.enum(appointmentStatus),
    type: a.enum(appointmentType),
    requesterType: a.enum(appointmentParticipantType),
    starterType: a.enum(appointmentParticipantType),
    purpose: a.string().required(),
    notes: a.string(),
    patientRescheduledCount: a.integer().required().default(0),
    professionalRescheduledCount: a.integer().required().default(0),
    confirmationDateTime: a.datetime(),
    cancellationReason: a.string(),
    contract: a.belongsTo('contract', 'contractId'),
    patient: a.belongsTo('patient', 'patientId'),
    professional: a.belongsTo('professional', 'professionalId'),
    businessService: a.belongsTo('businessService', 'businessServiceId'),
    consultationRecord: a.hasOne('consultationRecord', 'appointmentId'),
  })
    .authorization(allow => [
      allow.owner().to(['read', 'create', 'update']),
      allow.group('PROFESSIONAL').to(['read', 'create', 'update']),
      allow.group('ADMIN').to(['read', 'update']),
    ]).disableOperations(['subscriptions', 'delete']),

  consultationRecord: a.model({
    appointmentId: a.id().required(),
    contractId: a.id().required(),
    patientId: a.id().required(),
    businessId: a.id().required(),
    professionalId: a.id().required(),
    businessServiceId: a.id().required(),
    type: a.enum(consultationType),
    purpose: a.string(),
    notes: a.string(),
    outcome: a.enum(outcome),
    startedAt: a.datetime(),
    endedAt: a.datetime(),
    prescriptions: a.hasMany('prescription', 'consultationRecordId'),
    patient: a.belongsTo('patient', 'patientId'),
    business: a.belongsTo('business', 'businessId'),
    professional: a.belongsTo('professional', 'professionalId'),
    businessService: a.belongsTo('businessService', 'businessServiceId'),
    appointment: a.belongsTo('appointment', 'appointmentId'),
    contract: a.belongsTo('contract', 'contractId'),
  })
    .identifier(['appointmentId'])
    .authorization(allow => [
      allow.owner().to(['read', 'create', 'update']),
      allow.group('PROFESSIONAL').to(['read', 'create', 'update']),
      allow.group('ADMIN').to(['read']),
    ]).disableOperations(['subscriptions', 'delete']),

  article: a.model({
    id: a.id().required(),
    title: a.string().required(),
    slug: a.string().required(),
    excerpt: a.string(),
    authorId: a.id().required(),
    publicationStatus: a.enum(publicationStatus),
    tags: a.string().required().array().required(),
    categories: a.string().required().array().required(),
    publishedAt: a.datetime().required(),
    viewCount: a.integer().required().default(0),
    likeCount: a.integer().required().default(0),
    featuredImage: a.hasOne('media', 'mediaFromId'),
    // likes: a.hasMany('like', 'likedItemId'),
    // views: a.hasMany('view', 'viewedItemId'),
    author: a.belongsTo('user', 'authorId'),
    contentBlocks: a.hasMany('contentBlock', 'articleId'),
  }).authorization(allow => [
    allow.guest().to(['read']),
    allow.authenticated().to(['read']),
    allow.groups(['ADMIN']).to(['create', 'read', 'update', 'delete']),
  ]).disableOperations(['subscriptions']),

  contentBlock: a.model({
    id: a.id().required(),
    articleId: a.id().required(),
    title: a.string(),
    content: a.string().required(),
    order: a.integer().required(),
    article: a.belongsTo('article', 'articleId'),
    medias: a.hasMany('media', 'mediaFromId'),
  }).authorization(allow => [
    allow.guest().to(['read']),
    allow.authenticated().to(['read']),
    allow.groups(['ADMIN']).to(['create', 'read', 'update', 'delete']),
  ]).disableOperations(['subscriptions']),

  media: a.model({
    mediaFromId: a.id().required(),
    mediaFromType: a.enum(mediaFromType),
    url: a.string().required(),
    thumbnailUrl: a.string(),
    type: a.enum(mediaType),
    fileSize: a.integer(),
    mimeType: a.string(),
    article: a.belongsTo('article', 'mediaFromId'),
    contentBlock: a.belongsTo('contentBlock', 'mediaFromId'),
  }).identifier(['mediaFromId'])
    .authorization(allow => [
      allow.guest().to(['read']),
      allow.authenticated().to(['create', 'read', 'update', 'delete']),
    ]).disableOperations(['subscriptions']),

  business: a.model({
    id: a.id().required(),
    type: a.enum(businessType),
    publicationStatus: a.enum(publicationStatus),
    name: a.string().required(),
    email: a.string().required(),
    phone: a.string().required(),
    logoUrl: a.string().required(),
    uniqueTaxIdentificationNumber: a.string().required(),
    description: a.string().required(),
    establishedDate: a.datetime(),
    businessLatitude: a.float().required(),
    businessLongitude: a.float().required(),
    address: a.hasOne('address', 'addressOwnerId'),
    contracts: a.hasMany('contract', 'businessId'),
    // certifications: a.hasMany('certification', 'certifiedItemId'),
    // licenses: a.hasMany('license', 'licensedItemId'),
    businessOpeningHour: a.hasOne('businessOpeningHour', 'businessId'),
    ratings: a.hasMany('rating', 'ratedItemId'),
    consultationRecords: a.hasMany('consultationRecord', 'businessId'),
    businessServices: a.hasMany('businessService', 'businessId'),
    invoices: a.hasMany('invoice', 'businessId'),
    professionals: a.hasMany('professional', 'businessId'),
    courierDeliveries: a.hasMany('delivery', 'courierId'),
    pharmacyDeliveries: a.hasMany('delivery', 'pharmacyId'),
    pharmacyInventoryItems: a.hasMany('pharmacyInventory', 'pharmacyId'),
    medicineOrders: a.hasMany('medicineOrder', 'businessId'),
  })
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.group('PROFESSIONAL').to(['read', 'update']),
      allow.group('ADMIN').to(['read', 'create', 'update']),
    ]).disableOperations(['subscriptions', 'delete']),

  professional: a.model({
    userId: a.id().required(),
    businessId: a.id().required(),
    professionalRegistrationNumber: a.string().required(),
    phone: a.string().required(),
    email: a.string().required(),
    name: a.string().required(),
    legalName: a.string().required(),
    gender: a.enum(gender),
    dateOfBirth: a.date().required(),
    lastLogin: a.datetime(),
    profilePicture: a.string().required(),
    bio: a.string(),
    type: a.enum(professionalType),
    role: a.enum(professionalRole),
    publicationStatus: a.enum(publicationStatus),
    languagesSpoken: a.string().required().array().required(),
    specialties: a.string().required().array().required(),
    education: a.string().required().array().required(),
    careerStartedAt: a.date().required(),
    availability: a.hasOne('professionalAvailability', 'professionalId'),
    // certifications: a.hasMany('certification', 'certifiedItemId'),
    // licenses: a.hasMany('license', 'licensedItemId'),
    address: a.hasOne('address', 'addressOwnerId'),
    ratings: a.hasMany('rating', 'ratedItemId'),
    user: a.belongsTo('user', 'userId'),
    business: a.belongsTo('business', 'businessId'),
    prescriptions: a.hasMany('prescription', 'prescriberId'),
    services: a.hasMany('businessService', 'professionalId'),
    consultationRecords: a.hasMany('consultationRecord', 'professionalId'),
    appointments: a.hasMany('appointment', 'professionalId'),
    administeredMedications: a.hasMany('medicationRecord', 'administeredById'),
    vehicles: a.hasMany('vehicle', 'driverId'),
    driverDeliveries: a.hasMany('delivery', 'driverId'),
    driverCurrentLocation: a.hasOne('driverCurrentLocation', 'driverId'),
  })
    .identifier(['userId'])
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.groups(['PROFESSIONAL', 'ADMIN']).to(['read', 'update', 'create']),
    ]).disableOperations(['subscriptions', 'delete']),

  professionalAvailability: a.model({
    professionalId: a.id().required(),
    professionalType: a.enum(professionalType),
    currentAvailabilityStatus: a.enum(professionalAvailabilityStatus),
    bufferBefore: a.integer().required(),
    bufferAfter: a.integer().required(),
    timeSlots: a.json().array().required(),
    exclusions: a.date().array(),
    recurrencePattern: a.hasOne('recurrencePattern', 'professionalAvailabilityId'),
    professional: a.belongsTo('professional', 'professionalId'),
  })
    .identifier(['professionalId'])
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.groups(['PROFESSIONAL', 'ADMIN']).to(['read', 'update', 'create']),
    ]).disableOperations(['subscriptions']),

  recurrencePattern: a.model({
    professionalAvailabilityId: a.id().required(),
    recurrenceType: a.enum(recurrenceType),
    recurrenceEndAt: a.datetime(),
    daysOfWeek: a.integer().required().array().required(),
    professionalAvailability: a.belongsTo('professionalAvailability', 'professionalAvailabilityId')
  })
    .identifier(['professionalAvailabilityId'])
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.groups(['PROFESSIONAL', 'ADMIN']).to(['read', 'update', 'create']),
    ]).disableOperations(['subscriptions']),

  driverCurrentLocation: a.model({
    driverId: a.id().required(),
    latitude: a.float().required(),
    longitude: a.float().required(),
    timestamp: a.datetime().required(),
    driver: a.belongsTo('professional', 'driverId'),
  })
    .identifier(['driverId'])
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.groups(['PROFESSIONAL', 'ADMIN']).to(['read', 'update', 'create']),
    ])
    .disableOperations(['delete']),

  vehicle: a.model({
    id: a.id().required(),
    driverId: a.id().required(),
    licensePlate: a.string().required(),
    model: a.string().required(),
    year: a.integer().required(),
    color: a.string().required(),
    type: a.enum(vehicleType),
    driver: a.belongsTo('professional', 'driverId'),
    deliveries: a.hasMany('delivery', 'vehicleId'),
  })
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.groups(['PROFESSIONAL', 'ADMIN']).to(['read', 'update', 'create']),
    ]).disableOperations(['subscriptions', 'delete']),

  delivery: a.model({
    orderId: a.id().required(),
    patientId: a.id().required(),
    deliveryNumber: a.string().required(),
    driverId: a.id(),
    vehicleId: a.id(),
    courierId: a.id(),
    pharmacyId: a.id().required(),
    status: a.enum(deliveryStatus),
    distanceInKm: a.float().required(),
    estimatedDeliveryDuration: a.integer().required(),
    type: a.enum(deliveryType),
    totalDeliveryFee: a.float().required(),
    specialHandlingFee: a.float().required(),
    notes: a.string(),
    preferredDeliveryTimeStartAt: a.datetime().required(),
    preferredDeliveryTimeEndAt: a.datetime().required(),
    pickedUpAt: a.datetime(),
    departedAt: a.datetime(),
    deliveredAt: a.datetime(),
    signatureImage: a.string(),
    deliveryConfirmationCode: a.string(),
    order: a.belongsTo('medicineOrder', 'orderId'),
    driver: a.belongsTo('professional', 'driverId'),
    courier: a.belongsTo('business', 'courierId'),
    vehicle: a.belongsTo('vehicle', 'vehicleId'),
    pharmacy: a.belongsTo('business', 'pharmacyId'),
    patient: a.belongsTo('patient', 'patientId'),
    address: a.hasOne('address', 'addressOwnerId'),
    statusHistory: a.hasMany('deliveryStatusHistory', 'deliveryId'),
    deliveryAssignments: a.hasMany('deliveryAssignment', 'deliveryId'),
  })
    .identifier(['orderId'])
    .authorization(allow => [
      allow.owner().to(['read', 'create', 'update']),
      allow.groups(['PROFESSIONAL', 'ADMIN']).to(['read', 'update', 'create']),
    ]).disableOperations(['delete']),

  deliveryStatusHistory: a.model({
    id: a.id().required(),
    deliveryId: a.id().required(),
    patientId: a.id().required(),
    status: a.enum(deliveryStatus),
    timestamp: a.datetime().required(),
    notes: a.string(),
    actorId: a.id(),
    actorType: a.enum(deliveryStatusHistoryActorType),
    latitude: a.float().required(),
    longitude: a.float().required(),
    delivery: a.belongsTo('delivery', 'deliveryId'),
  })
    .secondaryIndexes((index) => [
      index('deliveryId')
        .sortKeys(['timestamp'])
        .queryField('listDeliveryStatusHistoryByDeliveryIdAndTimestamp'),
    ]).authorization(allow => [
      allow.authenticated().to(['read']),
      allow.groups(['PROFESSIONAL', 'ADMIN']).to(['read', 'create']),
    ]),

  deliveryAssignment: a.model({
    id: a.id().required(),
    deliveryId: a.id().required(),
    driverId: a.id().required(),
    courierId: a.id().required(),
    status: a.enum(deliveryAssignmentStatus),
    expiresAt: a.datetime().required(),
    estimatedDistance: a.float().required(),
    estimatedDuration: a.integer().required(),
    driverLocationLatitude: a.float().required(),
    driverLocationLongitude: a.float().required(),
    delivery: a.belongsTo('delivery', 'deliveryId'),
  })
    .authorization(allow => [
      allow.groups(['ADMIN', 'PROFESSIONAL']).to(['read', 'update']),
    ]),

  medicineCategory: a.model({
    id: a.id().required(),
    genericName: a.string().required(),
    dosageForms: a.string().array(),
    administrationRoutes: a.string().array(),
    indications: a.string().array(),
    contraindications: a.string().array(),
    sideEffects: a.string().array(),
    composition: a.string(),
    precautions: a.string().array(),
    interactions: a.string().array(),
    storageConditions: a.string(),
    description: a.string(),
    prescriptionLevel: a.integer().required(),
    specialDeliveryHandlingCondition: a.string(),
    specialDeliveryHandlingDescription: a.string(),
    specialDeliveryHandlingFee: a.float(),
    medicines: a.hasMany('medicine', 'categoryId'),
  })
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.group('ADMIN').to(['read', 'create', 'update']),
    ]).disableOperations(['subscriptions', 'delete']),

  medicine: a.model({
    id: a.id().required(),
    categoryId: a.id().required(),
    name: a.string().required(),
    brand: a.string().required(),
    indications: a.string().required(),
    contraindications: a.string(),
    sideEffects: a.string(),
    composition: a.string().required(),
    precautions: a.string(),
    interactions: a.string(),
    packaging: a.string().required(),
    description: a.string(),
    administrationRoute: a.string().required(),
    storageConditions: a.string().required(),
    image: a.string().required(),
    publicationStatus: a.enum(publicationStatus),
    prescriptionLevel: a.integer().required(),
    specialDeliveryHandlingCondition: a.string(),
    specialDeliveryHandlingDescription: a.string(),
    specialDeliveryHandlingFee: a.float().required().default(0),
    category: a.belongsTo('medicineCategory', 'categoryId'),
    prescriptionItems: a.hasMany('prescriptionItem', 'medicineId'),
    pharmacyInventories: a.hasMany('pharmacyInventory', 'medicineId'),
    medicineOrderItems: a.hasMany('medicineOrderItem', 'medicineId'),
    // views: a.hasMany('view', 'viewedItemId'),
    // likes: a.hasMany('like', 'likedItemId'),
    ratings: a.hasMany('rating', 'ratedItemId'),
  })
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.group('ADMIN').to(['read', 'create', 'update']),
    ]).disableOperations(['subscriptions', 'delete']),

  pharmacyInventory: a.model({
    id: a.id().required(),
    pharmacyId: a.id().required(),
    medicineId: a.id().required(),
    price: a.float().required(),
    stock: a.integer().required(),
    reservedStock: a.integer().required().default(0),
    publicationStatus: a.enum(publicationStatus),
    specialDeliveryHandlingFee: a.float().required().default(0),
    pharmacyLatitude: a.float().required(),
    pharmacyLongitude: a.float().required(),
    pharmacyName: a.string().required(),
    pharmacy: a.belongsTo('business', 'pharmacyId'),
    medicine: a.belongsTo('medicine', 'medicineId'),
    medicineOrderItems: a.hasMany('medicineOrderItem', 'pharmacyInventoryId'),
    medicationRecords: a.hasMany('medicationRecord', 'pharmacyInventoryId'),
  })
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.groups(['ADMIN', 'PROFESSIONAL']).to(['read', 'create', 'update']),
    ]).disableOperations(['subscriptions', 'delete']),

  notification: a.model({
    id: a.id().required(),
    userId: a.id().required(),
    relatedItemId: a.id(),
    title: a.string().required(),
    message: a.string().required(),
    type: a.enum(notificationType),
    priority: a.enum(priority),
    payload: a.customType({
      href: a.string()
    }),
    relatedItemType: a.enum(notificationRelatedItemType),
    expiresAt: a.datetime().required(),
    isRead: a.boolean().required().default(false),
    //  user: a.belongsTo('user', 'userId'),
  }).authorization(allow => [
    allow.authenticated().to(['read']),
    allow.groups(['ADMIN', 'PROFESSIONAL']).to(['create', 'read', 'update', 'delete']),
  ]).disableOperations(['subscriptions']),

  view: a.model({
    userId: a.id(),
    identityId: a.string(),
    viewedItemId: a.id().required(),
    viewedItemType: a.enum(viewedItemType),
    timestamp: a.datetime().required(),
    //  user: a.belongsTo('user', 'userId'),
    // article: a.belongsTo('article', 'viewedItemId'),
    // medicine: a.belongsTo('medicine', 'viewedItemId'),
  }).identifier(['viewedItemId'])
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.groups(['ADMIN']).to(['read']),
    ]).disableOperations(['subscriptions', 'update', 'delete']),

  like: a.model({
    userId: a.id().required(),
    likedItemId: a.id().required(),
    likedItemType: a.enum(likedItemType),
    // user: a.belongsTo('user', 'userId'),
    // article: a.belongsTo('article', 'likedItemId'),
    // medicine: a.belongsTo('medicine', 'likedItemId'),
  }).identifier(['likedItemId', 'userId'])
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.owner().to(['create', 'read', 'delete']),
    ]).disableOperations(['subscriptions', 'update']),

  rating: a.model({
    userId: a.id().required(),
    ratedItemId: a.id().required(),
    ratedItemType: a.enum(ratedItemType),
    rating: a.integer().required(),
    comment: a.string(),
    verifiedPurchase: a.boolean().required().default(false),
    responseComment: a.string(),
    responseCreatedAt: a.datetime(),
    user: a.belongsTo('user', 'userId'),
    business: a.belongsTo('business', 'ratedItemId'),
    professional: a.belongsTo('professional', 'ratedItemId'),
    medicine: a.belongsTo('medicine', 'ratedItemId'),
    businessService: a.belongsTo('businessService', 'ratedItemId'),
  })
    .identifier(['ratedItemId', 'userId'])
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.owner().to(['create', 'read', 'update', 'delete']),
      allow.group('ADMIN').to(['read', 'create', 'update']),
    ]).disableOperations(['subscriptions', 'delete']),

  address: a.model({
    addressOwnerId: a.id().required(),
    addressOwnerType: a.enum(addressOwnerType),
    addressLine1: a.string().required(),
    neighborhoodOrDistrict: a.string().required(),
    city: a.string().required(),
    province: a.string().required(),
    postalCode: a.string(),
    country: a.string().required(),
    latitude: a.float(),
    longitude: a.float(),
    type: a.enum(addressType),
    patient: a.belongsTo('patient', 'addressOwnerId'),
    professional: a.belongsTo('professional', 'addressOwnerId'),
    business: a.belongsTo('business', 'addressOwnerId'),
    delivery: a.belongsTo('delivery', 'addressOwnerId'),
  })
    .identifier(['addressOwnerId'])
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.owner().to(['create', 'read', 'update']),
      allow.groups(['ADMIN', 'PROFESSIONAL']).to(['read', 'create', 'update']),
    ]).disableOperations(['subscriptions']),

  certification: a.model({
    certifiedItemId: a.id().required(),
    issuedBy: a.string().required(),
    name: a.string().required(),
    description: a.string(),
    certifiedItemType: a.enum(certifiedItemType),
    // professional: a.belongsTo('professional', 'certifiedItemId'),
    // business: a.belongsTo('business', 'certifiedItemId'),
  })
    .identifier(['certifiedItemId'])
    .authorization(allow => [
      allow.authenticated().to(['create', 'read', 'update', 'delete']),
      allow.group('ADMIN').to(['read', 'create', 'update']),
    ]).disableOperations(['subscriptions']),

  license: a.model({
    licensedItemId: a.id().required(),
    issuedBy: a.string().required(),
    licenseNumber: a.string().required(),
    issueDate: a.datetime().required(),
    status: a.enum(licenseStatus),
    expiryDate: a.datetime(),
    description: a.string(),
    licensedItemType: a.enum(licensedItemType),
    // professional: a.belongsTo('professional', 'licensedItemId'),
    // business: a.belongsTo('business', 'licensedItemId'),
  })
    .identifier(['licensedItemId'])
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.owner().to(['create', 'read', 'update', 'delete']),
      allow.group('ADMIN').to(['read', 'create', 'update']),
    ]).disableOperations(['subscriptions']),

  insurance: a.model({
    insuredItemId: a.id().required(),
    insuredItemType: a.enum(insuranceItemType),
    provider: a.string().required(),
    policyNumber: a.string().required(),
    groupNumber: a.string(),
    effectiveDate: a.date(),
    expirationDate: a.date(),
    memberID: a.string(),
    isVerified: a.boolean().default(false),
    // patient: a.belongsTo('patient', 'insuredItemId'),
    // professional: a.belongsTo('professional', 'insuredItemId'),
    // business: a.belongsTo('business', 'insuredItemId'),
  })
    .identifier(['insuredItemId'])
    .authorization(allow => [
      allow.authenticated().to(['create', 'read', 'update', 'delete']),
      allow.group('ADMIN').to(['read', 'create', 'update']),
    ]).disableOperations(['subscriptions']),

  businessOpeningHour: a.model({
    businessId: a.id().required(),
    regularOpeningHours: a.hasMany('businessRegularOpeningHour', 'businessOpeningHourId'),
    specialOpeningHours: a.hasMany('businessSpecialOpeningHour', 'businessOpeningHourId'),
    business: a.belongsTo('business', 'businessId'),
  })
    .identifier(['businessId'])
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.groups(['ADMIN', 'PROFESSIONAL']).to(['create', 'read', 'update', 'delete']),
    ]).disableOperations(['subscriptions']),

  businessRegularOpeningHour: a.model({
    id: a.id().required(),
    dayOfWeek: a.integer().required(),
    timeRange: a.customType({
      openingTime: a.string().required(),
      closingTime: a.string().required(),
    }),
    isClosed: a.boolean().required().default(false),
    is24Hours: a.boolean().required().default(false),
    businessOpeningHourId: a.id().required(),
    businessOpeningHour: a.belongsTo('businessOpeningHour', 'businessOpeningHourId'),
  })
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.groups(['ADMIN', 'PROFESSIONAL']).to(['create', 'read', 'update', 'delete']),
    ]).disableOperations(['subscriptions']),

  businessSpecialOpeningHour: a.model({
    id: a.id().required(),
    date: a.date().required(),
    timeRange: a.customType({
      openingTime: a.string().required(),
      closingTime: a.string().required(),
    }),
    isClosed: a.boolean().required().default(false),
    is24Hours: a.boolean().required().default(false),
    businessOpeningHourId: a.id().required(),
    businessOpeningHour: a.belongsTo('businessOpeningHour', 'businessOpeningHourId'),
  })
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.groups(['ADMIN', 'PROFESSIONAL']).to(['create', 'read', 'update', 'delete']),
    ]).disableOperations(['subscriptions']),

  reminder: a.model({
    id: a.id().required(),
    userId: a.id().required(),
    relatedItemRemindedId: a.id().required(),
    remindedItemType: a.enum(remindedItemType),
    title: a.string().required(),
    message: a.string().required(),
    dateTime: a.datetime().required(),
    status: a.enum(reminderStatus),
    repeat: a.enum(repeatType),
    // user: a.belongsTo('user', 'userId'),
  })
    .authorization(allow => [
      allow.owner().to(['read', 'create', 'update', 'delete']),
      allow.groups(['ADMIN', 'PROFESSIONAL']).to(['read', 'update', 'create', 'delete']),
    ]),

  invoice: a.model({
    id: a.id().required(),
    invoiceNumber: a.string().required(),
    patientId: a.id().required(),
    businessId: a.id().required(),
    invoiceSourceType: a.enum(invoiceSourceType),
    invoiceSourceId: a.id().required(),
    paymentMethodId: a.id().required(),
    subTotal: a.float().required(),
    discount: a.float().required(),
    deliveryFee: a.float().required().default(0),
    taxes: a.float().required(),
    totalAmount: a.float().required(),
    paymentTerms: a.enum(paymentTermsType),
    dueDate: a.datetime().required(),
    status: a.enum(invoiceStatus),
    documentUrl: a.string(),
    documentVersion: a.integer(),
    documentHistory: a.json().array(),
    patient: a.belongsTo('patient', 'patientId'),
    medicineOrder: a.belongsTo('medicineOrder', 'invoiceSourceId'),
    contract: a.belongsTo('contract', 'invoiceSourceId'),
    contractPayments: a.hasMany('contractPayment', 'invoiceId'),
    business: a.belongsTo('business', 'businessId'),
    transactions: a.hasMany('paymentTransaction', 'invoiceId'),
    paymentMethod: a.belongsTo('paymentMethod', 'paymentMethodId'),
  })
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.owner().to(['create', 'read', 'update']),
      allow.groups(['ADMIN', 'PROFESSIONAL']).to(['read', 'update']),
    ]).disableOperations(['subscriptions', 'delete']),

  paymentTransaction: a.model({
    id: a.id().required(),
    invoiceId: a.id().required(),
    paymentMethodId: a.id().required(),
    transactionID: a.string().required(),
    amount: a.float().required(),
    transactionDate: a.datetime().required(),
    status: a.enum(paymentTransactionStatus),
    notes: a.string(),
    invoice: a.belongsTo('invoice', 'invoiceId'),
    // paymentMethod: a.belongsTo('paymentMethod', 'paymentMethodId'),
  })
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.owner().to(['read', 'create', 'update']),
      allow.groups(['ADMIN', 'PROFESSIONAL']).to(['read']),
    ]).disableOperations(['subscriptions', 'delete']),

  paymentMethod: a.model({
    id: a.id().required(),
    patientId: a.id().required(),
    ownerName: a.string().required(),
    type: a.enum(paymentMethodType),
    paymentToken: a.string().required(), // Token or reference ID
    isDefault: a.boolean().required(),
    cardDetails: a.customType({
      cardBrand: a.enum(cardBrand),
      lastFourDigits: a.string().required(),
    }),
    mobileDetails: a.customType({
      mobileNumber: a.string().required(),
      mobileProviderName: a.enum(mobileProviderName),
    }),
    patient: a.belongsTo('patient', 'patientId'),
    invoices: a.hasMany('invoice', 'paymentMethodId'),
    contracts: a.hasMany('contract', 'paymentMethodId'),
    orders: a.hasMany('medicineOrder', 'paymentMethodId'),
  })
    .authorization(allow => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
      allow.groups(['ADMIN', 'PROFESSIONAL']).to(['read']),
    ]).disableOperations(['subscriptions', 'delete']),

  businessPerformanceSummary: a.model({
    id: a.id().required(),
    businessId: a.id().required(),
    timeGranularity: a.string().required(),
    periodStart: a.datetime().required(),
    periodEnd: a.datetime().required(),
    // --- Overall Financial Metrics --
    totalRevenue: a.float().required().default(0),
    medicineRevenue: a.float().required().default(0),
    serviceRevenue: a.float().required().default(0),
    deliveryRevenue: a.float().required().default(0),
    previousPeriodGrowth: a.float().required().default(0),
    // --- Medicine Sales Metrics --
    totalMedicineUnitsSold: a.integer().required().default(0),
    totalMedicineOrdersCount: a.integer().required().default(0),
    totalMedicineUnitsRefunded: a.integer().required().default(0),
    // --- Service Metrics --
    totalAppointmentsCompleted: a.integer().required().default(0),
    totalContractsSold: a.integer().required().default(0),
    totalContractsValue: a.float().required().default(0),
    averageServiceCancellationRate: a.float().required().default(0),
    totalAppointmentsRescheduled: a.integer().required().default(0),
    // --- Delivery Metrics --
    totalDeliveriesCompleted: a.integer().required().default(0),
    // --- Business Reputation --
    averageRating: a.float().required().default(0),
    reviewsCount: a.integer().required().default(0),
  })
    .identifier(['businessId', 'timeGranularity', 'periodStart', 'periodEnd'])
    .authorization(allow => [
      allow.groups(['ADMIN', 'PROFESSIONAL']).to(['read']),
    ]).disableOperations(['update', 'delete', 'subscriptions']),

  driverPerformanceSummary: a.model({
    id: a.id().required(),
    businessId: a.id().required(),
    driverId: a.id().required(),
    timeGranularity: a.string().required(),
    periodStart: a.datetime().required(),
    periodEnd: a.datetime().required(),
    previousPeriodGrowth: a.float().required().default(0),
    completedDeliveries: a.integer().required().default(0),
    totalDeliveryFeesGenerated: a.float().required().default(0),
    totalCommissionEarned: a.float().required().default(0),
    averageCommissionPerDelivery: a.float().required().default(0),
    averageDeliveryTimeMinutes: a.float().required().default(0),
    onTimeRatePercent: a.float().required().default(0),
    averageRating: a.float().required().default(0),
    reviewsCount: a.integer().required().default(0),
    totalDistanceKm: a.float().required().default(0),
  })
    .identifier(['businessId', 'driverId', 'timeGranularity', 'periodStart', 'periodEnd'])
    .authorization(allow => [
      allow.groups(['ADMIN', 'PROFESSIONAL']).to(['read']),
    ]).disableOperations(['update', 'delete', 'subscriptions']),

  medicineSalesSummary: a.model({
    id: a.id().required(),
    businessId: a.id().required(),
    pharmacyInventoryId: a.id().required(),
    timeGranularity: a.string().required(),
    periodStart: a.datetime().required(),
    periodEnd: a.datetime().required(),
    previousPeriodGrowth: a.float().required().default(0),
    totalRevenue: a.float().required().default(0),
    unitsSold: a.integer().required().default(0),
    ordersCount: a.integer().required().default(0),
    averageSellingPrice: a.float().required().default(0),
    unitsRefunded: a.integer().required().default(0),
  })
    .identifier(['businessId', 'pharmacyInventoryId', 'timeGranularity', 'periodStart', 'periodEnd'])
    .authorization(allow => [
      allow.groups(['ADMIN', 'PROFESSIONAL']).to(['read']),
    ]).disableOperations(['update', 'delete', 'subscriptions']),

  servicePerformanceSummary: a.model({
    id: a.id().required(),
    businessId: a.id().required(),
    businessServiceId: a.id().required(),
    timeGranularity: a.string().required(),
    periodStart: a.datetime().required(),
    periodEnd: a.datetime().required(),
    previousPeriodGrowth: a.float().required().default(0),
    totalRevenue: a.float().required().default(0),
    contractsSold: a.integer().required().default(0),
    appointmentsCompleted: a.integer().required().default(0),
    averageSessionDuration: a.float().required().default(0),
    averageRevenuePerContract: a.float().required().default(0),
    averageRevenuePerAppointment: a.float().required().default(0),
    cancellationRate: a.float().required().default(0),
    rescheduledAppointments: a.integer().required().default(0),
    totalContractsValue: a.float().required().default(0)
  })
    .identifier(['businessId', 'businessServiceId', 'timeGranularity', 'periodStart', 'periodEnd'])
    .authorization(allow => [
      allow.groups(['ADMIN', 'PROFESSIONAL']).to(['read']),
    ]).disableOperations(['update', 'delete', 'subscriptions'])
})
  .authorization((allow) => [
    allow.resource(postConfirmation),
    allow.resource(deliveryStreamWatcher),
    allow.resource(prescriptionStreamWatcher),
    allow.resource(medicineOrderStreamWatcher),
    allow.resource(invoiceStreamWatcher),
    allow.resource(contractStreamWatcher),
    allow.resource(appointmentStreamWatcher),
    allow.resource(generateDailySalesSummaries),
    allow.resource(generateMonthlySalesSummaries),
    allow.resource(deliveryAssignmentStreamWatcher),
  ]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});