import dayjs from "dayjs"
import { PaymentTermsType } from "../../helpers/types/schema"

export function createInvoiceDueDate(paymentTerms: PaymentTermsType) {
  const days = parseInt(paymentTerms.split('_')[1])

  const now = dayjs().utc()
  const dueDate = now.add(days, 'day').toDate()

  return dueDate
}