import { Schema } from "../../../data/resource";

type ComparisonOperator =
  | 'eq'           // Equal
  | 'ne'           // Not Equal
  | 'le'           // Less Than or Equal
  | 'lt'           // Less Than
  | 'ge'           // Greater Than or Equal
  | 'gt'           // Greater Than
  | 'contains'     // Contains
  | 'not_contains' // Does Not Contain
  | 'begins_with'  // Begins With
  | 'between'      // Between
  | 'in';          // In

type FieldCondition = { [operator in ComparisonOperator]?: any };

interface FieldFilterCondition {
  [field: string]: FieldCondition | undefined;
}

interface LogicFilterCondition {
  and?: FilterCondition[];
  or?: FilterCondition[];
  not?: FilterCondition;
}

type FilterCondition = FieldFilterCondition | LogicFilterCondition;

export interface ListOptions {
  filter?: FilterCondition;
  limit?: number;
  nextToken?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export enum MediaFromType {
  ARTICLE = 'ARTICLE',
  CONTENT_BLOCK = 'CONTENT_BLOCK'
}

export enum AmbulanceStatus {
  AVAILABLE = 'AVAILABLE',
  ON_TRIP = 'ON_TRIP',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export enum SleepQuality {
  POOR = 'POOR',
  AVERAGE = 'AVERAGE',
  GOOD = 'GOOD',
  EXCELLENT = 'EXCELLENT'
}

export enum PhysicalActivityLevel {
  SEDENTARY = 'SEDENTARY',
  LIGHT = 'LIGHT',
  MODERATE = 'MODERATE',
  ACTIVE = 'ACTIVE',
  VERY_ACTIVE = 'VERY_ACTIVE'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN'
}

export enum LikedItemType {
  ARTICLE = 'ARTICLE',
  MEDICINE = 'MEDICINE'
}

export enum ViewedItemType {
  ARTICLE = 'ARTICLE',
  MEDICINE = 'MEDICINE'
}

export enum RatedItemType {
  BUSINESS = 'BUSINESS',
  PROFESSIONAL = 'PROFESSIONAL',
  MEDICINE = 'MEDICINE',
  BUSINESSSERVICE = 'BUSINESSSERVICE'
}

export enum CertifiedItemType {
  PROFESSIONAL = 'PROFESSIONAL',
  BUSINESS = 'BUSINESS'
}

export enum LicensedItemType {
  PROFESSIONAL = 'PROFESSIONAL',
  BUSINESS = 'BUSINESS'
}

export enum InsuranceItemType {
  PROFESSIONAL = 'PROFESSIONAL',
  BUSINESS = 'BUSINESS',
  PATIENT = 'PATIENT'
}

export enum DeliveryStatus {
  PENDING = 'PENDING',
  PHARMACY_PREPARING = 'PHARMACY_PREPARING',
  AWAITING_DRIVER_ASSIGNMENT = 'AWAITING_DRIVER_ASSIGNMENT',
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',
  PICKED_UP_BY_DRIVER = 'PICKED_UP_BY_DRIVER',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  AWAITING_PATIENT_PICKUP = 'AWAITING_PATIENT_PICKUP',
  PICKED_UP_BY_PATIENT = 'PICKED_UP_BY_PATIENT',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export enum DeliveryAssignmentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED'
}

export enum DeliveryStatusHistoryActorType {
  SYSTEM = 'SYSTEM',
  PATIENT = 'PATIENT',
  DRIVER = 'DRIVER',
  PHARMACIST = 'PHARMACIST',
  ADMIN = 'ADMIN'
}

export enum DeliveryType {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY'
}

export enum MedicineOrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PHARMACY_REVIEW = 'PHARMACY_REVIEW',
  PROCESSING = 'PROCESSING',
  READY_FOR_DISPATCH = 'READY_FOR_DISPATCH',
  DISPATCHED = 'DISPATCHED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED'
}

export enum PrescriptionLevel {
  GENERAL_AGENT = 0, // General Agent
  COMMUNITY_HEALTH_AGENT = 1, // General Community Health Agents
  GENERAL_MEDICAL_TECHNICIAN = 2, // General Medical Technicians and higher categories
  GENERAL_PRACTITIONER = 3, // General Practitioners and higher categories
  SPECIALIST = 4,  // Specialists
}

export enum NotificationType {
  GENERAL = 'GENERAL',
  PERSONAL = 'PERSONAL',
  PROMOTIONAL = 'PROMOTIONAL',
  UPDATE = 'UPDATE'
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  READ = 'READ'
}

export enum NotificationChannelType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP'
}

export enum NotificationTemplateKey {
  // ========== Appointments ==========
  APPOINTMENT_CONFIRMATION_REQUIRED = 'APPOINTMENT_CONFIRMATION_REQUIRED',
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
  APPOINTMENT_RESCHEDULE_REQUIRED = 'APPOINTMENT_RESCHEDULE_REQUIRED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  APPOINTMENT_JOIN_READY = 'APPOINTMENT_JOIN_READY',

  // ========== Prescriptions ==========
  PRESCRIPTION_VALIDATION_REQUIRED = 'PRESCRIPTION_VALIDATION_REQUIRED',
  PRESCRIPTION_STATUS_UPDATED = 'PRESCRIPTION_STATUS_UPDATED',
  PRESCRIPTION_EXPIRY_WARNING = 'PRESCRIPTION_EXPIRY_WARNING',

  // ========== Medications ==========
  MEDICATION_DOSE_REMINDER = 'MEDICATION_DOSE_REMINDER',
  MEDICATION_STOCK_WARNING = 'MEDICATION_STOCK_WARNING',

  // ========== Deliveries ==========
  DELIVERY_ASSIGNMENT_AVAILABLE = 'DELIVERY_ASSIGNMENT_AVAILABLE',
  DELIVERY_DRIVER_ASSIGNED = 'DELIVERY_DRIVER_ASSIGNED',
  DELIVERY_STATUS_PATIENT_UPDATE = 'DELIVERY_STATUS_PATIENT_UPDATE',
  DELIVERY_TASK_DRIVER_UPDATE = 'DELIVERY_TASK_DRIVER_UPDATE',
  DELIVERY_EVENT_ADMIN_ALERT = 'DELIVERY_EVENT_ADMIN_ALERT',

  // ========== Medicine Orders ==========
  MEDICINE_ORDER_CREATED = 'MEDICINE_ORDER_CREATED',

  // ============ Invoice ============
  INVOICE_CREATED = 'INVOICE_CREATED',
  INVOICE_STATUS_UPDATED = 'INVOICE_STATUS_UPDATED',

  // ========== Contracts ==========
  CONTRACT_STATUS_PATIENT_UPDATE = 'CONTRACT_STATUS_PATIENT_UPDATE',
  CONTRACT_STATUS_PROFESSIONAL_UPDATE = 'CONTRACT_STATUS_PROFESSIONAL_UPDATE',
  CONTRACT_CONFIRMATION_EXPIRED = 'CONTRACT_CONFIRMATION_EXPIRED',
  CONTRACT_EXPIRY_WARNING = 'CONTRACT_EXPIRY_WARNING',

  // ========== Health Monitoring ==========
  HEALTH_CHECKIN_REMINDER = 'HEALTH_CHECKIN_REMINDER',
  HEALTH_METRIC_ALERT = 'HEALTH_METRIC_ALERT',
  PREVENTIVE_CARE_ALERT = 'PREVENTIVE_CARE_ALERT',

  // ========== User Account ==========
  USER_WELCOME = 'USER_WELCOME',
  USER_ACCOUNT_SECURITY_ALERT = 'USER_ACCOUNT_SECURITY_ALERT',

  // ========== Payments ==========
  PAYMENT_RECEIVED_PHARMACY = 'PAYMENT_RECEIVED_PHARMACY',
  PAYMENT_RECEIVED_PROFESSIONAL = 'PAYMENT_RECEIVED_PROFESSIONAL',
  PAYMENT_FAILED = 'PAYMENT_FAILED',

  // ========== Content & Promotions ==========
  CONTENT_ARTICLE_PUBLISHED = 'CONTENT_ARTICLE_PUBLISHED',
  PROMOTION_SERVICE_LAUNCH = 'PROMOTION_SERVICE_LAUNCH',
  PROMOTION_VACCINATION_CAMPAIGN = 'PROMOTION_VACCINATION_CAMPAIGN',
  PROMOTION_COMMUNITY_EVENT = 'PROMOTION_COMMUNITY_EVENT',
  WELLNESS_TIP = 'WELLNESS_TIP'
}

export enum NotificationRelatedItemType {
  ORDER = 'ORDER',
  PRESCRIPTION = 'PRESCRIPTION',
  APPOINTMENT = 'APPOINTMENT',
  ARTICLE = 'ARTICLE',
  MEDICINE = 'MEDICINE',
  CONTRACT = 'CONTRACT',
  OTHER = 'OTHER'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum RemindedItemType {
  APPOINTMENT = 'APPOINTMENT',
  MEDICATION = 'MEDICATION',
  DELIVERY = 'DELIVERY',
  MEDICINE_ORDER = 'MEDICINE_ORDER'
}

export enum ReminderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

export enum RepeatType {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  CUSTOM = 'CUSTOM'
}

export enum ContractType {
  ONE_TIME = 'ONE_TIME',
  MONTHLY = 'MONTHLY',
  ANNUALLY = 'ANNUALLY'
}

export enum ContractStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
  REJECTED = 'REJECTED',
}

export enum ContractTerminatedBy {
  PATIENT = 'PATIENT',
  BUSINESS = 'BUSINESS',
  SYSTEM = 'SYSTEM',
  UNTERMINATED = 'UNTERMINATED'
}

export enum Language {
  PORTUGUESE = 'PORTUGUESE',
  ENGLISH = 'ENGLISH',
  TSONGA = 'TSONGA',
  CHANGANA = 'CHANGANA',
  MAKHUWA = 'MAKHUWA',
  SENA = 'SENA',
  NDAU = 'NDAU'
}

export enum RecurrenceType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  NONE = 'NONE'
}

export enum ServiceFeasibility {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum CardBrand {
  MASTERCARD = 'MASTERCARD',
  VISA = 'VISA'
}

export enum MobileProviderName {
  M_PESA = 'M_PESA',
  E_MOLA = 'E_MOLA',
  M_KESH = 'M_KESH'
}

export enum PaymentMethodType {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  MOBILE_PAYMENT = 'MOBILE_PAYMENT'
}

export enum PaymentTermsType {
  NET_1 = 'NET_1',
  NET_7 = 'NET_7',
  NET_30 = 'NET_30'
}

export enum InvoiceStatus {
  AWAITING_PATIENT_REVIEW = 'AWAITING_PATIENT_REVIEW',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  FAILED = 'FAILED',
  OVERDUE = 'OVERDUE'
}

export enum InvoiceSourceType {
  MEDICINE_ORDER = 'MEDICINE_ORDER',
  CONTRACT = 'CONTRACT'
}

export enum PaymentTransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PricingCondition {
  // Base Price
  STANDARD = 'STANDARD',
  MONTHLY_SUBSCRIPTION = 'MONTHLY_SUBSCRIPTION',
  ANNUAL_SUBSCRIPTION = 'ANNUAL_SUBSCRIPTION',

  // Additional Charges
  EMERGENCY_SURCHARGE = 'EMERGENCY_SURCHARGE',
  COMPLEXITY_FEE = 'COMPLEXITY_FEE',
  AFTER_HOURS_FEE = 'AFTER_HOURS_FEE',
  WEEKEND_FEE = 'WEEKEND_FEE',
  SPECIAL_EQUIPMENT_FEE = 'SPECIAL_EQUIPMENT_FEE',

  // Discounts
  PROMOTIONAL_DISCOUNT = 'PROMOTIONAL_DISCOUNT',
  CANCELLATION_FEE = 'CANCELLATION_FEE'
}

export enum FeeType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE'
}

export enum CalculationType {
  ADDITIVE = 'ADDITIVE',
  MULTIPLICATIVE = 'MULTIPLICATIVE'
}

export enum AddressType {
  HOME = 'HOME',
  WORK = 'WORK',
  PHARMACY = 'PHARMACY',
  HOSPITAL = 'HOSPITAL',
  COURIER = 'COURIER',
  SHIPPING = 'SHIPPING',
  BILLING = 'BILLING'
}

export enum AddressOwnerType {
  PATIENT = 'PATIENT',
  PROFESSIONAL = 'PROFESSIONAL',
  BUSINESS = 'BUSINESS',
  DELIVERY = 'DELIVERY'
}

export enum ConsultationType {
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  TEXT = 'TEXT',
  IN_PERSON = 'IN_PERSON'
}

export enum Outcome {
  NOT_COMPLETED = 'NOT_COMPLETED',
  SUCCESSFUL = 'SUCCESSFUL',
  FOLLOW_UP_REQUIRED = 'FOLLOW_UP_REQUIRED',
  REFERRAL_REQUIRED = 'REFERRAL_REQUIRED'
}

export enum PrescriptionStatus {
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPENSED = 'DISPENSED'
}

export enum PrescriptionType {
  INPATIENT = 'INPATIENT',
  OUTPATIENT = 'OUTPATIENT'
}

export enum AppointmentStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESCHEDULED = 'RESCHEDULED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED'
}

export enum AppointmentType {
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  TEXT = 'TEXT',
  IN_PERSON = 'IN_PERSON'
}

export enum AppointmentParticipantType {
  PATIENT = 'PATIENT',
  PROFESSIONAL = 'PROFESSIONAL'
}

export enum LicenseStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED'
}

export enum ProfessionalAvailabilityStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  ON_BREAK = 'ON_BREAK',
  BUSY = 'BUSY'
}

export enum BusinessType {
  PHARMACY = 'PHARMACY',
  HOSPITAL = 'HOSPITAL',
  DELIVERY = 'DELIVERY',
  LABORATORY = 'LABORATORY'
}

export enum PublicationStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export enum ArticleCategory {
  HEALTH_AND_WELLNESS = "HEALTH_AND_WELLNESS",
  NUTRITION = "NUTRITION",
  FITNESS = "FITNESS",
  MENTAL_HEALTH = "MENTAL_HEALTH",
  MEDICAL_RESEARCH = "MEDICAL_RESEARCH",
  HEALTHCARE_POLICY = "HEALTHCARE_POLICY",
  PATIENT_STORIES = "PATIENT_STORIES",
  MEDICINE = "MEDICINE",
  PREVENTION = "PREVENTION",
  LIFESTYLE = "LIFESTYLE",
}

export enum MedicationRecordType {
  MEDICATION = 'MEDICATION',
  VACCINATION = 'VACCINATION',
  OTHER = 'OTHER'
}

export enum MedicationRecordStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPENSED = 'DISPENSED',
  PENDING_VALIDATION = 'PENDING_VALIDATION'
}

export enum MedicationFrequencyType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  AS_NEEDED = 'AS_NEEDED'
}

export enum ProfessionalType {
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  PHARMACIST = 'PHARMACIST',
  DRIVER = 'DRIVER'
}

export enum VehicleType {
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
  BICYCLE = 'BICYCLE',
  TRUCK = 'TRUCK'
}

export enum ProfessionalRole {
  MANAGER = 'MANAGER',
  ASSISTANT = 'ASSISTANT',
  STAFF = 'STAFF',
  INTERN = 'INTERN',
  OWNER = 'OWNER'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  PROFESSIONAL = 'PROFESSIONAL',
  PATIENT = 'PATIENT'
}

export enum SalesSummaryTimeGranularity {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export interface ProfessionalSearchBody {
  professionalRegistrationNumber: string;
  phone: string;
  email: string;
  name: string;
  legalName: string;
  bio?: string;
  specialties: string[];
  image: string;
  languagesSpoken: string[];
}

export interface ArticleSearchBody {
  categories: string[],
  title: string,
  author: string,
  slug: string,
  excerpt?: string,
  tags: string[],
  image: string
};

export interface MedicineSearchBody {
  name: string
  brand: string
  description?: string
  composition: string
  administrationRoute: string
  image: string
  packaging: string
  indications: string
  storageConditions: string
}

export interface ServiceSearchBody {
  name: string;
  description: string;
  keywords: string[];
  requiredEquipment?: string;
  treatmentTechniques?: string;
  conditionsTreated: string[];
  image: string;
}

export interface BusinessSearchBody {
  name: string
  email: string
  phone: string
  uniqueTaxIdentificationNumber: string
  description: string
  image: string;
}

type UserSchema = Schema['user']['type'];
export interface User extends UserSchema {
  role: UserRole
};

type PatientSchema = Schema['patient']['type'];
export interface Patient extends PatientSchema {
  gender: Gender
  preferredLanguage: Language
};

type InsuranceSchema = Schema['insurance']['type'];
export interface Insurance extends InsuranceSchema {
  insuranceItemType: InsuranceItemType
};

type PatientHealthStatusSchema = Schema['patientHealthStatus']['type'];
export interface PatientHealthStatus extends PatientHealthStatusSchema {
  sleepQuality: SleepQuality
  physicalActivityLevel: PhysicalActivityLevel
};

type HeartRateRecordSchema = Schema['heartRateRecord']['type'];
export interface HeartRateRecord extends HeartRateRecordSchema { };

type BloodSugarRecordSchema = Schema['bloodSugarRecord']['type'];
export interface BloodSugarRecord extends BloodSugarRecordSchema { };

type PrescriptionSchema = Schema['prescription']['type'];
export interface Prescription extends PrescriptionSchema {
  status: PrescriptionStatus
  type: PrescriptionType
};

type PrescriptionItemSchema = Schema['prescriptionItem']['type'];

export interface MedicationFrequency {
  type: MedicationFrequencyType
  daysOfWeek?: number[]
  daysOfMonth?: number[]
  specificTimes?: string[]
}

export interface PrescriptionItem extends PrescriptionItemSchema {
  frequency: MedicationFrequency
};

type MedicationRecordSchema = Schema['medicationRecord']['type'];
export interface MedicationRecord extends MedicationRecordSchema {
  recordType: MedicationRecordType
  status: MedicationRecordStatus
  frequency: MedicationFrequency
};

type MedicineOrderSchema = Schema['medicineOrder']['type'];
export interface MedicineOrder extends MedicineOrderSchema {
  status: MedicineOrderStatus
};

type MedicineOrderItemSchema = Schema['medicineOrderItem']['type'];
export interface MedicineOrderItem extends MedicineOrderItemSchema { };


type ContractSchema = Schema['contract']['type'];
export interface Contract extends ContractSchema {
  type: ContractType
  status: ContractStatus
  contractTerminatedBy: ContractTerminatedBy
};

type ContractPaymentSchema = Schema['contractPayment']['type'];
export interface ContractPayment extends ContractPaymentSchema { };

type ServiceSchema = Schema['service']['type'];
export interface Service extends ServiceSchema {
  professionalType: ProfessionalType
  businessType: BusinessType
  serviceFeasibility: ServiceFeasibility
  publicationStatus: PublicationStatus
};

type BusinessServiceSchema = Schema['businessService']['type'];

interface BusinessServiceRequirements {
  image: string
}

export interface BusinessService extends BusinessServiceSchema, BusinessServiceRequirements {
  professionalType: ProfessionalType
  businessType: BusinessType
  publicationStatus: PublicationStatus
};

type BusinessServicePricingSchema = Schema['businessServicePricing']['type'];
export interface BusinessServicePricing extends BusinessServicePricingSchema {
  condition: PricingCondition
  feeType: FeeType
  calculationType: CalculationType
};

type AppointmentSchema = Schema['appointment']['type'];
export interface Appointment extends AppointmentSchema {
  status: AppointmentStatus
  type: AppointmentType
  requesterType: AppointmentParticipantType
  starterType: AppointmentParticipantType
};

type ConsultationRecordSchema = Schema['consultationRecord']['type'];
export interface ConsultationRecord extends ConsultationRecordSchema {
  type: ConsultationType
  outcome: Outcome
};

type ArticleSchema = Schema['article']['type'];
export interface Article extends ArticleSchema {
  publicationStatus: PublicationStatus
};

type ContentBlockSchema = Schema['contentBlock']['type'];
export interface ContentBlock extends ContentBlockSchema { };

type MediaSchema = Schema['media']['type'];
export interface Media extends MediaSchema {
  type: MediaType
};

type BusinessSchema = Schema['business']['type'];
export interface Business extends BusinessSchema {
  type: BusinessType
  publicationStatus: PublicationStatus
};

type ProfessionalSchema = Schema['professional']['type'];
export interface Professional extends ProfessionalSchema {
  gender: Gender
  type: ProfessionalType
  role: ProfessionalRole
  publicationStatus: PublicationStatus
};

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

type ProfessionalAvailabilitySchema = Schema['professionalAvailability']['type'];
export interface ProfessionalAvailability extends ProfessionalAvailabilitySchema {
  timeSlots: TimeSlot[];
  currentAvailabilityStatus: ProfessionalAvailabilityStatus;
  professionalType: ProfessionalType;
};

type RecurrencePatternSchema = Schema['recurrencePattern']['type'];
export interface RecurrencePattern extends RecurrencePatternSchema {
  recurrenceType: RecurrenceType
};

type DriverCurrentLocationSchema = Schema['driverCurrentLocation']['type'];
export interface DriverCurrentLocation extends DriverCurrentLocationSchema { };

type VehicleSchema = Schema['vehicle']['type'];
export interface Vehicle extends VehicleSchema {
  type: VehicleType
};

type DeliverySchema = Schema['delivery']['type'];
export interface Delivery extends DeliverySchema {
  status: DeliveryStatus
  type: DeliveryType
};

type DeliveryStatusHistorySchema = Schema['deliveryStatusHistory']['type'];
export interface DeliveryStatusHistory extends DeliveryStatusHistorySchema {
  status: DeliveryStatus;
  actorType: DeliveryStatusHistoryActorType;
};

type DeliveryAssignmentSchema = Schema['deliveryAssignment']['type'];
export interface DeliveryAssignment extends DeliveryAssignmentSchema {
  status: DeliveryAssignmentStatus
}

type MedicineCategorySchema = Schema['medicineCategory']['type'];
export interface MedicineCategory extends MedicineCategorySchema {
  prescriptionLevel: PrescriptionLevel
};

type MedicineSchema = Schema['medicine']['type'];
export interface Medicine extends MedicineSchema {
  prescriptionLevel: PrescriptionLevel
  publicationStatus: PublicationStatus
};

type PharmacyInventorySchema = Schema['pharmacyInventory']['type'];
export interface PharmacyInventory extends PharmacyInventorySchema {
  publicationStatus: PublicationStatus
};
export interface Inventory extends PharmacyInventory, Medicine { }

type BusinessOpeningHourSchema = Schema['businessOpeningHour']['type'];
export interface BusinessOpeningHour extends BusinessOpeningHourSchema { };

export interface TimeRange {
  openingTime: string
  closingTime: string
}

type BusinessRegularOpeningHourSchema = Schema['businessRegularOpeningHour']['type'];
export interface BusinessRegularOpeningHour extends BusinessRegularOpeningHourSchema {
  timeRange: TimeRange
};

type BusinessSpecialOpeningHourSchema = Schema['businessSpecialOpeningHour']['type'];
export interface BusinessSpecialOpeningHour extends BusinessSpecialOpeningHourSchema {
  timeRange: TimeRange
};

type LikeSchema = Schema['like']['type'];
export interface Like extends LikeSchema {
  likedItemType: LikedItemType
};

type ViewSchema = Schema['view']['type'];
export interface View extends ViewSchema {
  viewedItemType: ViewedItemType
};

type RatingSchema = Schema['rating']['type'];
export interface Rating extends RatingSchema {
  ratedType: RatedItemType
};

type ReminderSchema = Schema['reminder']['type'];
export interface Reminder extends ReminderSchema {
  remindedItemType: RemindedItemType
  status: ReminderStatus
  repeat: RepeatType
};

export interface NotificationPayload {
  href?: string;
  actionData?: any
}

export interface NotificationChannel {
  type: NotificationChannelType;
  targets: string[]
}

type NotificationSchema = Schema['notification']['type'];
export interface Notification extends NotificationSchema {
  status: NotificationStatus;
  type: NotificationType;
  channels: NotificationChannel[];
  priority: Priority;
  payload: NotificationPayload;
  relatedItemType: NotificationRelatedItemType;
};

type AddressSchema = Schema['address']['type'];
export interface Address extends AddressSchema {
  type: AddressType;
  addressOwnerType: AddressOwnerType;
};

type CertificationSchema = Schema['certification']['type'];
export interface Certification extends CertificationSchema { };

type LicenseSchema = Schema['license']['type'];
export interface License extends LicenseSchema {
  status: LicenseStatus
  licensedItemType: LicensedItemType
};

type PaymentMethodSchema = Schema['paymentMethod']['type'];
export interface PaymentMethod extends PaymentMethodSchema {
  type: PaymentMethodType;
  cardDetails: {
    cardBrand: CardBrand;
    lastFourDigits: string;
  };
  mobileDetails: {
    mobileNumber: string;
    mobileProviderName: MobileProviderName;
  }
};

type InvoiceSchema = Schema['invoice']['type'];
export interface Invoice extends InvoiceSchema {
  invoiceSourceType: InvoiceSourceType;
  paymentTerms: PaymentTermsType;
  status: InvoiceStatus;
};

type PaymentTransactionSchema = Schema['paymentTransaction']['type'];
export interface PaymentTransaction extends PaymentTransactionSchema {
  status: PaymentTransactionStatus;
};

type BusinessPerformanceSummarySchema = Schema['businessPerformanceSummary']['type'];
export interface BusinessPerformanceSummary extends BusinessPerformanceSummarySchema {
  timeGranularity: SalesSummaryTimeGranularity;
};

type DriverPerformanceSummarySchema = Schema['driverPerformanceSummary']['type'];
export interface DriverPerformanceSummary extends DriverPerformanceSummarySchema {
  timeGranularity: SalesSummaryTimeGranularity;
};

type MedicineSalesSummarySchema = Schema['medicineSalesSummary']['type'];
export interface MedicineSalesSummary extends MedicineSalesSummarySchema {
  timeGranularity: SalesSummaryTimeGranularity;
};

type ServicePerformanceSummarySchema = Schema['servicePerformanceSummary']['type'];
export interface ServicePerformanceSummary extends ServicePerformanceSummarySchema {
  timeGranularity: SalesSummaryTimeGranularity;
};

export interface Secrets {
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsRegion: string;
}