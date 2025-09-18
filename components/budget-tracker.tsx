"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Calculator,
  Lightbulb,
  Target,
  Plus,
  Minus,
  Edit3,
} from "lucide-react"

interface BudgetCategory {
  id: string
  name: string
  allocated: number
  spent: number
  color: string
  icon: any
}

interface Expense {
  id: string
  category: string
  amount: number
  description: string
  date: string
  type: "planned" | "actual"
}

interface BudgetTrackerProps {
  totalBudget?: number
  itineraryCost?: number
}

export function BudgetTracker({ totalBudget = 2000, itineraryCost = 0 }: BudgetTrackerProps) {
  const [categories, setCategories] = useState<BudgetCategory[]>([
    { id: "1", name: "Transportation", allocated: 600, spent: 450, color: "bg-chart-1", icon: "✈️" },
    { id: "2", name: "Accommodation", allocated: 800, spent: 720, color: "bg-chart-2", icon: "🏨" },
    { id: "3", name: "Food & Dining", allocated: 400, spent: 280, color: "bg-chart-3", icon: "🍽️" },
    { id: "4", name: "Activities", allocated: 300, spent: 150, color: "bg-chart-4", icon: "🎯" },
    { id: "5", name: "Shopping", allocated: 200, spent: 85, color: "bg-chart-5", icon: "🛍️" },
    { id: "6", name: "Emergency", allocated: 200, spent: 0, color: "bg-muted", icon: "🚨" },
  ])

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      category: "Transportation",
      amount: 450,
      description: "Flight tickets",
      date: "2024-01-15",
      type: "actual",
    },
    {
      id: "2",
      category: "Accommodation",
      amount: 720,
      description: "Hotel booking",
      date: "2024-01-16",
      type: "actual",
    },
    {
      id: "3",
      category: "Food & Dining",
      amount: 280,
      description: "Restaurant meals",
      date: "2024-01-17",
      type: "actual",
    },
  ])

  const [newExpense, setNewExpense] = useState({
    category: "",
    amount: "",
    description: "",
  })

  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0)
  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0)
  const remaining = totalBudget - totalSpent
  const budgetUtilization = (totalSpent / totalBudget) * 100

  const addExpense = () => {
    if (newExpense.category && newExpense.amount && newExpense.description) {
      const expense: Expense = {
        id: Date.now().toString(),
        category: newExpense.category,
        amount: Number.parseFloat(newExpense.amount),
        description: newExpense.description,
        date: new Date().toISOString().split("T")[0],
        type: "actual",
      }

      setExpenses([...expenses, expense])

      // Update category spent amount
      setCategories((cats) =>
        cats.map((cat) => (cat.name === newExpense.category ? { ...cat, spent: cat.spent + expense.amount } : cat)),
      )

      setNewExpense({ category: "", amount: "", description: "" })
    }
  }

  const getBudgetStatus = (allocated: number, spent: number) => {
    const percentage = (spent / allocated) * 100
    if (percentage >= 90) return { status: "danger", color: "text-red-500", icon: AlertTriangle }
    if (percentage >= 75) return { status: "warning", color: "text-yellow-500", icon: AlertTriangle }
    return { status: "good", color: "text-green-500", icon: CheckCircle2 }
  }

  const optimizationTips = [
    {
      category: "Transportation",
      tip: "Book flights 6-8 weeks in advance for better deals",
      savings: "$50-150",
    },
    {
      category: "Accommodation",
      tip: "Consider vacation rentals for longer stays",
      savings: "$30-80/night",
    },
    {
      category: "Food & Dining",
      tip: "Mix fine dining with local street food",
      savings: "$20-40/day",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold text-primary">${totalBudget.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Spent</p>
                <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold text-blue-500">${remaining.toLocaleString()}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilization</p>
                <p className="text-2xl font-bold text-orange-500">{budgetUtilization.toFixed(0)}%</p>
              </div>
              <PieChart className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Budget Progress
          </CardTitle>
          <CardDescription>Track your spending across different categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Budget</span>
              <span className="text-sm text-muted-foreground">
                ${totalSpent.toLocaleString()} / ${totalBudget.toLocaleString()}
              </span>
            </div>
            <Progress value={budgetUtilization} className="h-3" />

            {budgetUtilization > 85 && (
              <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                <span>You're approaching your budget limit. Consider optimizing expenses.</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="optimize">Optimize</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4">
            {categories.map((category) => {
              const status = getBudgetStatus(category.allocated, category.spent)
              const percentage = (category.spent / category.allocated) * 100

              return (
                <Card key={category.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center text-white font-semibold`}
                        >
                          {category.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ${category.spent} / ${category.allocated}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <status.icon className={`w-4 h-4 ${status.color}`} />
                        <Badge
                          variant={
                            status.status === "danger"
                              ? "destructive"
                              : status.status === "warning"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {percentage.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Remaining: ${(category.allocated - category.spent).toLocaleString()}</span>
                      <span>{(100 - percentage).toFixed(0)}% left</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          {/* Add Expense Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Expense
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="What did you spend on?"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addExpense} className="w-full">
                    Add Expense
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expense List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.category} • {expense.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">${expense.amount}</span>
                      <Button variant="ghost" size="sm">
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimize" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Smart Budget Optimization
              </CardTitle>
              <CardDescription>AI-powered tips to save money on your trip</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationTips.map((tip, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{tip.category}</Badge>
                          <Badge variant="secondary" className="text-green-600 bg-green-50">
                            Save {tip.savings}
                          </Badge>
                        </div>
                        <p className="text-sm">{tip.tip}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Apply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget Reallocation Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Move $50 from Emergency to Activities</p>
                    <p className="text-sm text-muted-foreground">You have unused emergency funds</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Apply
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Reduce Food budget by $100</p>
                    <p className="text-sm text-muted-foreground">Based on your spending pattern</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Minus className="w-3 h-3 mr-1" />
                    Apply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
