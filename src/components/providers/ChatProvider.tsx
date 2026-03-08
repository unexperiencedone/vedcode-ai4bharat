"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from "next-auth/react";
import { 
  getChatSessions, 
  getChatSessionMessages, 
  createChatSession, 
  saveChatMessage 
} from "@/lib/actions/chatActions";
import { ReasoningContext } from "@/lib/types/tutor";

interface Message {
  id: string;
  role: "user" | "tutor";
  content: string;
  contextUsed?: ReasoningContext;
}

interface PageContext {
  searchKeyword?: string;
  activeSymbol?: string;
  [key: string]: any;
}

interface ChatContextType {
  messages: Message[];
  sessions: any[];
  currentSessionId: string | null;
  isThinking: boolean;
  isLoading: boolean;
  pageContext: PageContext;
  setPageContext: (context: PageContext) => void;
  sendMessage: (content: string, pathname: string, getTutorReasoning: any) => Promise<void>;
  switchSession: (sessionId: string) => Promise<void>;
  createNewSession: (title?: string) => Promise<void>;
  initializeChat: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [pageContext, setPageContext] = useState<PageContext>({});
  const [isThinking, setIsThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // The internal profiles.id (DB primary key) — NOT user.id which is auth_id
  const [internalProfileId, setInternalProfileId] = useState<string | null>(null);

  const initializeChat = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Step 1: resolve auth session → internal profiles.id
      const profileRes = await fetch("/api/profile/me");
      if (!profileRes.ok) {
        console.error("Could not resolve internal profile ID");
        return;
      }
      const profileData = await profileRes.json();
      const profileId: string = profileData.id;
      setInternalProfileId(profileId);

      // Step 2: use internal profileId for all chat operations
      const allSessions = await getChatSessions(profileId);
      setSessions(allSessions);
      
      let activeSession;
      if (allSessions.length > 0) {
        activeSession = allSessions[0];
      } else {
        activeSession = await createChatSession(profileId, "Main Chat");
        setSessions([activeSession]);
      }

      setCurrentSessionId(activeSession.id);
      const history = await getChatSessionMessages(activeSession.id);
      
      if (history.length > 0) {
        setMessages(history.map(m => ({
          id: m.id,
          role: m.role as any,
          content: m.content
        })));
      } else {
        setMessages([
          {
            id: "init",
            role: "tutor",
            content: "Hi. I'm your engineering mentor. I'm connected to your codebase graph and your learning profile. How can we improve this code today?",
          }
        ]);
      }
    } catch (error) {
      console.error("Failed to initialize chat session:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      initializeChat();
    }
  }, [user?.id, initializeChat]);

  const switchSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const history = await getChatSessionMessages(sessionId);
      setCurrentSessionId(sessionId);
      setMessages(history.map(m => ({
        id: m.id,
        role: m.role as any,
        content: m.content
      })));
    } catch (error) {
      console.error("Failed to switch session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = async (title?: string) => {
    if (!internalProfileId) return;
    setIsLoading(true);
    try {
      const newSession = await createChatSession(internalProfileId, title || `Chat ${sessions.length + 1}`);
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setMessages([
        {
          id: "init",
          role: "tutor",
          content: "Starting a new conversation. How can I help you with your code?",
        }
      ]);
    } catch (error) {
      console.error("Failed to create new session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, pathname: string, getTutorReasoning: any) => {
    if (!content.trim() || isThinking || !currentSessionId || !internalProfileId) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content,
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    // Persist user message
    saveChatMessage(currentSessionId, internalProfileId, "user", content);

    try {
      const context = await getTutorReasoning(content, pathname, internalProfileId, pageContext);

      const tutorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "tutor",
        content: context.systemReasoning,
        contextUsed: context,
      };

      setMessages((prev) => [...prev, tutorMsg]);
      
      // Persist tutor message
      saveChatMessage(currentSessionId, internalProfileId, "tutor", tutorMsg.content);
    } catch (error) {
      console.error("Tutor reasoning failed:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "tutor",
        content: "I'm having trouble connecting to my reasoning core. Let me try again soon.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      sessions,
      currentSessionId, 
      isThinking, 
      isLoading,
      pageContext,
      setPageContext,
      sendMessage,
      switchSession,
      createNewSession,
      initializeChat
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
