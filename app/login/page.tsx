import { LoginForm } from "@/components/login-form"
import { GraduationCapIcon } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCapIcon className="size-4" />
            </div>
            Destora-portal
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <GraduationCapIcon className="mx-auto size-16 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">
              JHS 3 Mock Results Portal
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}