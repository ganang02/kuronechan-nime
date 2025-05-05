import TaskList from "@/components/task-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, Bell } from "lucide-react"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 page-transition">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-in-left">
          <div className="flex items-center">
            <div className="h-10 w-2 bg-primary rounded-full mr-3"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
              Tugas X.1
            </h1>
          </div>
          <div className="flex gap-2">
            <Link href="/enable-notifications">
              <Button variant="outline" className="flex items-center gap-2 group">
                <Bell className="h-4 w-4 group-hover:animate-bell text-primary" />
                Aktifkan Notifikasi
              </Button>
            </Link>
            <Link href="/add-task">
              <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
                <PlusCircle className="h-4 w-4" />
                Tambah Tugas
              </Button>
            </Link>
          </div>
        </div>

        <div className="animate-slide-in-right">
          <TaskList />
        </div>
      </div>
    </main>
  )
}
