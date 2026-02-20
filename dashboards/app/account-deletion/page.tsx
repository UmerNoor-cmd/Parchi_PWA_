"use client"

import Image from "next/image"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"

const formSchema = z.object({
    identifier: z.string().min(1, {
        message: "Email or Phone number is required.",
    }),
    reason: z.string().min(10, {
        message: "Please provide a reason (at least 10 characters).",
    }),
    confirm: z.boolean().refine((val) => val === true, {
        message: "You must acknowledge the deletion policy.",
    }),
})

export default function AccountDeletionPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            identifier: "",
            reason: "",
            confirm: false,
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        // Simulate API call
        console.log("Deletion Request Submitted:", values)

        setTimeout(() => {
            setIsSubmitting(false)
            toast.success("Request Submitted", {
                description: "Your account deletion request has been received. We will process it shortly.",
            })
            form.reset()
        }, 1500)
    }

    return (
        <div className="container max-w-2xl mx-auto py-10 px-4">
            <div className="mb-8 text-center">
                <Link href="/" className="inline-flex items-center justify-center mb-6">
                    <Image
                        src="/ParchiFullTextNewBlue.svg"
                        alt="Parchi Logo"
                        width={120}
                        height={120}
                        className="object-contain"
                        priority
                    />
                </Link>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Account Deletion Request</h1>
                <p className="text-muted-foreground">
                    We're sorry to see you go. Please fill out the form below to request account deletion.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Deletion Request Form</CardTitle>
                    <CardDescription>
                        This action generates a request to permanently delete your account and remove your data from our servers.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="identifier"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email or Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your registered email or phone" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            The account associated with this identifier will be slated for deletion.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reason for leaving</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Please tell us why you are deleting your account..."
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirm"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                I understand the consequences
                                            </FormLabel>
                                            <FormDescription>
                                                I acknowledge that this action is irreversible once processed. My data will be permanently removed in accordance with the privacy policy.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Submitting Request..." : "Submit Deletion Request"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>
                    Need help? <Link href="/contact" className="underline underline-offset-4 hover:text-primary">Contact Support</Link>
                </p>
            </div>
        </div>
    )
}
