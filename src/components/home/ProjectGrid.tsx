"use client"

import * as React from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List, Plus, Activity } from "lucide-react"

export function ProjectGrid() {
  return (
    <div className="flex flex-1 relative flex-col lg:flex-row">
      {/* Sidebar Filter (Sticky) */}
      <aside className="w-full lg:w-64 border-r border-border/10 bg-background lg:min-h-screen">
        <div className="sticky top-20 p-6">
          <div className="mb-8">
            <h4 className="text-xs font-mono uppercase text-muted-foreground mb-4 tracking-widest">Tech Stack</h4>
            <div className="space-y-2">
              {["React / Next.js", "Rust / WASM", "WebGL", "Tailwind CSS"].map((tech) => (
                <label key={tech} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary cursor-pointer group transition-colors">
                  <div className="w-4 h-4 border border-muted-foreground/30 rounded bg-transparent group-hover:border-primary flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {tech}
                </label>
              ))}
            </div>
          </div>
          
          <div className="mb-8">
            <h4 className="text-xs font-mono uppercase text-muted-foreground mb-4 tracking-widest">Category</h4>
            <div className="flex flex-wrap gap-2">
              {["FinTech", "Healthcare", "E-comm", "Social"].map((cat) => (
                <Badge key={cat} variant="outline" className="cursor-pointer hover:border-primary hover:text-primary transition-colors bg-transparent font-normal">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Mini Activity Feed */}
          <div className="border-t border-border/10 pt-6 mt-6">
            <h4 className="text-xs font-mono uppercase text-muted-foreground mb-4 tracking-widest flex items-center gap-2">
              <Activity className="w-3 h-3" /> Recent Activity
            </h4>
            <ul className="space-y-4 font-mono text-xs">
              <li className="flex gap-3 text-muted-foreground">
                <span className="text-primary">&gt;</span>
                <div>
                  <span className="text-foreground">sarah_j</span> pushed to <span className="text-foreground/80">fintech-dash</span>
                  <div className="text-muted-foreground/60 mt-0.5">2m ago</div>
                </div>
              </li>
              <li className="flex gap-3 text-muted-foreground">
                <span className="text-primary">&gt;</span>
                <div>
                    <span className="text-foreground">alex_dev</span> merged PR <span className="text-primary">#402</span>
                    <div className="text-muted-foreground/60 mt-0.5">15m ago</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 bg-muted/5">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/10 bg-background/50 backdrop-blur-sm sticky top-16 z-40">
          <div className="text-sm font-medium text-muted-foreground">Showing <span className="text-foreground">All Projects</span></div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-r border-border/10 pr-4">
               <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground"><LayoutGrid className="w-4 h-4" /></Button>
               <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><List className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Project Cards */}
            <ProjectCard 
                title="Alpha Analytics"
                version="v1.4"
                description="Enterprise-grade data visualization tool for large-scale datasets using WebGL acceleration."
                tech="React"
                updated="2h ago"
                image="https://lh3.googleusercontent.com/aida-public/AB6AXuDgFBvZjoBpL8pRUhea_7ySGb_sZOecCIz2ipXVq63b-xMYgPfL8tlQi9AlsgAKYS0x2KpyDZbahfercKEf9gcJn8lFplIsLOFELuKRS_IMmAVNtacM9AYS30UUEhSejq1JjNSS21h-YjmB8orMV1Z-r_EcJtxt6SLuQKqQ5i5YyklmzQ_66RDmcmre5SDPe0nNIZYpFvNYqNQZzOp8VJ6boqGpUSnw1hhwUPLIfix5IJd-0cb0Rs4qixROjra7X8Z6lM486KQXNbSM"
            />
            <ProjectCard 
                title="Cipher Keep"
                version="v2.0"
                description="Decentralized password management solution built on top of the Ethereum blockchain."
                tech="Solidity"
                updated="1d ago"
                image="https://lh3.googleusercontent.com/aida-public/AB6AXuCNDnWFOsvZbVPDaNlJ13WeG7v3TotBMY6sejVP_ZrVOooI2bxPmGOLvGSCsrE-AiH4Tq8td1wRMfncXg-ymlRekMazdHEE09XdKH8EFgeH-cAttnYLcRctXWGQUkgojtCsN9t6E8_hyqfBjhyZdiXz2_aK9KkvU8TwfqLw6dsZb5WnlenOfnbXqxApQlGrYEk54fOsXhWgJX2e-ETnloW8-BziHHgqp0n3rNJKuxgYyRInF2wk3R9KomPR_HjUpMhy7nie-GSZ-XZb"
            />
            <ProjectCard 
                title="Retro Arcade"
                version="v0.9"
                description="A collection of JS-based emulator cores running directly in the browser with zero latency."
                tech="WASM"
                updated="3d ago"
                image="https://lh3.googleusercontent.com/aida-public/AB6AXuAeCD2XJ0-Bfm_XgCXy5-SFlXerK-pK3QofqAZvL779PCBE7iTB-qxS8wjl_pCOd8d1A-cpzXNgbMSlRwT2MsweexmJGBacIqnaSLrsIT90KCUINJ2SdR54g4dV5p-MnVNv9nM-wnPCl9i3MoyXldwtxcGXdW_NmuGUStkSagUKxXVAG37MYTixTU85JZaifV_0ABAPm-tES7Aea50KL7_jeFJy-vh7xMRekVTK9Dm0_c_SocVFF93hbFjvOdLAlVvS0XDk_zOuN2xS"
            />
             <ProjectCard 
                title="Meta Space"
                version="v3.1"
                description="VR collaboration rooms for remote teams. Spatial audio and low-latency rendering."
                tech="Three.js"
                updated="1w ago"
                image="https://lh3.googleusercontent.com/aida-public/AB6AXuAZJFeCSCmpPuhMUL5_dNJNnLN2OhRsQWbjfstjA9gLj3V8clTbyGpE2J-j4wwqIBLcb9f7JfeWPUkTv5oWdpjpMIma-IfUC--DrluPJgUGBBI5xmFE3xIMb7-OHdMAsjeqM7rk3G7e9x0136d4bnhkKlLMuxLL9RnVbJ1UNQn38dZ9Tayc3X0uK_0uqmCT2Dk7cAUZqC74jgK5tg1qoEwxudDozWc3UTXJlakynNbGZ3UDmFytDgALqqcpaqrxCNYy95S5Eocv8edR"
            />
             <ProjectCard 
                title="DevOps CLI"
                version="v1.0"
                description="Unified command line interface for managing cloud infrastructure across AWS and GCP."
                tech="Go"
                updated="2w ago"
                image="https://lh3.googleusercontent.com/aida-public/AB6AXuAGvAypyFv4GnUrpkmcVkFAhSCzYMCZCdO9BJgKWn2OflDG_fLI54P7sAolc3k6zBKR1UOX4CbVBLla5_7qAeuXgM56B4IHJVrOAfuFTalcyYvNk2UhL9IyI2Q9yAyoBhBy_9tMz-aX9jufNqTHZMrvYUPCnv69di3dfVeE1qxTm0HRdCPcDxNAVXyYikZOefxf2EkuuWK9i6LEJjBL3GQbCoUrvid2X-vwpbdRSTixFldRmJt3W3_TPNLqALljAFxVoOVfBo7xLIe1"
            />

            {/* Add New Card */}
            <div className="bg-muted/10 border border-border/20 border-dashed rounded-lg overflow-hidden group hover:border-primary/50 transition-colors duration-300 flex flex-col items-center justify-center min-h-[300px] cursor-pointer hover:bg-muted/20">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-muted-foreground">
                    <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Create New Project</h3>
                <p className="text-sm text-muted-foreground mt-2 text-center max-w-[200px]">Start a new collaborative workspace or import from GitHub.</p>
            </div>
        </div>
      </div>
    </div>
  )
}

interface ProjectCardProps {
    title: string;
    version: string;
    description: string;
    tech: string;
    updated: string;
    image: string;
}

function ProjectCard({ title, version, description, tech, updated, image }: ProjectCardProps) {
    return (
        <Card className="bg-card border-border/10 overflow-hidden group hover:border-primary/50 transition-colors duration-300 flex flex-col h-full rounded-lg">
            <div className="relative h-48 overflow-hidden bg-muted">
                <img src={image} alt={title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
            </div>
            <CardContent className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
                    <span className="text-xs border border-border/20 px-2 py-0.5 rounded text-muted-foreground bg-muted/20">{version}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/10 w-full">
                    <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-muted-foreground/50"></span>
                        <span className="text-xs text-muted-foreground font-mono">{tech}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Updated {updated}</span>
                </div>
            </CardContent>
        </Card>
    )
}
