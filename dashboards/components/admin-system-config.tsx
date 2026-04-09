"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Save, Smartphone, Settings, AlertTriangle } from "lucide-react"
import { DASHBOARD_COLORS } from "@/lib/colors"
import { getAppConfig, updateAppConfig, AppConfig } from "@/lib/api-client"

export function AdminSystemConfig() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<AppConfig | null>(null)
  const colors = DASHBOARD_COLORS("admin")

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await getAppConfig()
      setConfig(response.data)
    } catch (error) {
      console.error("Failed to fetch config:", error)
      toast.error("Failed to load system configuration")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    try {
      await updateAppConfig({
        min_android_build_number: config.min_android_build_number,
        min_ios_build_number: config.min_ios_build_number,
        force_update_title: config.force_update_title,
        force_update_message: config.force_update_message,
        is_under_maintenance: config.is_under_maintenance,
      })
      toast.success("Configuration updated successfully")
      fetchConfig() // Refresh data
    } catch (error) {
      console.error("Failed to update config:", error)
      toast.error("Failed to update configuration")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!config) return null

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">App Configuration</h2>
          <p className="text-muted-foreground">Manage remote settings for the Parchi Student App</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          style={{ backgroundColor: colors.primary }}
          className="text-white"
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Force Update Settings */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" style={{ color: colors.primary }} />
              <CardTitle>Version Control</CardTitle>
            </div>
            <CardDescription>
              Set the minimum required build numbers to trigger a force update in the mobile app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="android-build">Min Android Build Number</Label>
                <Input
                  id="android-build"
                  type="number"
                  value={config.min_android_build_number}
                  onChange={(e) => setConfig({ ...config, min_android_build_number: parseInt(e.target.value) })}
                  className="font-mono"
                />
                <p className="text-[10px] text-muted-foreground italic">Current version in production: +27</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ios-build">Min iOS Build Number</Label>
                <Input
                  id="ios-build"
                  type="number"
                  value={config.min_ios_build_number}
                  onChange={(e) => setConfig({ ...config, min_ios_build_number: parseInt(e.target.value) })}
                  className="font-mono"
                />
                <p className="text-[10px] text-muted-foreground italic">Current version in production: +27</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="update-title">Force Update Title</Label>
                <Input
                  id="update-title"
                  value={config.force_update_title}
                  onChange={(e) => setConfig({ ...config, force_update_title: e.target.value })}
                  placeholder="e.g. Time for an Upgrade! 🚀"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="update-message">Force Update Message</Label>
                <Textarea
                  id="update-message"
                  value={config.force_update_message}
                  onChange={(e) => setConfig({ ...config, force_update_message: e.target.value })}
                  placeholder="Tell users why they need to update..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Global Maintenance */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle>Global Maintenance</CardTitle>
            </div>
            <CardDescription>
              Instantly put the app into maintenance mode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-dashed">
              <div className="space-y-0.5">
                <Label className="text-base">Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">Blocks all user interaction in the app.</p>
              </div>
              <Switch
                checked={config.is_under_maintenance}
                onCheckedChange={(checked) => setConfig({ ...config, is_under_maintenance: checked })}
              />
            </div>
            {config.is_under_maintenance && (
              <div className="mt-4 p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-md text-sm flex items-start gap-2">
                <Settings className="h-4 w-4 mt-0.5 shrink-0" />
                <p>Warning: Enabling maintenance mode will block all students from using the app immediately.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="md:col-span-1">
          <CardHeader>
             <CardTitle className="text-sm font-medium">System Information</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2 text-muted-foreground">
            <div className="flex justify-between">
              <span>Configuration ID:</span>
              <span className="font-mono">{config.id.substring(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span>{new Date(config.updated_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Environment:</span>
              <span className="text-green-600 font-semibold px-1.5 py-0.5 bg-green-50 rounded">Production</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
