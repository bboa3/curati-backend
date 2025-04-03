import dayjs from "dayjs"
import { ContractType, PaymentTermsType } from "./types/schema"

export function createInvoiceDueDate(paymentTerms: PaymentTermsType) {
  const days = parseInt(paymentTerms.split('_')[1])

  const now = dayjs().utc()
  const dueDate = now.add(days, 'day').toDate()

  return dueDate
}

export function createContractEndDate(date: Date, contractType: ContractType) {
  const dueDate = new Date(date)

  if (contractType === ContractType.MONTHLY) {
    dueDate.setMonth(dueDate.getMonth() + 1)
    return dueDate
  }

  if (contractType === ContractType.SEMI_ANNUALLY) {
    dueDate.setMonth(dueDate.getMonth() + 6)
    return dueDate
  }

  if (contractType === ContractType.ANNUALLY) {
    dueDate.setFullYear(dueDate.getFullYear() + 1)
    return dueDate
  }

  if (contractType === ContractType.ONE_TIME) {
    dueDate.setHours(dueDate.getHours() + 24)
    return dueDate
  }

  return undefined
}