export const ROLE_COLORS = {
  admin: {
    primary: "hsl(var(--primary))", // Purple
    name: "Admin",
  },
  corporate: {
    primary: "hsl(265, 95%, 42%)", // Deep indigo
    name: "Corporate",
  },
  branch: {
    primary: "hsl(280, 85%, 45%)", // Vivid purple
    name: "Branch",
  },
}

export const DASHBOARD_COLORS = (role: "admin" | "corporate" | "branch" = "admin") => ({
  primary: ROLE_COLORS[role].primary,
  primaryLight: `${ROLE_COLORS[role].primary}20`,
  primaryMuted: `${ROLE_COLORS[role].primary}50`,
  chart1: ROLE_COLORS[role].primary,
  chart2: "hsl(var(--chart-2))",
  chart3: "hsl(var(--chart-3))",
  chart4: "hsl(var(--chart-4))",
  border: "hsl(var(--border))",
  muted: "hsl(var(--muted))",
  mutedForeground: "hsl(var(--muted-foreground))",
  foreground: "hsl(var(--foreground))",
  background: "hsl(var(--background))",
})

export const getChartColor = (role: "admin" | "corporate" | "branch" = "admin", index: number) => {
  const colors = [ROLE_COLORS[role].primary, "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]
  return colors[index % colors.length]
}
