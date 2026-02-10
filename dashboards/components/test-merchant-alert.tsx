import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

interface TestMerchantAlertProps {
    merchantName?: string
    className?: string
}

export function TestMerchantAlert({ merchantName, className }: TestMerchantAlertProps) {
    if (!merchantName) return null

    const name = merchantName.toLowerCase()
    const isTest = name === 'test merchant' || name === 'tester merchant'

    if (!isTest) return null

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant="destructive" className={`h-5 px-1.5 text-[10px] flex items-center gap-1 cursor-help ${className}`}>
                        TEST
                        <HelpCircle className="h-3 w-3" />
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Ye student side pe nahi dikhega</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
