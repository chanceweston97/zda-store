interface TimeDisplayProps {
  value: number;
  label: string;
}

const TimeDisplay = ({ value, label }: TimeDisplayProps) => (
  <div>
    <span className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2">
      {value < 10 ? `0${value}` : value}
    </span>
    <span className="block text-custom-sm text-dark text-center">{label}</span>
  </div>
);

export default TimeDisplay; 