
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Loader2, Plus, Pencil, Trash2, Save, X, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getInstitutes, createInstitute, updateInstitute, deleteInstitute, Institute } from "@/lib/api-client"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface AdminInstitutesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AdminInstitutesDialog({ open, onOpenChange }: AdminInstitutesDialogProps) {
    const [institutes, setInstitutes] = useState<Institute[]>([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [isAdding, setIsAdding] = useState(false)
    const [newInstituteName, setNewInstituteName] = useState("")
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        if (open) {
            fetchInstitutes()
        } else {
            // Reset state when closed
            setIsAdding(false)
            setEditingId(null)
            setSearchQuery("")
        }
    }, [open])

    const fetchInstitutes = async () => {
        setLoading(true)
        try {
            const data = await getInstitutes()
            setInstitutes(data)
        } catch (error) {
            console.error("Failed to fetch institutes:", error)
            toast({
                title: "Error",
                description: "Failed to load institutes",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!newInstituteName.trim()) return

        setActionLoading(true)
        try {
            const newInst = await createInstitute(newInstituteName.trim())
            setInstitutes([...institutes, newInst])
            setNewInstituteName("")
            setIsAdding(false)
            toast({
                title: "Success",
                description: "Institute created successfully",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create institute",
                variant: "destructive",
            })
        } finally {
            setActionLoading(false)
        }
    }

    const handleUpdate = async (id: string, name: string, isActive: boolean) => {
        setActionLoading(true)
        try {
            const updatedDiff = await updateInstitute(id, name, isActive)
            setInstitutes(institutes.map(i => i.id === id ? updatedDiff : i))
            setEditingId(null)
            toast({
                title: "Success",
                description: "Institute updated successfully",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update institute",
                variant: "destructive",
            })
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        setActionLoading(true)
        try {
            await deleteInstitute(deleteId)
            setInstitutes(institutes.filter(i => i.id !== deleteId))
            setDeleteId(null)
            toast({
                title: "Success",
                description: "Institute deleted successfully",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete institute",
                variant: "destructive",
            })
        } finally {
            setActionLoading(false)
        }
    }

    const filteredInstitutes = institutes.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Manage Institutes</DialogTitle>
                        <DialogDescription>
                            Add, edit, or remove institutes available for student sign-up.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center justify-between gap-4 py-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search institutes..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
                            <Plus className="mr-2 h-4 w-4" /> Add Institute
                        </Button>
                    </div>

                    <div className="flex-1 overflow-auto border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="w-[100px]">Status</TableHead>
                                    <TableHead className="text-right w-[150px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isAdding && (
                                    <TableRow className="bg-muted/50">
                                        <TableCell>
                                            <Input
                                                value={newInstituteName}
                                                onChange={(e) => setNewInstituteName(e.target.value)}
                                                placeholder="Enter institute name"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleCreate()
                                                    if (e.key === 'Escape') setIsAdding(false)
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">Active</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleCreate} disabled={actionLoading || !newInstituteName.trim()}>
                                                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setIsAdding(false)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                            Loading institutes...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredInstitutes.length === 0 && !isAdding ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                            No institutes found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredInstitutes.map((inst) => (
                                        <TableRow key={inst.id}>
                                            <TableCell>
                                                {editingId === inst.id ? (
                                                    <Input
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="h-8"
                                                    />
                                                ) : (
                                                    <span className={!inst.isActive ? "text-muted-foreground line-through" : ""}>
                                                        {inst.name}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {editingId === inst.id ? (
                                                    // Implicitly active since we don't have a toggle in edit mode for simplicity UI-wise here, 
                                                    // or could rely on the backend keeping it same. 
                                                    // Let's assume edit is only for Name for now, or we can add a toggle.
                                                    // Actually let's add a switch for status if updating.
                                                    <div className="flex items-center gap-2">
                                                        {/* Keep status as is for now in edit mode or add a toggle if critical */}
                                                        <Badge variant={inst.isActive ? "default" : "secondary"}>
                                                            {inst.isActive ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </div>
                                                ) : (
                                                    <Badge variant={inst.isActive ? "default" : "secondary"}>
                                                        {inst.isActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {editingId === inst.id ? (
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleUpdate(inst.id, editName, inst.isActive)} disabled={actionLoading}>
                                                            <Save className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setEditingId(null)}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => {
                                                            setEditingId(inst.id)
                                                            setEditName(inst.name)
                                                        }}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setDeleteId(inst.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the institute. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={actionLoading}>
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
