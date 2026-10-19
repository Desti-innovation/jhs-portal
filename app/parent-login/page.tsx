"use client"

import { useActionState } from "react"
import Link from "next/link"
import { parentLoginAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCapIcon, UsersIcon, ArrowLeftIcon } from "lucide-react"

export default function ParentLoginPage() {
  const [state, formAction, pending] = useActionState(parentLoginAction, null)

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* LEFT SIDE - FORM */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCapIcon className="size-4" />
            </div>
            Destora-portal
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Parent Portal</h1>
              <p className="text-sm text-muted-foreground">
                Enter your child's details to securely access their results.
              </p>
            </div>

            <form action={formAction} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">Child's First Name</Label>
                  <Input id="firstName" name="firstName" placeholder="Ama" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Child's Last Name</Label>
                  <Input id="lastName" name="lastName" placeholder="Owusu" required />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="dob">Child's Date of Birth</Label>
                <Input id="dob" name="dob" type="date" required />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="phone">Parent Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  type="tel" 
                  placeholder="e.g. 0244123456" 
                  required 
                />
              </div>

              {state?.error && (
                <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md font-medium">
                  {state.error}
                </div>
              )}

              <Button type="submit" className="w-full mt-2" disabled={pending}>
                {pending ? "Verifying Details..." : "View Results"}
              </Button>
            </form>

            <div className="text-center pt-4 border-t">
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeftIcon className="size-3" /> Back to Staff Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - ILLUSTRATION */}
      <div className="relative hidden bg-muted lg:block">
        <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
          <div className="text-center space-y-4 max-w-sm px-8">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10">
              <UsersIcon className="size-10 text-primary/60" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Secure Access
            </h2>
            <p className="text-sm text-muted-foreground">
              Your child's academic performance is protected. Only authorized parents and guardians can view these results.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}