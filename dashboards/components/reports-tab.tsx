"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, FileText, Download, Calendar } from "lucide-react"
import { toast } from "sonner"
import { getCorporateRedemptionReport } from "@/lib/api-client"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export function ReportsTab() {
    const [loading, setLoading] = useState(false)
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
        endDate: new Date().toISOString().split('T')[0] // Today
    })

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const generatePDF = async () => {
        if (!dateRange.startDate || !dateRange.endDate) {
            toast.error("Please select both start and end dates")
            return
        }

        setLoading(true)
        try {
            const start = new Date(dateRange.startDate)
            const end = new Date(dateRange.endDate)

            // End date should include the full day
            end.setHours(23, 59, 59, 999)

            const data = await getCorporateRedemptionReport(start, end)

            const doc = new jsPDF()
            const pageWidth = doc.internal.pageSize.width

            // --- HEADER ---
            doc.setFontSize(22)
            doc.setTextColor(40, 40, 40)
            doc.text("Redemption Report", 14, 20)

            doc.setFontSize(12)
            doc.setTextColor(100, 100, 100)
            doc.text(`${data.merchantDetails.businessName}`, 14, 28)

            doc.setFontSize(10)
            doc.text(`Period: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`, 14, 34)
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 39)

            // --- SUMMARY SECTION ---
            doc.setDrawColor(200, 200, 200)
            doc.line(14, 45, pageWidth - 14, 45)

            doc.setFontSize(14)
            doc.setTextColor(0, 0, 0)
            doc.text("Summary", 14, 55)

            const summaryData = [
                ["Total Redemptions", data.summary.totalRedemptions.toString()],
                ["Redemption Fee (Per Unit)", formatCurrency(data.merchantDetails.redemptionFee)],
                ["Total Payable Amount", formatCurrency(data.summary.totalPayable)]
            ]

            autoTable(doc, {
                startY: 60,
                head: [['Metric', 'Value']],
                body: summaryData,
                theme: 'plain',
                headStyles: { fillColor: [240, 240, 240], textColor: 50, fontStyle: 'bold' },
                styles: { fontSize: 10, cellPadding: 3 },
                columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 'auto', fontStyle: 'bold' } },
                margin: { left: 14 }
            })

            // --- BRANCH BREAKDOWN ---
            let finalY = (doc as any).lastAutoTable.finalY + 15

            doc.setFontSize(14)
            doc.text("Branch Breakdown", 14, finalY)

            const branchData = data.branchBreakdown.map((b: any) => [
                b.branchName,
                b.totalRedemptions,
                formatCurrency(b.totalPayable)
            ])

            autoTable(doc, {
                startY: finalY + 5,
                head: [['Branch', 'Redemptions', 'Payable']],
                body: branchData,
                theme: 'striped',
                headStyles: { fillColor: [50, 50, 50], textColor: 255 },
                styles: { fontSize: 9 },
                margin: { left: 14 }
            })

            // --- DETAILED LOGS ---
            finalY = (doc as any).lastAutoTable.finalY + 15

            // Check if we need a new page
            if (finalY > doc.internal.pageSize.height - 40) {
                doc.addPage()
                finalY = 20
            }

            doc.setFontSize(14)
            doc.text("Detailed Redemptions", 14, finalY)

            const detailedData = data.redemptions.map((r: any) => [
                new Date(r.date).toLocaleString(),
                r.branchName,
                r.offerTitle,
                r.studentInfo, // Email
                r.university || 'N/A'
            ])

            autoTable(doc, {
                startY: finalY + 5,
                head: [['Date', 'Branch', 'Offer', 'Student', 'University']],
                body: detailedData,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                styles: { fontSize: 8, cellPadding: 2 },
                columnStyles: {
                    0: { cellWidth: 35 },
                    1: { cellWidth: 30 },
                    2: { cellWidth: 40 },
                    3: { cellWidth: 45 },
                    4: { cellWidth: 'auto' }
                },
                margin: { left: 14 }
            })

            // Footer
            const pageCount = (doc as any).internal.getNumberOfPages()
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                doc.setFontSize(8)
                doc.setTextColor(150)
                doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.height - 10, { align: 'right' })
                doc.text("Generated by Parchi Business Dashboard", 14, doc.internal.pageSize.height - 10)
            }

            // Save
            doc.save(`Redemption_Report_${data.merchantDetails.businessName.replace(/\s+/g, '_')}_${dateRange.startDate}_to_${dateRange.endDate}.pdf`)
            toast.success("Report generated successfully")

        } catch (error) {
            console.error("Failed to generate report:", error)
            toast.error("Failed to generate report. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 p-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
                <p className="text-muted-foreground">Generate comprehensive reports for your business performance</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Redemption Report Card */}
                <Card className="md:col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Redemption Report
                        </CardTitle>
                        <CardDescription>
                            Detailed breakdown of offer redemptions, branch performance, and payable amounts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Report Period</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">From</Label>
                                    <Input
                                        type="date"
                                        value={dateRange.startDate}
                                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">To</Label>
                                    <Input
                                        type="date"
                                        value={dateRange.endDate}
                                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            onClick={generatePDF}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download PDF Report
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Placeholder for future reports */}
                <Card className="opacity-60">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Traffic Analytics
                        </CardTitle>
                        <CardDescription>
                            Visualize customer footfall trends and peak redemption times.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-32 flex items-center justify-center border-2 border-dashed rounded-md bg-muted/20">
                            <p className="text-sm text-muted-foreground">Coming Soon</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
