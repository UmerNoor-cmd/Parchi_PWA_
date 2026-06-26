"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, RefreshCw, Check, X } from "lucide-react"
import type { useSelfieChangeRequests } from "@/hooks/use-selfie-change-requests"

type SelfieChangeRequestsState = ReturnType<typeof useSelfieChangeRequests>

export function AdminSelfieChanges({
  requests,
  loading,
  error,
  resolvingId,
  refetch,
  resolve,
}: SelfieChangeRequestsState) {
  const [notes, setNotes] = useState<Record<string, string>>({})

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Selfie Change Requests</CardTitle>
            <CardDescription>Review proposed verification selfie updates from students.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">{error}</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No pending selfie change requests.</div>
        ) : (
          <div className="grid gap-6">
            {requests.map((req) => (
              <div key={req.id} className="rounded-2xl border p-6 space-y-4 bg-white dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-lg">{req.student.firstName} {req.student.lastName}</h3>
                    <p className="text-sm text-muted-foreground">{req.student.university} · {req.student.parchiId}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Submitted {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest">Current Selfie</Label>
                    <div className="aspect-square max-w-[200px] rounded-xl border overflow-hidden bg-muted">
                      {req.student.verificationSelfie ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={req.student.verificationSelfie} alt="Current selfie" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No selfie</div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest">Proposed Selfie</Label>
                    <div className="aspect-square max-w-[200px] rounded-xl border overflow-hidden bg-muted ring-2 ring-blue-500/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={req.newSelfiePath} alt="Proposed selfie" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest">ID Card (for reference)</Label>
                  {req.student.idCardFrontPath ? (
                    <div className="max-w-[320px] rounded-xl border overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={req.student.idCardFrontPath} alt="ID card front" className="w-full object-contain" />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">ID card unavailable (student approved before KYC preservation).</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`note-${req.id}`}>Admin Note (optional)</Label>
                  <Textarea
                    id={`note-${req.id}`}
                    placeholder="Reason for rejection or internal note..."
                    value={notes[req.id] || ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [req.id]: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    disabled={resolvingId === req.id}
                    onClick={() => resolve(req.id, "approve", notes[req.id])}
                  >
                    {resolvingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={resolvingId === req.id}
                    onClick={() => resolve(req.id, "reject", notes[req.id])}
                  >
                    {resolvingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
