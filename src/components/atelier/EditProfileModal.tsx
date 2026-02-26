"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Save,
  User,
  Briefcase,
  BookOpen,
  Check,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export function EditProfileModal({
  isOpen,
  onClose,
  data,
}: EditProfileModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<{
    handle: string;
    role: string;
    bio: string;
    location: string;
    twitter: string;
    instagram: string;
    github: string;
    linkedin: string;
    yearsActive: number;
    commitCount: number;
    prCount: number;
    primaryOs: string;
    preferredIde: string;
    hardwareSetup: string;
    themePreference: string;
    codingPhilosophy: string;
    interests: string[];
    hobbies: string[];
    [key: string]: any;
  }>({
    handle: data.profile.handle || "",
    role: data.profile.role || "",
    bio: data.profile.bio || "",
    location: data.profile.location || "",
    twitter: data.profile.twitter || "",
    instagram: data.profile.instagram || "",
    github: data.profile.github || "",
    linkedin: data.profile.linkedin || "",
    yearsActive: data.profile.yearsActive || 0,
    commitCount: data.profile.commitCount || 0,
    prCount: data.profile.prCount || 0,
    primaryOs: data.profile.primaryOs || "",
    preferredIde: data.profile.preferredIde || "",
    hardwareSetup: data.profile.hardwareSetup || "",
    themePreference: data.profile.themePreference || "",
    codingPhilosophy: data.profile.codingPhilosophy || "",
    interests: data.profile.interests || [],
    hobbies: data.profile.hobbies || [],
  });

  const [featuredWorks, setFeaturedWorks] = useState<number[]>(
    data.works.filter((w: any) => w.featured).map((w: any) => w.id),
  );
  const [featuredJournals, setFeaturedJournals] = useState<number[]>(
    data.journals.filter((j: any) => j.featured).map((j: any) => j.id),
  );

  const [newTag, setNewTag] = useState("");
  const [tagType, setTagType] = useState<"interests" | "hobbies">("interests");

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/atelier/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileUpdates: profileData,
          featuredWorks,
          featuredJournals,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Failed to update profile");
        return;
      }

      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (!newTag) return;
    setProfileData((prev) => ({
      ...prev,
      [tagType]: [...(prev[tagType] as string[]), newTag],
    }));
    setNewTag("");
  };

  const removeTag = (type: "interests" | "hobbies", tag: string) => {
    setProfileData((prev) => ({
      ...prev,
      [type]: (prev[type] as string[]).filter((t: string) => t !== tag),
    }));
  };

  const toggleFeaturedWork = (id: number) => {
    setFeaturedWorks((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleFeaturedJournal = (id: number) => {
    setFeaturedJournals((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl bg-[#0d0d0d] border-white/10 text-white overflow-hidden p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-white/5">
          <SheetTitle className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Edit Profile
          </SheetTitle>
          <SheetDescription className="text-slate-500">
            Update your digital identity and feature your best work.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="identity" className="flex-1 flex flex-col">
          <div className="px-6 border-b border-white/5">
            <TabsList className="bg-transparent border-b-0 gap-4">
              <TabsTrigger
                value="identity"
                className="data-[state=active]:bg-white/5"
              >
                Identity
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="data-[state=active]:bg-white/5"
              >
                Stats
              </TabsTrigger>
              <TabsTrigger
                value="arsenal"
                className="data-[state=active]:bg-white/5"
              >
                Arsenal
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="data-[state=active]:bg-white/5"
              >
                Content
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6 pb-24">
              {/* Identity Tab */}
              <TabsContent value="identity" className="space-y-4 m-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Handle
                    </label>
                    <Input
                      value={profileData.handle}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          handle: e.target.value,
                        })
                      }
                      className="bg-white/5 border-white/10 focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Role
                    </label>
                    <Input
                      value={profileData.role}
                      onChange={(e) =>
                        setProfileData({ ...profileData, role: e.target.value })
                      }
                      className="bg-white/5 border-white/10 focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    className="w-full min-h-[100px] bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Location
                  </label>
                  <Input
                    value={profileData.location}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        location: e.target.value,
                      })
                    }
                    className="bg-white/5 border-white/10 focus:border-primary/50"
                  />
                </div>

                <Separator className="bg-white/5" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Twitter
                    </label>
                    <Input
                      value={profileData.twitter}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          twitter: e.target.value,
                        })
                      }
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Instagram
                    </label>
                    <Input
                      value={profileData.instagram}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          instagram: e.target.value,
                        })
                      }
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      GitHub
                    </label>
                    <Input
                      value={profileData.github}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          github: e.target.value,
                        })
                      }
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      LinkedIn
                    </label>
                    <Input
                      value={profileData.linkedin}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          linkedin: e.target.value,
                        })
                      }
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Stats Tab */}
              <TabsContent value="stats" className="space-y-4 m-0">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Years Active
                    </label>
                    <Input
                      type="number"
                      value={profileData.yearsActive}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          yearsActive: parseInt(e.target.value) || 0,
                        })
                      }
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Commit Count
                    </label>
                    <Input
                      type="number"
                      value={profileData.commitCount}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          commitCount: parseInt(e.target.value) || 0,
                        })
                      }
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      PR Count
                    </label>
                    <Input
                      type="number"
                      value={profileData.prCount}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          prCount: parseInt(e.target.value) || 0,
                        })
                      }
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Arsenal Tab */}
              <TabsContent value="arsenal" className="space-y-4 m-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Primary OS
                    </label>
                    <Input
                      value={profileData.primaryOs}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          primaryOs: e.target.value,
                        })
                      }
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Preferred IDE
                    </label>
                    <Input
                      value={profileData.preferredIde}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          preferredIde: e.target.value,
                        })
                      }
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Hardware Setup
                  </label>
                  <Input
                    value={profileData.hardwareSetup}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        hardwareSetup: e.target.value,
                      })
                    }
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Coding Philosophy
                  </label>
                  <Input
                    value={profileData.codingPhilosophy}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        codingPhilosophy: e.target.value,
                      })
                    }
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <Separator className="bg-white/5" />

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    Tags Management
                    <div className="flex bg-white/5 rounded p-0.5">
                      <button
                        type="button"
                        onClick={() => setTagType("interests")}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px]",
                          tagType === "interests"
                            ? "bg-primary text-white"
                            : "text-slate-500",
                        )}
                      >
                        Interests
                      </button>
                      <button
                        type="button"
                        onClick={() => setTagType("hobbies")}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px]",
                          tagType === "hobbies"
                            ? "bg-primary text-white"
                            : "text-slate-500",
                        )}
                      >
                        Hobbies
                      </button>
                    </div>
                  </label>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {(profileData[tagType] as string[]).map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-white/5 hover:bg-white/10 text-slate-300 gap-1 pr-1 border-white/10"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tagType, tag)}
                          className="hover:text-red-400 p-0.5"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder={`Add ${tagType}...`}
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTag()}
                      className="bg-white/5 border-white/10 h-8 text-xs"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={addTag}
                      className="h-8"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6 m-0">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-3 h-3" /> Featured Projects
                  </label>
                  <div className="space-y-2">
                    {data.works.map((work: any) => (
                      <div
                        key={work.id}
                        onClick={() => toggleFeaturedWork(work.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                          featuredWorks.includes(work.id)
                            ? "bg-primary/10 border-primary/30"
                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]",
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">
                            {work.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                            {work.category}
                          </p>
                        </div>
                        {featuredWorks.includes(work.id) && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-3 h-3" /> Featured Articles
                  </label>
                  <div className="space-y-2">
                    {data.journals.map((journal: any) => (
                      <div
                        key={journal.id}
                        onClick={() => toggleFeaturedJournal(journal.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                          featuredJournals.includes(journal.id)
                            ? "bg-primary/10 border-primary/30"
                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]",
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">
                            {journal.title}
                          </h4>
                        </div>
                        {featuredJournals.includes(journal.id) && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>

          <div className="p-6 border-t border-white/5 bg-[#0d0d0d] sticky bottom-0 z-20">
            <Button
              className="w-full h-12 gap-2 text-md font-bold shadow-lg shadow-primary/20"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Save Profile Changes
            </Button>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
