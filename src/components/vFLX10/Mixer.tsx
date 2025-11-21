import { Slider } from "@/components/ui/slider";
import { Knob } from "./Knob";

const ChannelStrip = ({
  label,
  color,
}: {
  label: string;
  color: "cyan" | "purple";
}) => (
  <div className="flex-1 flex flex-col items-center justify-between py-4 bg-zinc-900/30 rounded-lg border border-zinc-800/50 mx-1">
    <div className="space-y-6 flex flex-col items-center">
      <Knob label="Trim" value={75} size="sm" color="white" />
      <Knob label="High" value={50} color={color} />
      <Knob label="Mid" value={50} color={color} />
      <Knob label="Low" value={50} color={color} />
      <Knob label="Filter" value={50} size="lg" color={color} />
    </div>

    <div className="h-40 flex items-center justify-center w-full px-4 py-4">
      {/* Vertical Volume Fader Simulation */}
      <Slider
        defaultValue={[75]}
        max={100}
        step={1}
        orientation="vertical"
        className="h-full w-12 cursor-grab active:cursor-grabbing"
      />
    </div>
    <span className="text-xs font-bold text-zinc-500">{label}</span>
  </div>
);

export const Mixer = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Channels */}
      <div className="flex-1 flex justify-between gap-2">
        <ChannelStrip label="CH 1" color="cyan" />
        <ChannelStrip label="CH 2" color="purple" />
      </div>

      {/* Crossfader */}
      <div className="h-24 flex flex-col items-center justify-center px-4 border-t border-zinc-800 mt-2 bg-zinc-900/50 rounded-lg">
        <span className="text-[10px] text-zinc-600 uppercase font-bold mb-2">
          Crossfader
        </span>
        <Slider defaultValue={[50]} max={100} step={1} className="w-full" />
        <div className="flex justify-between w-full text-[10px] text-zinc-600 mt-1 px-1">
          <span>A</span>
          <span>B</span>
        </div>
      </div>
    </div>
  );
};
