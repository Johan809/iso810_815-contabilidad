
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Package, 
  CheckSquare, 
  Folders, 
  ArrowRight, 
  TrendingUp,
  BarChart3,
  UserPlus
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const StatCard = ({ title, value, icon, trend, description, className }) => (
  <Card className={`overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}>
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="bg-primary/10 text-primary p-2 rounded-full">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
        {trend === 'up' ? (
          <TrendingUp className="h-3 w-3 text-green-500" />
        ) : (
          <TrendingUp className="h-3 w-3 text-red-500 transform rotate-180" />
        )}
        {description}
      </p>
    </CardContent>
  </Card>
);

const ModuleCard = ({ title, description, icon, href, count }) => (
  <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="bg-primary/10 text-primary p-2 rounded-full">{icon}</div>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="mt-2 text-2xl font-bold">{count}</div>
    </CardContent>
    <CardFooter className="pt-0">
      <Link to={href} className="w-full">
        <Button variant="ghost" className="w-full justify-between">
          <span>Manage {title}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </CardFooter>
  </Card>
);

const Index = () => {
  // Mock data
  const stats = [
    {
      title: "Total Users",
      value: "2,845",
      icon: <Users className="h-4 w-4" />,
      trend: "up",
      description: "12% increase from last month",
    },
    {
      title: "Active Products",
      value: "574",
      icon: <Package className="h-4 w-4" />,
      trend: "up",
      description: "8% increase from last month",
    },
    {
      title: "Pending Tasks",
      value: "149",
      icon: <CheckSquare className="h-4 w-4" />,
      trend: "down",
      description: "3% decrease from last month",
    },
    {
      title: "Current Projects",
      value: "24",
      icon: <Folders className="h-4 w-4" />,
      trend: "up",
      description: "2 new projects this month",
    },
  ];

  const modules = [
    {
      title: "Users",
      description: "Manage user accounts and permissions",
      icon: <Users className="h-4 w-4" />,
      href: "/users",
      count: "2,845",
    },
    {
      title: "Products",
      description: "Inventory and product management",
      icon: <Package className="h-4 w-4" />,
      href: "/products",
      count: "574",
    },
    {
      title: "Tasks",
      description: "Track and manage tasks",
      icon: <CheckSquare className="h-4 w-4" />,
      href: "/tasks",
      count: "149",
    },
    {
      title: "Projects",
      description: "Oversee project progress",
      icon: <Folders className="h-4 w-4" />,
      href: "/projects",
      count: "24",
    },
  ];

  const recentActivity = [
    { id: 1, action: "New user registered", user: "John Smith", time: "Just now" },
    { id: 2, action: "Product updated", user: "Sarah Chen", time: "2 hours ago" },
    { id: 3, action: "Task completed", user: "Michael Brown", time: "5 hours ago" },
    { id: 4, action: "New project created", user: "Aya Nakamura", time: "Yesterday" },
    { id: 5, action: "User role updated", user: "Carlos Mendez", time: "Yesterday" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your system's performance and recent activity.</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StatCard
              key={stat.title}
              {...stat}
              className={`animate-scale-in`}
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight">Management Modules</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {modules.map((module, i) => (
            <ModuleCard
              key={module.title}
              {...module}
              className={`animate-scale-in`}
              style={{ animationDelay: `${(i + stats.length) * 100}ms` }}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="animate-scale-in" style={{ animationDelay: '800ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div 
                  key={activity.id} 
                  className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0 animate-fade-in"
                  style={{ animationDelay: `${900 + (i * 100)}ms` }}
                >
                  <div className="bg-primary/10 text-primary h-8 w-8 rounded-full flex items-center justify-center">
                    {activity.user.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>{activity.user}</span>
                      <span className="mx-2">•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-scale-in" style={{ animationDelay: '900ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <div className="text-center space-y-2 text-muted-foreground">
              <BarChart3 className="h-10 w-10 mx-auto" />
              <p>Analytics visualization would go here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
