export interface Task {
  id: string
  title: string
  subject: string
  description: string | null
  due_date: string
  created_at: string
  updated_at: string
  created_by?: string | null
  images?: TaskImage[]
}

export interface TaskImage {
  id: string
  task_id: string
  image_url: string
  created_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
  is_admin: boolean
}

export interface ScheduledNotification {
  id: string
  title: string
  body: string
  scheduledTime: number
}
