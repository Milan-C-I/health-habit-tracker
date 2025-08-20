"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface BackButtonProps {
  href?: string
  label?: string
}

export function BackButton({ href, label = "Back" }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleBack} className="cursor-pointer bg-white text-black">
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  )
}
