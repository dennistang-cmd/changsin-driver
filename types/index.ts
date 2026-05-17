export type JobStatus =
  | 'pending'
  | 'assigned'
  | 'ongoing'
  | 'waiting_verify'
  | 'verified'
  | 'completed'
  | 'pending_parts'
  | 'warranty_claim'
  | 'product_defect'
  | 'need_revisit'
  | 'customer_no_show'

export type WorkResult =
  | 'completed'
  | 'pending_parts'
  | 'product_defect'
  | 'warranty_claim'
  | 'need_revisit'
  | 'customer_no_show'

export type UserRole = 'driver' | 'installer' | 'technician' | 'secretary' | 'boss' | 'sales_assistant'

export type JobType = string

export type CommissionType = 'fixed' | 'percentage'

export type VerifyStatus = 'pending' | 'verified' | 'rejected'

export interface TimelineEvent {
  id: string
  label: string
  timestamp: string
  actor?: string
}

export interface JobPhotos {
  before?: string
  after?: string
  problem?: string
  warranty?: string
}

export interface Job {
  id: string
  jobNumber: string
  type: JobType
  customer: {
    name: string
    phone: string
    address: string
  }
  product: string
  assignedStaff?: string[]
  status: JobStatus
  workResult?: WorkResult
  remarks?: string
  photos: JobPhotos
  timeline: TimelineEvent[]
  createdAt: string
  verifyStatus: VerifyStatus
  warrantyActive?: boolean
  commissionAmount?: number
}

export interface Staff {
  id: string
  name: string
  phone: string
  role: UserRole
  loginId: string
  isActive: boolean
  commissionType: CommissionType
  commissionAmount: number
  lastActive?: string
}

export interface CommissionSetting {
  jobType: JobType
  type: CommissionType
  amount: number
}
