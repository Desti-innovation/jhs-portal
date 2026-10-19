"use client"

import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, 
  LineChart, Line, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function TeacherSubjectCharts({ 
  subjectName, 
  pieData = [], 
  barData = [],
  lineData = []
}: { 
  subjectName: string
  pieData?: { name: string, value: number, fill: string }[]
  barData?: { name: string, avgScore: number }[]
  lineData?: { name: string, avgScore: number }[]
}) {
  const hasData = pieData && pieData.length > 0 && pieData.some(d => d.value > 0)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 border-b">
        <CardTitle className="text-xl">{subjectName} Analytics</CardTitle>
        <CardDescription>Performance comparison across mocks.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {!hasData ? (
          <div className="text-center py-10 text-muted-foreground">
            No scores entered for this subject yet.
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* TOP ROW: Pie and Bar Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium mb-4 text-center">Scores Entered per Mock</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-4 text-center">Average Score per Mock</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <Tooltip 
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                      />
                      <Bar dataKey="avgScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* BOTTOM ROW: Line Chart */}
            <div>
              <h3 className="text-sm font-medium mb-4 text-center">Performance Trend (Average Score)</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgScore" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3} 
                      dot={{ r: 4 }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  )
}