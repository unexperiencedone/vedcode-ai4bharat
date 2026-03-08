"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, AlertCircle, Brain, Rocket, Info, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "system" | "mentor" | "project";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  details?: any;
}

interface NotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: Notification[];
}

export function NotificationDialog({
  open,
  onOpenChange,
  notifications,
}: NotificationDialogProps) {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const systemNotifications = notifications.filter((n) => n.type === "system");
  const mentorNotifications = notifications.filter((n) => n.type === "mentor");
  const projectNotifications = notifications.filter((n) => n.type === "project");

  const renderNotificationList = (list: Notification[], emptyMsg: string) => {
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-4 border border-slate-800">
            <Bell className="w-5 h-5 text-slate-600" />
          </div>
          <p className="text-sm text-slate-500 font-medium">{emptyMsg}</p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {list.map((n) => (
          <button
            key={n.id}
            onClick={() => setSelectedNotification(n)}
            className={cn(
              "w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all hover:bg-white/5 group border border-transparent hover:border-white/10",
              !n.read && "bg-indigo-500/5"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border",
              n.type === "system" && "bg-amber-500/10 border-amber-500/20 text-amber-400",
              n.type === "mentor" && "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
              n.type === "project" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            )}>
              {n.type === "system" && <AlertCircle className="w-5 h-5" />}
              {n.type === "mentor" && <Brain className="w-5 h-5" />}
              {n.type === "project" && <Rocket className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                  {n.title}
                </h5>
                <span className="text-[10px] text-slate-500 font-medium">
                  {formatDistanceToNow(n.timestamp, { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {n.message}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors self-center shrink-0" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] bg-slate-950 border-slate-800 p-0 overflow-hidden gap-0 flex flex-col h-[600px] max-h-[80vh]">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Bell className="w-5 h-5" />
              </div>
              <DialogTitle className="text-xl font-bold text-white tracking-tight">
                Notifications
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-400 text-sm">
              Stay updated with system alerts, mentor insights, and project activities.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0 mt-6">
            <div className="px-6 border-b border-white/5">
              <TabsList className="bg-transparent border-none p-0 h-10 gap-6">
                <TabsTrigger 
                  value="all" 
                  className="bg-transparent border-none data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none p-0 h-full relative rounded-none text-xs font-bold uppercase tracking-widest text-slate-500"
                >
                  All
                  <span className="ml-2 px-1.5 py-0.5 rounded-md bg-slate-900 text-[10px] text-slate-400 border border-slate-800">
                    {notifications.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="system" 
                  className="bg-transparent border-none data-[state=active]:bg-transparent data-[state=active]:text-amber-400 data-[state=active]:shadow-none p-0 h-full relative rounded-none text-xs font-bold uppercase tracking-widest text-slate-500"
                >
                  System
                </TabsTrigger>
                <TabsTrigger 
                  value="mentor" 
                  className="bg-transparent border-none data-[state=active]:bg-transparent data-[state=active]:text-indigo-400 data-[state=active]:shadow-none p-0 h-full relative rounded-none text-xs font-bold uppercase tracking-widest text-slate-500"
                >
                  Mentor
                </TabsTrigger>
                <TabsTrigger 
                  value="project" 
                  className="bg-transparent border-none data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 data-[state=active]:shadow-none p-0 h-full relative rounded-none text-xs font-bold uppercase tracking-widest text-slate-500"
                >
                  Project
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 p-4 px-2 sm:px-4">
              <TabsContent value="all" className="mt-0 outline-none">
                {renderNotificationList(notifications, "No notifications available")}
              </TabsContent>
              <TabsContent value="system" className="mt-0 outline-none">
                {renderNotificationList(systemNotifications, "No system alerts currently")}
              </TabsContent>
              <TabsContent value="mentor" className="mt-0 outline-none">
                {renderNotificationList(mentorNotifications, "No mentor insights yet")}
              </TabsContent>
              <TabsContent value="project" className="mt-0 outline-none">
                {renderNotificationList(projectNotifications, "No project updates")}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!selectedNotification} onOpenChange={(o) => !o && setSelectedNotification(null)}>
        <DialogContent className="sm:max-w-[450px] bg-slate-950 border-slate-800 p-6 shadow-2xl">
          {selectedNotification && (
            <>
              <DialogHeader>
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-6 border shadow-lg",
                  selectedNotification.type === "system" && "bg-amber-500/10 border-amber-500/20 text-amber-400",
                  selectedNotification.type === "mentor" && "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
                  selectedNotification.type === "project" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                )}>
                  {selectedNotification.type === "system" && <AlertCircle className="w-6 h-6" />}
                  {selectedNotification.type === "mentor" && <Brain className="w-6 h-6" />}
                  {selectedNotification.type === "project" && <Rocket className="w-6 h-6" />}
                </div>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <DialogTitle className="text-2xl font-bold text-white tracking-tight">
                    {selectedNotification.title}
                  </DialogTitle>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pb-4 border-b border-white/5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 uppercase tracking-tighter text-[9px]">
                    {selectedNotification.type}
                  </span>
                  <span>•</span>
                  <span>{selectedNotification.timestamp.toLocaleString()}</span>
                </div>
              </DialogHeader>
              
              <div className="mt-6">
                <p className="text-slate-300 text-sm leading-relaxed font-medium">
                  {selectedNotification.message}
                </p>
                
                {selectedNotification.details && (
                  <div className="mt-8 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50">
                    <div className="flex items-center gap-2 mb-3 text-indigo-400 uppercase tracking-widest text-[10px] font-bold">
                       <Info className="w-3.5 h-3.5" />
                       Detailed Context
                    </div>
                    <div className="text-[13px] text-slate-400 font-mono leading-relaxed overflow-x-auto">
                       {typeof selectedNotification.details === 'string' 
                         ? selectedNotification.details 
                         : JSON.stringify(selectedNotification.details, null, 2)}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setSelectedNotification(null)}
                  className="px-6 py-2 rounded-xl bg-slate-100 text-slate-950 text-sm font-bold hover:bg-white transition-all shadow-lg active:scale-95"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
