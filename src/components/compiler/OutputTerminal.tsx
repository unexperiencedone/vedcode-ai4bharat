"use client";

import { motion } from "framer-motion";
import { Terminal as TerminalIcon, Loader2 } from "lucide-react";

interface OutputTerminalProps {
  output: any;
  isLoading: boolean;
  customInput: string;
  setCustomInput: (val: string) => void;
}

const OutputTerminal = ({
  output,
  isLoading,
  customInput,
  setCustomInput,
}: OutputTerminalProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-panel rounded-xl flex flex-col min-h-0 border border-white/10 bg-[#0f172a]/80"
    >
      {/* Terminal Header */}
      <div className="bg-[#1e293b] border-b border-white/10 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-300">
          <TerminalIcon size={18} className="text-neon-blue" />
          <span className="font-semibold tracking-wide text-sm">Terminal</span>
        </div>
        {isLoading && (
          <Loader2 size={16} className="animate-spin text-neon-blue" />
        )}
      </div>

      {/* Terminal Content Box */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto gap-4">
        {/* Custom Input Section */}
        <div className="w-full">
          <label className="text-xs font-semibold text-gray-400 mb-1 block uppercase tracking-wider">
            Custom Input (stdin)
          </label>
          <textarea
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="w-full h-24 bg-[#1e293b]/70 border border-white/5 rounded-lg p-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-neon-purple text-gray-300 resize-none placeholder-gray-600 transition-all"
            placeholder="Type your input here..."
          />
        </div>

        {/* Output Section */}
        <div className="flex-1 min-h-[150px] bg-black/40 rounded-lg border border-white/5 p-4 font-mono text-sm shadow-inner relative overflow-y-auto w-full max-w-full">
          {isLoading ? (
            <div className="flex items-center gap-3 text-neon-blue h-full justify-center">
              <Loader2 className="animate-spin" size={24} />
              <span>Executing...</span>
            </div>
          ) : output ? (
            output.run?.code !== 0 ? (
              <div className="text-red-400 whitespace-pre-wrap break-words max-w-full">
                {output.run?.stderr ||
                  output.run?.output ||
                  "Execution Failed without error message."}
              </div>
            ) : (
              <div className="text-green-400 whitespace-pre-wrap break-words max-w-full">
                {output.run?.stdout ||
                  "Program finished successfully. No output."}
              </div>
            )
          ) : (
            <div className="text-gray-600 h-full flex items-center justify-center italic">
              Click &quot;Run Code&quot; to see the output here
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OutputTerminal;
